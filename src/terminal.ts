import * as vscode from 'vscode';

export const TERM_NAME = "*gemini-cli*";

export function getGeminiTerminal(createIfMissing: boolean = true): vscode.Terminal | undefined {
    const active = vscode.window.activeTerminal;
    if (active && active.name === TERM_NAME) {
        return active;
    }

    // Reverse array to find the most recent one
    const existing = vscode.window.terminals.slice().reverse().find(t => t.name === TERM_NAME);
    if (existing) {
        return existing;
    }

    if (createIfMissing) {
        const config = vscode.workspace.getConfiguration('geminiCliVsExtension');
        const shellPath = config.get<string>('shellPath') || "gemini";
        return vscode.window.createTerminal({
            name: TERM_NAME,
            shellPath: shellPath
        });
    }
    return undefined;
}
