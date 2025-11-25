import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { getGeminiTerminal, TERM_NAME } from './terminal';

export function activate(context: vscode.ExtensionContext) {
    console.log('Gemini Tools is active. Beep boop.');

    // --- Status Bar Item ---
    const sbItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    sbItem.command = "gemini-cli-vs-code-tools.launchTerminal";
    context.subscriptions.push(sbItem);

    // --- Helper: Update Status Bar ---
    const updateStatusBar = () => {
        const allGeminis = vscode.window.terminals.filter(t => t.name === TERM_NAME);
        const target = getGeminiTerminal(false);

        if (allGeminis.length === 0) {
            sbItem.text = "$(circle-slash) No Gemini";
            sbItem.tooltip = "Click to launch Gemini";
        } else if (target) {
            const index = allGeminis.indexOf(target) + 1;
            sbItem.text = `$(terminal) Target: ${TERM_NAME} (${index}/${allGeminis.length})`;
            sbItem.tooltip = `Targeting instance #${index} of ${allGeminis.length}`;
        }
        sbItem.show();
    };

    // Registration
    registerCommands(context);

    // Listeners
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTerminal(updateStatusBar),
        vscode.window.onDidOpenTerminal(updateStatusBar),
        vscode.window.onDidCloseTerminal(updateStatusBar)
    );

    // Init Status Bar
    updateStatusBar();
}

export function deactivate() {}
