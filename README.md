# Gemini CLI VS Extension

A VS Code extension to integrate Gemini CLI (or any compatible CLI tool) with the editor for a seamless workflow.

## Features

- **Launch Terminal**: Launch a dedicated terminal for Gemini CLI.
- **Send Selection**: Send the currently selected text in the editor to the Gemini terminal.
- **Send Subsection**: Send the current Markdown subsection (based on headers) to the terminal.
- **Send Enter**: Send an "Enter" key press to the terminal.
- **Paste to Editor**: Paste the content of the clipboard into the editor.
- **Signal /copy & Paste**: Send a `/copy` command to the terminal (signaling the CLI to copy its output to the clipboard), wait for a second, and then paste the clipboard content into the editor.

## Configuration

This extension allows you to configure the command used to launch the terminal.

*   `geminiCliVsExtension.shellPath`: The command or path to launch the Gemini CLI. Defaults to `gemini`.

## Commands

*   `Gemini: Launch Terminal` (`gemini-tools.launchTerminal`)
*   `Gemini: Send Selection` (`gemini-tools.sendSelection`)
*   `Gemini: Send Subsection` (`gemini-tools.sendSubsection`)
*   `Gemini: Send Enter` (`gemini-tools.sendEnter`)
*   `Gemini: Paste to Editor` (`gemini-tools.pasteClipboard`)
*   `Gemini: Signal /copy & Paste` (`gemini-tools.signalAndPaste`)

## Requirements

You need to have the `gemini` CLI tool installed and available in your path, or configure the `geminiCliVsExtension.shellPath` setting to point to it (or any other compatible tool).
