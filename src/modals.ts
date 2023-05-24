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

// I think the code below may be redundant, but I'm not sure so I'm leaving it here for now
// An idea for an idea prompt modal similar to what notion AI gives you where you can ask the ai to generate ideas for you
export class IdeaPrompt extends Modal {
  result: string;
  onSubmit: (result: string) => void;

  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  // Create a dropdown menu for the user to select whether they want to write a blog post or bullet points
  onOpen() {
    const { contentEl } = this;
    let tempResult = ["", ""];
    contentEl.createEl("h2", { text: "Idea Prompt" });

    new Setting(contentEl)
      .setName("How do you want to write your idea?")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("blog", "A Blog Post about...")
          .addOption("bullet", "Bullet Points About...")
          .onChange((value) => {
            tempResult[0] = value;
          })
      );
    
    // text prompt for the user to enter the topic

    new Setting(contentEl)
      .setName("Topic")
      .addText((text) =>
        text.onChange((value) => {
          tempResult[1] = value;
        }));


    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Submit")
          .setCta()
          .onClick(() => {
            this.close();
            this.result = tempResult[0] + " " + tempResult[1];
            console.log(this.result);
            this.onSubmit(this.result);
          }));
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}