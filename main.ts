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

const configuration = new Configuration({
	apiKey: "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",
});

const openai = new OpenAIApi(configuration);

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "aicomp",
			name: "AI Completion",
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "c" }],

			editorCallback: async (editor: Editor, view: MarkdownView) => {
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
					model: "text-davinci-003",
					prompt: message,
					temperature: 0.7,
					max_tokens: 350,
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
					model: "text-davinci-003",
					prompt: message,
					temperature: 0.7,
					max_tokens: 364,
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
						model: "text-davinci-003",
						prompt: message,
						temperature: 0.7,
						max_tokens: 364,
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
			id: "edit",
			name: "Edit",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const prompt = editor.getSelection();
				const context = editor
					.getRange(
						{ line: 0, ch: 0 },
						{ line: editor.getCursor("from").line, ch: 0 }
					)
					.trim();
				let message:string;
				
				new EditPrompt(this.app, async (result) => {
					message = `Provided context (which may or may not be relavent): "${context}", Edit the following: "${prompt}" so that the following demand is met: "${result}"`;
					new Notice("Loading...");
					const completion = await openai.createCompletion({
						model: "text-davinci-003",
						prompt: message,
						temperature: 0.7,
						max_tokens: 364,
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
					model: "text-davinci-003",
					prompt: message,
					temperature: 0.7,
					max_tokens: 768,
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

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
