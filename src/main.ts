// @ts-nocheck

import {
	Editor,
	MarkdownView,
	Notice,
	Plugin,

} from "obsidian";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { SettingTab } from "./settings/settings";
import { completeFromPrompt } from "./commands/aicomp"; 
import { elaborate } from "./commands/elaborate";
import { modify } from "./commands/modify";
import { translate } from "./commands/translate";
import { summarise } from "./commands/summarise";
import { stopStream } from "./commands/stopStream";

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
	allowStream: boolean;
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
	allowStream: true,
};



export default class GeneAI extends Plugin {
	settings: Settings;
	

	async onload() {
		await this.loadSettings();
		
		const configuration = new Configuration({
			apiKey: this.settings.apiKey, 
		});
		const openai = new OpenAIApi(configuration);

		// The Completion command
		this.addCommand({
			id: "aicomp",
			name: "Complete From prompt",

			editorCallback: async (editor: Editor) => completeFromPrompt(editor, this.settings, openai),
		});
		// Command to summarise highlighted content.
		this.addCommand({
			id: "summarise",
			name: "Summarise",
			editorCallback: async (editor: Editor) => summarise(editor, this.settings, openai),
		});
		// Command to translate highlighted content.
		this.addCommand({
			id: "translate",
			name: "Translate",
			editorCallback: async (editor: Editor) => translate(editor, this.settings, openai, this.app)
		});
		// Command to modify highlighted content in a specified way
		this.addCommand({
			id: "modify",
			name: "Modify",
			editorCallback: async (editor: Editor) => modify(editor, this.settings, openai, this.app)
		});
		// Command to elaborate on highlighted content
		this.addCommand({
			id: "elaborate",
			name: "Elaborate",
			editorCallback: async (editor: Editor) => elaborate(editor, this.settings, openai)
		});
		this.addCommand({
			id: "stopStream",
			name: "Stop Stream",
			editorCallback: async (editor: Editor) => stopStream(this.settings)
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
