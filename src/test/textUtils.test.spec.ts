import * as assert from 'assert';
import { getHeaderLevel, findSubsectionRangeLike, TextDocumentLike, RangeLike } from '../textUtils';

suite('TextUtils Test Suite', () => {
    test('getHeaderLevel should return correct level for markdown headers', () => {
        assert.strictEqual(getHeaderLevel('# Header 1'), 1);
        assert.strictEqual(getHeaderLevel('## Header 2'), 2);
        assert.strictEqual(getHeaderLevel('### Header 3'), 3);
        assert.strictEqual(getHeaderLevel('###### Header 6'), 6);
    });

    test('getHeaderLevel should return 0 for non-headers', () => {
        assert.strictEqual(getHeaderLevel('Not a header'), 0);
        assert.strictEqual(getHeaderLevel(' # Space before header'), 0);
        assert.strictEqual(getHeaderLevel('#No space'), 0);
    });

    test('findSubsectionRangeLike should find simple subsection', () => {
        const lines = [
            '# Header 1', // 0
            'Content 1',  // 1
            '# Header 2', // 2
            'Content 2'   // 3
        ];
        const doc: TextDocumentLike = {
            lineCount: lines.length,
            lineAt: (line: number) => ({ text: lines[line] })
        };

        const range = findSubsectionRangeLike(doc, 1);
        assert.strictEqual(range.startLine, 0);
        assert.strictEqual(range.endLine, 2);
    });

    test('findSubsectionRangeLike should handle nested headers', () => {
        const lines = [
            '# H1',    // 0
            '## H2',   // 1
            'Content', // 2
            '## H2b'   // 3
        ];
        const doc: TextDocumentLike = {
            lineCount: lines.length,
            lineAt: (line: number) => ({ text: lines[line] })
        };

        // Cursor at content under H2
        const range = findSubsectionRangeLike(doc, 2);
        assert.strictEqual(range.startLine, 1); // Starts at ## H2
        assert.strictEqual(range.endLine, 3);   // Ends before ## H2b
    });
});
