# gemini-cli-vs-code-extension
Markdown as gemini-cli code


https://code.visualstudio.com/api/extension-guides/overview

potential code

```typescript
import * as vscode from 'vscode';

// The specific name for our AI terminals
const TERM_NAME = "*gemini-cli*";

// Style for the "Flash" effect (Lime green, semi-transparent)
const flashDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(50, 205, 50, 0.3)',
    borderRadius: '2px'
});

export function activate(context: vscode.ExtensionContext) {
    console.log('Gemini Tools is active. Beep boop.');

    // --- Status Bar Item ---
    // Sits on the right, judging your open terminal count
    const sbItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    sbItem.command = "gemini-tools.launchTerminal";
    context.subscriptions.push(sbItem);

    // --- Helper: Find or Create the 'Best' Terminal ---
    // 1. Active terminal if it's named *Gemini*
    // 2. Most recently created *Gemini* terminal
    // 3. Create new if requested
    function getGeminiTerminal(createIfMissing: boolean = true): vscode.Terminal | undefined {
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
            return vscode.window.createTerminal({
                name: TERM_NAME,
                shellPath: "gemini" // Change this if you use 'bash -c gemini' etc.
            });
        }
        return undefined;
    }

    // --- Helper: Flash Effect ---
    // Visually highlights what you just sent
    function flashRange(editor: vscode.TextEditor, range: vscode.Range) {
        editor.setDecorations(flashDecorationType, [range]);
        setTimeout(() => editor.setDecorations(flashDecorationType, []), 200);
    }

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

    // --- COMMAND 1: Launch Terminal ---
    let cmdLaunch = vscode.commands.registerCommand('gemini-tools.launchTerminal', () => {
        const term = vscode.window.createTerminal({
            name: TERM_NAME,
            shellPath: "gemini"
        });
        term.show();
    });

    // --- COMMAND 2: Send Subsection ---
    let cmdSendSubsection = vscode.commands.registerCommand('gemini-tools.sendSubsection', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const cursorLine = editor.selection.active.line;
        let startLine = cursorLine;

        // 1. Scan UP for header
        let headerLevel = 0;
        while (startLine >= 0) {
            const match = doc.lineAt(startLine).text.match(/^(#+)\s/);
            if (match) {
                headerLevel = match[1].length;
                break;
            }
            startLine--;
        }
        if (startLine < 0) { startLine = 0; headerLevel = 1; }

        // 2. Scan DOWN for next header of same/higher importance
        let endLine = startLine + 1;
        while (endLine < doc.lineCount) {
            const match = doc.lineAt(endLine).text.match(/^(#+)\s/);
            if (match) {
                if (match[1].length <= headerLevel) break;
            }
            endLine++;
        }

        const range = new vscode.Range(startLine, 0, endLine, 0);
        const text = doc.getText(range);
        const term = getGeminiTerminal();

        if (term && text) {
            term.show(true); // true = preserve editor focus
            term.sendText(text, false); // false = don't hit enter
            flashRange(editor, range);
        }
    });

    // --- COMMAND 3: Send Selection ---
    let cmdSendSelection = vscode.commands.registerCommand('gemini-tools.sendSelection', () => {
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
    let cmdSendEnter = vscode.commands.registerCommand('gemini-tools.sendEnter', () => {
        const term = getGeminiTerminal(false);
        if (term) {
            term.sendText("", true); // true = newline
        } else {
             vscode.window.showErrorMessage("No Gemini terminal open.");
        }
    });

    // --- COMMAND 5: Paste Clipboard (to Editor) ---
    let cmdPaste = vscode.commands.registerCommand('gemini-tools.pasteClipboard', async () => {
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
    let cmdSignalAndPaste = vscode.commands.registerCommand('gemini-tools.signalAndPaste', async () => {
        const term = getGeminiTerminal(); 
        const editor = vscode.window.activeTextEditor;

        // 1. Send "/copy" to terminal
        if (term) {
            term.sendText("/copy", true);
        }

        // 2. Paste to Editor
        if (editor) {
            const text = await vscode.env.clipboard.readText();
            await editor.edit(editBuilder => editBuilder.replace(editor.selection, text));
            
            // Flash the pasted line(s)
            const newPos = editor.selection.end;
            editor.selection = new vscode.Selection(newPos, newPos);
            flashRange(editor, new vscode.Range(newPos.translate(0, -1), newPos));
        }
    });

    // Registration
    context.subscriptions.push(
        cmdLaunch, cmdSendSubsection, cmdSendSelection, 
        cmdSendEnter, cmdPaste, cmdSignalAndPaste, 
        flashDecorationType
    );

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


```
