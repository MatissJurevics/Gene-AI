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
import GeneAI from "../main"

export class SettingTab extends PluginSettingTab {
	plugin: GeneAI;

	constructor(app: App, plugin: GeneAI) {
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
		containerEl.createEl("p", {
			text: "Tokens are used when creating text, the more tokens you use, the more words the AI will be able to write, 1k tokens (~750 words) cost about $0.02. (Note that the price changes with the model used)",
		});

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
			.setDesc(
				"The temperature of the AI, the higher the temperature, the more random the output will be"
			)
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
			.setDesc(
				"The model used for the AI. Different models have different strengths and weaknesses. (Note that the price changes with the model used)"
			)
			.addDropdown((val) =>
				val
					.addOption("text-davinci-003", "DaVinci")
					.addOption("text-curie-001", "Curie")
					.addOption("text-babbage-001", "Babbage")
					.addOption("text-ada-001", "Ada")
					.setValue(this.plugin.settings.model)
					.onChange(async (value: string) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
