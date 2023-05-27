/*
    The summarise command.
*/
import {
    Editor,
    Notice,
} from "obsidian";
import { parsePayload } from "src/utils/parse";


export const summarise = async (editor: Editor, settings: any, openai:any) => {
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
    let message = `Provided context: (which may or may not be relavent) "${context}", Summarise the following: "${prompt}", (use markdown to format your text)`;
    new Notice("📝 Summarising...");

    let completion;

    if (settings.model === "gpt-3.5-turbo" || settings.model === "gpt-4") {
        completion = await openai
            .createChatCompletion({
                model: settings.model,
                messages: [
                    {
                        role: "user",
                        content: message,
                    },
                ],
                max_tokens: settings.summariseTokens,
                temperature: settings.temperature,
                stream: true,
            },
            { 
responseType: 'stream',
onDownloadProgress: (progressEvent: any) => {
    // get the payload
    let payload: string = progressEvent.currentTarget.response;
    // return if the payload is done
    if (payload.includes("[DONE]") || settings.allowStream === false) {
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
                max_tokens: settings.summariseTokens,
            })
            .catch((err: string) => {
                new Notice(`❗${err}`);
            });
        editor.replaceSelection(
            completion.data.choices[0].message.content.trim()
        );
    }
    

    new Notice("Summarised! 🚀");
}

