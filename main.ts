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

export default class MyPlugin extends Plugin {
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
				let message = `Provided context (which may or may not be relavent): "${context}", Complete the following prompt: "${prompt}"`;
				new Notice("✒️ Writing...");
				const completion = await openai.createCompletion({
					model: this.settings.model,
					prompt: message,
					temperature: this.settings.temperature,
					max_tokens: this.settings.completionTokens,
				});

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
				console.log(this.settings.apiKey)
				const prompt = editor.getSelection();
				const context = editor
					.getRange(
						{ line: 0, ch: 0 },
						{ line: editor.getCursor("from").line, ch: 0 }
					)
					.trim();
				let message = `Provided context: (which may or may not be relavent) "${context}", Summarise the following: "${prompt}"`;
				new Notice("📝 Summarising...");

				const completion = await openai.createCompletion({
					model: this.settings.model,
					prompt: message,
					temperature: this.settings.temperature,
					max_tokens: this.settings.summariseTokens,
				});

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
					console.log(message);
					new Notice("📖 Translating...");
					const completion = await openai.createCompletion({
						model: this.settings.model,
						prompt: message,
						temperature: this.settings.temperature,
						max_tokens: this.settings.translateTokens,
					});
					console.log(
						`completion: ${completion.data.choices[0].text?.trim()}`
					);

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
					message = `Provided context (which may or may not be relavent): "${context}", Edit the following: "${prompt}" so that the following demand is met: "${result}"`;
					new Notice("Loading...");
					const completion = await openai.createCompletion({
						model: this.settings.model,
						prompt: message,
						temperature: this.settings.temperature,
						max_tokens: this.settings.modifyTokens,
					});

					editor.replaceSelection(completion.data.choices[0].text.trim());
					new Notice("Edited! 🚀");
				}).open();
				
			}
		})
		
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
				let message = `Provided context (which may or may not be relavent): "${context}", Elaborate on the following: "${prompt}"`;
				new Notice("📝 Elaborating...");

				const completion = await openai.createCompletion({
					model: this.settings.model,
					prompt: message,
					temperature: this.settings.temperature,
					max_tokens: this.settings.elaborateTokens,
				});

				editor.replaceSelection(
					`${completion.data.choices[0].text?.trim()}`
				);

				new Notice("Elaborated! 🚀");
			}
		});
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));


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



class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", { text: "Gene 🧬, An AI Assistant" });
		containerEl.createEl("h2", { text: "OpenAI API" });

		new Setting(containerEl)
			.setName("Api Key")
			.setDesc("Your OpenAI API Key")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);
		
		containerEl.createEl("h2", { text: "Tokens" });
		containerEl.createEl("p", { text: "Tokens are used when creating text, the more tokens you use, the more words the AI will be able to write, 1k tokens (~750 words) cost about $0.02. (Note that the price changes with the model used)" });

		new Setting(containerEl)
			.setName("Summarise")
			.setDesc("Tokens used for summarising")
			.addSlider((val) =>
				val
					.setLimits(8, 1024, 8)
					.setValue(this.plugin.settings.summariseTokens)
					.setDynamicTooltip()
					.onChange(async (value: number) => {
						this.plugin.settings.summariseTokens = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Translate")
			.setDesc("Tokens used for translating")
			.addSlider((val) =>
				val
					.setLimits(8, 1024, 8)
					.setValue(this.plugin.settings.translateTokens)
					.setDynamicTooltip()
					.onChange(async (value: number) => {
						this.plugin.settings.translateTokens = value;
						await this.plugin.saveSettings();
					})
			);
		
		new Setting(containerEl)
			.setName("AI Completion")
			.setDesc("Tokens used for AI completion")
			.addSlider((val) =>
				val
					.setLimits(8, 1024, 8)
					.setValue(this.plugin.settings.completionTokens)
					.setDynamicTooltip()
					.onChange(async (value: number) => {
						this.plugin.settings.completionTokens = value;
						await this.plugin.saveSettings();
					})
			);
		
		new Setting(containerEl)
			.setName("Edit")
			.setDesc("Tokens used for editing")
			.addSlider((val) =>
				val
					.setLimits(8, 1024, 8)
					.setValue(this.plugin.settings.modifyTokens)
					.setDynamicTooltip()
					.onChange(async (value: number) => {
						this.plugin.settings.modifyTokens = value;
						await this.plugin.saveSettings();
					})
			);
		
		new Setting(containerEl)
			.setName("Elaborate")
			.setDesc("Tokens used for elaborating")
			.addSlider((val) =>
				val
					.setLimits(8, 1024, 8)
					.setValue(this.plugin.settings.elaborateTokens)
					.setDynamicTooltip()
					.onChange(async (value: number) => {
						this.plugin.settings.elaborateTokens = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h2", { text: "Other" });
		new Setting(containerEl)
			.setName("Temperature")
			.setDesc("The temperature of the AI, the higher the temperature, the more random the output will be")
			.addSlider((val) =>
				val
					.setLimits(0.1, 1, 0.1)
					.setValue(this.plugin.settings.temperature)
					.setDynamicTooltip()
					.onChange(async (value: number) => {
						this.plugin.settings.temperature = value;
						await this.plugin.saveSettings();
					})
			);
		
		new Setting(containerEl)
			.setName("Model")
			.setDesc("The model used for the AI. Different models have different strengths and weaknesses. (Note that the price changes with the model used)")
			.addDropdown((val) =>
				val
					.addOption("text-davinci-003", "Davinci")
					.addOption("text-curie-002", "Curie")
					.addOption("text-babbage-002", "Babbage")
					.addOption("text-ada-002", "Ada")
					.setValue(this.plugin.settings.model)
					.onChange(async (value: string) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
