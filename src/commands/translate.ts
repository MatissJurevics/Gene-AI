/*
    NOTE: This file is currently not in use. It is a work in progress.
    This file is for the aicomp command.
    
    The translate command.
*/
import {
    Editor,
    Notice,
} from "obsidian";
import { parsePayload } from "src/utils/parse";
import { TranslatePrompt } from "src/modals";

export const translate = async (editor: Editor, settings: any, openai: any, app: any) => {
    if (settings.apiKey === "") {
        new Notice("Please set your API key in the settings");
        return;
    }
    const prompt = editor.getSelection();
    
    let language = "english";

    // Use GPT-4 if enabled
    let model:string;
    settings.gpt4Translation ? model = "gpt-4" : model = settings.model;

    new TranslatePrompt(app, async (result) => {
        language = result;
        let message = `Translate the following: ${prompt} into ${language}`;
        new Notice("📖 Translating...");
        let completion;

        if (settings.model === "gpt-3.5-turbo") {
            completion = await openai
                .createChatCompletion({
                    model: model,
                    messages: [
                        {
                            role: "user",
                            content: message,
                        },
                    ],
                    max_tokens: settings.translateTokens,
                    temperature: settings.temperature,
                    stream: true,
                },
                { 
responseType: 'stream',
onDownloadProgress: (progressEvent: any) => {
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
}
                )
                .catch((err: string) => {
                    new Notice(`❗${err}`);
                });
        } else {
            completion = await openai
                .createCompletion({
                    model: settings.model,
                    prompt: message,
                    temperature: settings.temperature,
                    max_tokens: settings.translateTokens,
                })
                .catch((err: string) => {
                    new Notice(`❗${err}`);
                });
        }

        editor.replaceSelection(
            completion.data.choices[0].message.content.trim()
        );
    }).open();
}