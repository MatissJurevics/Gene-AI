import { App, Modal, Setting } from "obsidian";

export class TranslatePrompt extends Modal {
    result: string;
    onSubmit: (result: string) => void;
  
    constructor(app: App, onSubmit: (result: string) => void) {
      super(app);
      this.onSubmit = onSubmit;
    }
  
    onOpen() {
      const { contentEl } = this;
  
      contentEl.createEl("div", { cls: "space" });
      new Setting(contentEl)
        .setClass("langText")
        .setName("Language 🚀")
        .addText((text) =>
          text.onChange((value) => {
            this.result = value
          }));
  
      new Setting(contentEl)
        .setClass("submitBtn")
        .addButton((btn) =>
          btn
            .setButtonText("Submit")
            .setCta()
            .onClick(() => {
              this.close();
              this.onSubmit(this.result);
            }));
    }
  
    onClose() {
      let { contentEl } = this;
      contentEl.empty();
    }
  }