
export function getHeaderLevel(lineText: string): number {
    const match = lineText.match(/^(#+)\s/);
    return match ? match[1].length : 0;
}

// Interface to mock vscode.TextDocument for testing pure logic
export interface TextDocumentLike {
    lineCount: number;
    lineAt(line: number): { text: string };
}

// Interface to mock vscode.Range for testing pure logic
export class RangeLike {
    constructor(public startLine: number, public startChar: number, public endLine: number, public endChar: number) {}
}

export function findSubsectionRangeLike(doc: TextDocumentLike, cursorLine: number): RangeLike {
    let startLine = cursorLine;

    // 1. Scan UP for header
    let headerLevel = 0;
    while (startLine >= 0) {
        const level = getHeaderLevel(doc.lineAt(startLine).text);
        if (level > 0) {
            headerLevel = level;
            break;
        }
        startLine--;
    }
    if (startLine < 0) { startLine = 0; headerLevel = 1; }

    // 2. Scan DOWN for next header of same/higher importance
    let endLine = startLine + 1;
    while (endLine < doc.lineCount) {
        const level = getHeaderLevel(doc.lineAt(endLine).text);
        if (level > 0 && level <= headerLevel) {
            break;
        }
        endLine++;
    }

    return new RangeLike(startLine, 0, endLine, 0);
}
