import { App, Modal, Setting } from "obsidian";

export class EditPrompt extends Modal {
    result: string;
    onSubmit: (result: string) => void;
  
    constructor(app: App, onSubmit: (result: string) => void) {
      super(app);
      this.onSubmit = onSubmit;
    }
    
    onOpen() {
      const { contentEl } = this;
  
      new Setting(contentEl)
      .setClass("langText")
        .setName("How do you want to Edit the text?")
        .addText((text) =>
          text.onChange((value) => {
            this.result = value
          }));
  
      new Setting(contentEl)
        .addButton((btn) =>
          btn
            .setClass("submitBtn")
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