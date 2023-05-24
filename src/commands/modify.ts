/*
    NOTE: This file is currently not in use. It is a work in progress.
    This file is for the aicomp command.
    
    The modify command.
*/

import {
    Editor,
    Notice,
} from "obsidian";
import { parsePayload } from "src/utils/parse";
import { EditPrompt } from "src/modals/editPrompt";

export const modify = async (editor: Editor, settings: any, openai: any, app: any) => {
    if (settings.apiKey === "") {
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

    new EditPrompt(app, async (result) => {
        message = `Provided context (which may or may not be relavent): "${context}", Edit the following: "${prompt}" so that the following demand is met: "${result}", (use markdown to format your text)`;
        new Notice("✍️ Editing...");
        let completion;

        if (settings.model === "gpt-3.5-turbo") {
            completion = await openai
                .createChatCompletion({
                    model: settings.model,
                    messages: [
                        {
                            role: "user",
                            content: message,
                        },
                    ],
                    max_tokens: settings.modifyTokens,
                    temperature: settings.temperature,
                    stream: true,
                },
                { 
responseType: 'stream',
onDownloadProgress: (progressEvent:any) => {
    // get the payload
    let payload: string = progressEvent.currentTarget.response;
    // return if the payload is done
    if (payload.includes("[DONE]")) {
        return
    }

    try {
        let content = parsePayload(payload);
        editor.replaceSelection(content);
    } catch (e) {
        console.log(e);
    }
}
})
                .catch((err: string) => {
                    new Notice(`❗${err}`);
                });
        } else {
            completion = await openai
                .createCompletion({
                    model: settings.model,
                    prompt: message,
                    temperature: settings.temperature,
                    max_tokens: settings.modifyTokens,
                })
                .catch((err: string) => {
                    new Notice(`❗${err}`);
                });
        }

        editor.replaceSelection(
            completion.data.choices[0].message.content.trim()
        );
        new Notice("Edited! 🚀");
    }).open();
}