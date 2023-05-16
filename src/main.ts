// @ts-nocheck

import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { TranslatePrompt, EditPrompt } from "./modals";
import { SettingTab } from "./settings/settings";
import { OpenAI } from "openai-streams"

dotenv.config();
// interfaces and default settings for the setting tab
interface Settings {
	apiKey: string;
	summariseTokens: number;
	completionTokens: number;
	elaborateTokens: number;
	modifyTokens: number;
	translateTokens: number;
	temperature: number;
	model: string;
	gpt4Translation: boolean;
}

const DEFAULT_SETTINGS: Settings = {
	apiKey: "",
	summariseTokens: 364,
	completionTokens: 364,
	elaborateTokens: 768,
	modifyTokens: 364,
	translateTokens: 364,
	temperature: 0.7,
	model: "gpt-3.5-turbo",
	gpt4Translation: false,
};

export default class GeneAI extends Plugin {
	settings: Settings;
	

	async onload() {
		await this.loadSettings();
		const configuration = new Configuration({
			apiKey: this.settings.apiKey, // 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
		});
		const openai = new OpenAIApi(configuration);

		// The Completion command
		this.addCommand({
			id: "aicomp",
			name: "Complete From prompt",

			editorCallback: async (editor: Editor, view: MarkdownView) => {
				// Check if the user has an api key
				if (this.settings.apiKey === "") {
					new Notice("Please set your API key in the settings");
					return;
				}
				// Get the prompt from the user selected area
				const prompt = editor.getSelection();

				// Set the context to the text above the prompt
				const context = editor
					.getRange(
						{ line: 0, ch: 0 },
						{ line: editor.getCursor("from").line, ch: 0 }
					)
					.trim();
				
				const currentCursor = editor.getCursor("from").line;	
				// The prompt itself
				let message = `Provided context (which may or may not be relavent): "${context}", Complete the following prompt: "${prompt}", (use markdown to format your text)`;
				// Notice to inform the user that the process is going on
				new Notice("✒️ Writing...");
				let completion;
				
				// The code below contains the original 
				// implementation of the chat completion without streams.
				// This will be replaced in the future
				
				// Check to see if the user is using a chat model
				if (this.settings.model === "gpt-3.5-turbo") {
					completion = await openai
						.createChatCompletion({
							model: this.settings.model,
							messages: [
								{
									role: "user",
									content: message,
								},
							],
							max_tokens: this.settings.completionTokens,
							temperature: this.settings.temperature,
							stream: true,
						}, 
						{ 
			responseType: 'stream',
			onDownloadProgress: (progressEvent) => {
				// get the payload
				let payload: string = progressEvent.currentTarget.response;
				// return if the payload is done
				if (payload.includes("[DONE]")) {
					return
				}

				// Turn the payload into valid JSON	
				const result = payload
				.replace(/data:\s*/g, "")
				.replace(/[\r\n\t]/g, "")
				.split("}{")
				.join("},{");
				  const cleanedJsonString = `[${result}]`;
				
				try {
					let parsed = JSON.parse(cleanedJsonString);
					if (parsed.length === 1) {
						return
					}
					let last = parsed[parsed.length - 1];
					let content = last.choices[0].delta.content;
					editor.replaceSelection(content);
				} catch (e) {
					console.log(e);
				}
			}
		 }
						)
						.catch((err) => {
							new Notice(`❗${err}`);
						});
				
					
				} else {
					completion = await openai
						.createCompletion({
							model: this.settings.model,
							prompt: message,
							temperature: this.settings.temperature,
							max_tokens: this.settings.completionTokens,
						})
						.catch((err) => {
							new Notice(`❗${err}`);
						});
				}

				// Replace selected area with the completion
				editor.replaceSelection(completion.data.choices[0].message.content.trim());
				new Notice("Completed! 🚀");
			},
		});
		// Command to summarise highlighted content.
		this.addCommand({
			id: "summarise",
			name: "Summarise",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (this.settings.apiKey === "") {
					new Notice("Please set your API key in the settings");
					return;
				}
				const prompt = editor.getSelection();
				const context = editor
					.getRange(
						{ line: 0, ch: 0 },
						{ line: editor.getCursor("from").line, ch: 0 }
					)
					.trim();
				let message = `Provided context: (which may or may not be relavent) "${context}", Summarise the following: "${prompt}", (use markdown to format your text)`;
				new Notice("📝 Summarising...");

				let completion;

				if (this.settings.model === "gpt-3.5-turbo") {
					completion = await openai
						.createChatCompletion({
							model: this.settings.model,
							messages: [
								{
									role: "user",
									content: message,
								},
							],
							max_tokens: this.settings.summariseTokens,
							temperature: this.settings.temperature,
							stream: true,
						},
						{ 
			responseType: 'stream',
			onDownloadProgress: (progressEvent) => {
				// get the payload
				let payload: string = progressEvent.currentTarget.response;
				// return if the payload is done
				if (payload.includes("[DONE]")) {
					return
				}

				// Turn the payload into valid JSON	
				const result = payload
				.replace(/data:\s*/g, "")
				.replace(/[\r\n\t]/g, "")
				.split("}{")
				.join("},{");
				  const cleanedJsonString = `[${result}]`;
				
				try {
					let parsed = JSON.parse(cleanedJsonString);
					if (parsed.length === 1) {
						return
					}
					let last = parsed[parsed.length - 1];
					let content = last.choices[0].delta.content;
					editor.replaceSelection(content);
				} catch (e) {
					console.log(e);
				}
			}
		 }
						)
						.catch((err) => {
							new Notice(`❗${err}`);
						});
				} else {
					completion = await openai
						.createCompletion({
							model: this.settings.model,
							prompt: message,
							temperature: this.settings.temperature,
							max_tokens: this.settings.summariseTokens,
						})
						.catch((err) => {
							new Notice(`❗${err}`);
						});
				}
				

				new Notice("Summarised! 🚀");
			},
		});
		// Command to translate highlighted content.
		this.addCommand({
			id: "translate",
			name: "Translate",

			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (this.settings.apiKey === "") {
					new Notice("Please set your API key in the settings");
					return;
				}
				const prompt = editor.getSelection();
				
				let language = "english";

				// Use GPT-4 if enabled
				let model:string;
				this.settings.gpt4Translation ? model = "gpt-4" : model = this.settings.model;

				new TranslatePrompt(this.app, async (result) => {
					language = result;
					let message = `Translate the following: ${prompt} into ${language}`;
					new Notice("📖 Translating...");
					let completion;

					if (this.settings.model === "gpt-3.5-turbo") {
						completion = await openai
							.createChatCompletion({
								model: model,
								messages: [
									{
										role: "user",
										content: message,
									},
								],
								max_tokens: this.settings.translateTokens,
								temperature: this.settings.temperature,
								stream: true,
							},
							{ 
			responseType: 'stream',
			onDownloadProgress: (progressEvent) => {
				// get the payload
				let payload: string = progressEvent.currentTarget.response;
				// return if the payload is done
				if (payload.includes("[DONE]")) {
					return
				}

				// Turn the payload into valid JSON	
				const result = payload
				.replace(/data:\s*/g, "")
				.replace(/[\r\n\t]/g, "")
				.split("}{")
				.join("},{");
				  const cleanedJsonString = `[${result}]`;
				
				try {
					let parsed = JSON.parse(cleanedJsonString);
					if (parsed.length === 1) {
						return
					}
					let last = parsed[parsed.length - 1];
					let content = last.choices[0].delta.content;
					editor.replaceSelection(content);
				} catch (e) {
					console.log(e);
				}
			}
		 }
							)
							.catch((err) => {
								new Notice(`❗${err}`);
							});
					} else {
						completion = await openai
							.createCompletion({
								model: this.settings.model,
								prompt: message,
								temperature: this.settings.temperature,
								max_tokens: this.settings.translateTokens,
							})
							.catch((err) => {
								new Notice(`❗${err}`);
							});
					}

					editor.replaceSelection(
						completion.data.choices[0].message.content.trim()
					);
				}).open();
			},
		});
		// Command to modify highlighted content in a specified way
		this.addCommand({
			id: "modify",
			name: "Modify",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (this.settings.apiKey === "") {
					new Notice("Please set your API key in the settings");
					return;
				}
				const prompt = editor.getSelection();
				const context = editor
					.getRange(
						{ line: 0, ch: 0 },
						{ line: editor.getCursor("from").line, ch: 0 }
					)
					.trim();
				let message: string;

				new EditPrompt(this.app, async (result) => {
					message = `Provided context (which may or may not be relavent): "${context}", Edit the following: "${prompt}" so that the following demand is met: "${result}", (use markdown to format your text)`;
					new Notice("✍️ Editing...");
					let completion;

					if (this.settings.model === "gpt-3.5-turbo") {
						completion = await openai
							.createChatCompletion({
								model: this.settings.model,
								messages: [
									{
										role: "user",
										content: message,
									},
								],
								max_tokens: this.settings.modifyTokens,
								temperature: this.settings.temperature,
								stream: true,
							},
							{ 
			responseType: 'stream',
			onDownloadProgress: (progressEvent) => {
				// get the payload
				let payload: string = progressEvent.currentTarget.response;
				// return if the payload is done
				if (payload.includes("[DONE]")) {
					return
				}

				// Turn the payload into valid JSON	
				const result = payload
				.replace(/data:\s*/g, "")
				.replace(/[\r\n\t]/g, "")
				.split("}{")
				.join("},{");
				  const cleanedJsonString = `[${result}]`;
				
				try {
					let parsed = JSON.parse(cleanedJsonString);
					if (parsed.length === 1) {
						return
					}
					let last = parsed[parsed.length - 1];
					let content = last.choices[0].delta.content;
					editor.replaceSelection(content);
				} catch (e) {
					console.log(e);
				}
			}
		 })
							.catch((err) => {
								new Notice(`❗${err}`);
							});
					} else {
						completion = await openai
							.createCompletion({
								model: this.settings.model,
								prompt: message,
								temperature: this.settings.temperature,
								max_tokens: this.settings.modifyTokens,
							})
							.catch((err) => {
								new Notice(`❗${err}`);
							});
					}

					editor.replaceSelection(
						completion.data.choices[0].message.content.trim()
					);
					new Notice("Edited! 🚀");
				}).open();
			},
		});
		// Command to elaborate on highlighted content
		this.addCommand({
			id: "elaborate",
			name: "Elaborate",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const prompt = editor.getSelection();
				const context = editor
					.getRange(
						{ line: 0, ch: 0 },
						{ line: editor.getCursor("from").line, ch: 0 }
					)
					.trim();
				let message = `Provided context (which may or may not be relavent): "${context}", Elaborate on the following: "${prompt}", (use markdown to format your text)`;
				new Notice("📝 Elaborating...");

				let completion;
				
				if (this.settings.model === "gpt-3.5-turbo") {
					completion = await openai
						.createChatCompletion({
							model: this.settings.model,
							messages: [
								{
									role: "user",
									content: message,
								},
							],
							max_tokens: this.settings.elaborateTokens,
							temperature: this.settings.temperature,
							stream: true,
						},
						{ 
			responseType: 'stream',
			onDownloadProgress: (progressEvent) => {
				// get the payload
				let payload: string = progressEvent.currentTarget.response;
				// return if the payload is done
				if (payload.includes("[DONE]")) {
					return
				}

				// Turn the payload into valid JSON	
				const result = payload
				.replace(/data:\s*/g, "")
				.replace(/[\r\n\t]/g, "")
				.split("}{")
				.join("},{");
				  const cleanedJsonString = `[${result}]`;
				
				try {
					let parsed = JSON.parse(cleanedJsonString);
					if (parsed.length === 1) {
						return
					}
					let last = parsed[parsed.length - 1];
					let content = last.choices[0].delta.content;
					editor.replaceSelection(content);
				} catch (e) {
					console.log(e);
				}
			}
		 })
						.catch((err) => {
							new Notice(`❗${err}`);
						});
				} else {
					completion = await openai.createCompletion({
						model: this.settings.model,
						prompt: message,
						temperature: this.settings.temperature,
						max_tokens: this.settings.elaborateTokens,
					}).catch(err => {
						new Notice(`❗${err}`)
					});;
				}

				editor.replaceSelection(
					`${completion.data.choices[0].message.content.trim()}`
				);

				new Notice("Elaborated! 🚀");
			},
		});
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
