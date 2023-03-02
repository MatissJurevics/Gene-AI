
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

dotenv.config();
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	apiKey: string;
	summariseTokens: number;
	completionTokens: number;
	elaborateTokens: number;
	modifyTokens: number;
	translateTokens: number;
	temperature: number;
	model: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	apiKey: "",
	summariseTokens: 364,
	completionTokens: 364,
	elaborateTokens: 768,
	modifyTokens: 364,
	translateTokens: 364,
	temperature: 0.7,
	model: "text-davinci-003",
};

export default class GeneAI extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		const configuration = new Configuration({
			apiKey: this.settings.apiKey, // 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
		});
		const openai = new OpenAIApi(configuration);

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "aicomp",
			name: "Complete From Prompt",
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "c" }],

			editorCallback: async (editor: Editor, view: MarkdownView) => {
				// Check if the user has an api key
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
				let message = `Provided context (which may or may not be relavent): "${context}", Complete the following prompt: "${prompt}", (use markdown to format your text)`;
				new Notice("✒️ Writing...");
				const completion = await openai.createCompletion({
					model: this.settings.model,
					prompt: message,
					temperature: this.settings.temperature,
					max_tokens: this.settings.completionTokens,
				}).catch(err => {
					new Notice(`❗${err}`)
				});;

				editor.replaceSelection(completion.data.choices[0].text);
				new Notice("Completed! 🚀");
			},
		});

		this.addCommand({
			id: "summarise",
			name: "Summarise",
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "s" }],
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

				const completion = await openai.createCompletion({
					model: this.settings.model,
					prompt: message,
					temperature: this.settings.temperature,
					max_tokens: this.settings.summariseTokens,
				}).catch(err => {
					new Notice(`❗${err}`)
				});;

				editor.replaceSelection(
					`## Summary\n\n${completion.data.choices[0].text?.trim()}`
				);

				new Notice("Summarised! 🚀");
			},
		});

		this.addCommand({
			id: "translate",
			name: "Translate",
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "t" }],

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
				let language = "english";

				new TranslatePrompt(this.app, async (result) => {
					language = result;
					let message = `Provided context (which may or may not be relavent): "${context}", Translate the following: "${prompt}" into ${language}`;
					new Notice("📖 Translating...");
					const completion = await openai.createCompletion({
						model: this.settings.model,
						prompt: message,
						temperature: this.settings.temperature,
						max_tokens: this.settings.translateTokens,
					}).catch(err => {
						new Notice(`❗${err}`)
					});;

					editor.replaceSelection(
						completion.data.choices[0].text.trim()
					);
				}).open();
			},
		});

		this.addCommand({
			id: "modify",
			name: "Modify",
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "m" }],
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
					const completion = await openai.createCompletion({
						model: this.settings.model,
						prompt: message,
						temperature: this.settings.temperature,
						max_tokens: this.settings.modifyTokens,
					}).catch(err => {
						new Notice(`❗${err}`)
					});;

					editor.replaceSelection(
						completion.data.choices[0].text.trim()
					);
					new Notice("Edited! 🚀");
				}).open();
			},
		});

		this.addCommand({
			id: "elaborate",
			name: "Elaborate",
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "e" }],
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

				const completion = await openai.createCompletion({
					model: this.settings.model,
					prompt: message,
					temperature: this.settings.temperature,
					max_tokens: this.settings.elaborateTokens,
				}).catch(err => {
					new Notice(`❗${err}`)
				});

				editor.replaceSelection(
					`${completion.data.choices[0].text?.trim()}`
				);

				new Notice("Elaborated! 🚀");
			},
		});
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
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

