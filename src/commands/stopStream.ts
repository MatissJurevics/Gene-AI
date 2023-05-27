import { Notice } from "obsidian";

export const stopStream = (settings: any) => {
    if (settings.allowStream) {
        settings.allowStream = false;
        new Notice("🛑 Stopped Stream");
    }
}