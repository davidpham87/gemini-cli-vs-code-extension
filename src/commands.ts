import * as vscode from 'vscode';
import { getGeminiTerminal, TERM_NAME } from './terminal';
import { findSubsectionRangeLike } from './textUtils';

// Style for the "Flash" effect (Lime green, semi-transparent)
const flashDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(50, 205, 50, 0.3)',
    borderRadius: '2px'
});

function flashRange(editor: vscode.TextEditor, range: vscode.Range) {
    editor.setDecorations(flashDecorationType, [range]);
    setTimeout(() => editor.setDecorations(flashDecorationType, []), 200);
}

export function registerCommands(context: vscode.ExtensionContext) {
    // --- COMMAND 1: Launch Terminal ---
    let cmdLaunch = vscode.commands.registerCommand('gemini-cli-vs-code-tools.launchTerminal', () => {
        const config = vscode.workspace.getConfiguration('geminiCliVsExtension');
        const shellPath = config.get<string>('shellPath') || "gemini";
        const term = vscode.window.createTerminal({
            name: TERM_NAME,
            shellPath: shellPath
        });
        term.show();
    });

    // --- COMMAND 2: Send Subsection ---
    let cmdSendSubsection = vscode.commands.registerCommand('gemini-cli-vs-code-tools.sendSubsection', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const cursorLine = editor.selection.active.line;

        const rangeLike = findSubsectionRangeLike(doc, cursorLine);
        const range = new vscode.Range(rangeLike.startLine, rangeLike.startChar, rangeLike.endLine, rangeLike.endChar);
        const text = doc.getText(range);
        const term = getGeminiTerminal();

        if (term && text) {
            term.show(true); // true = preserve editor focus
            term.sendText(text, false); // false = don't hit enter
            flashRange(editor, range);
        }
    });

    // --- COMMAND 3: Send Selection ---
    let cmdSendSelection = vscode.commands.registerCommand('gemini-cli-vs-code-tools.sendSelection', () => {
        const editor = vscode.window.activeTextEditor;
        const term = getGeminiTerminal();

        if (term && editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            if (text) {
                term.show(true);
                term.sendText(text, false);
                flashRange(editor, selection);
            } else {
                vscode.window.showInformationMessage("Select something first.");
            }
        }
    });

    // --- COMMAND 4: Send Enter ---
    let cmdSendEnter = vscode.commands.registerCommand('gemini-cli-vs-code-tools.sendEnter', () => {
        const term = getGeminiTerminal(false);
        if (term) {
            term.sendText("", true); // true = newline
        } else {
             vscode.window.showErrorMessage("No Gemini terminal open.");
        }
    });

    // --- COMMAND 5: Paste Clipboard (to Editor) ---
    let cmdPaste = vscode.commands.registerCommand('gemini-cli-vs-code-tools.pasteClipboard', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        try {
            const text = await vscode.env.clipboard.readText();
            await editor.edit(editBuilder => editBuilder.replace(editor.selection, text));
            // Move cursor to end
            const newPos = editor.selection.end;
            editor.selection = new vscode.Selection(newPos, newPos);
        } catch (e) { console.error(e); }
    });

    // --- COMMAND 6: Signal /copy and Paste ---
    let cmdSignalAndPaste = vscode.commands.registerCommand('gemini-cli-vs-code-tools.signalAndPaste', async () => {
        const term = getGeminiTerminal();
        const editor = vscode.window.activeTextEditor;

        // 1. Send "/copy" to terminal
        if (term) {
            term.sendText("/copy", true);
        }

        // 2. Paste to Editor
        if (editor) {
            // Wait a bit for the terminal/CLI to update the clipboard
            await new Promise(resolve => setTimeout(resolve, 1000));

            const text = await vscode.env.clipboard.readText();
            await editor.edit(editBuilder => editBuilder.replace(editor.selection, text));

            // Flash the pasted line(s)
            const newPos = editor.selection.end;
            editor.selection = new vscode.Selection(newPos, newPos);
            flashRange(editor, new vscode.Range(newPos.translate(0, -1), newPos));
        }
    });

    context.subscriptions.push(
        cmdLaunch, cmdSendSubsection, cmdSendSelection,
        cmdSendEnter, cmdPaste, cmdSignalAndPaste,
        flashDecorationType
    );
}
