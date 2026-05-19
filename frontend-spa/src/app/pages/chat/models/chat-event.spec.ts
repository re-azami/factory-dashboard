import { KNOWN_TOOLS, tryParseToolOutput } from './chat-event';

/**
 * Unit tests for the pure helpers in chat-event.ts.
 *
 * The module exports `tryParseToolOutput` (JSON parser with null fallback) and
 * a `KNOWN_TOOLS` tuple. There are no other runtime functions — types are
 * compile-time only.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: null, undefined, '' input → null result.
 *  2. Boundary values            — covered: 0, true, deeply nested object, scalar string vs object.
 *  3. Persian / Unicode text     — covered: Persian-string JSON payload round-trips exactly.
 *  4. Duplicate rows             — covered: an array with duplicate items still parses.
 *  5. Null DB columns            — covered: a JSON null value parses to null (NOT the string 'null'
 *                                  and NOT the function's empty-input sentinel).
 *  6. Calendar conversion        — N/A: chat-event has no date logic.
 *  7. Permission denials         — N/A: pure helper, no auth.
 *  8. LLM provider switches      — N/A: pure helper, provider-agnostic.
 */
describe('chat-event helpers', () => {
    describe('tryParseToolOutput', () => {
        it('returns null for undefined input (missing output)', () => {
            expect(tryParseToolOutput(undefined)).toBeNull();
        });

        it('returns null for null input', () => {
            expect(tryParseToolOutput(null)).toBeNull();
        });

        it('returns null for the empty string (empty input)', () => {
            expect(tryParseToolOutput('')).toBeNull();
        });

        it('returns null for malformed JSON (silent fallback)', () => {
            expect(tryParseToolOutput('not json')).toBeNull();
            expect(tryParseToolOutput('{"unterminated":')).toBeNull();
            expect(tryParseToolOutput('}{')).toBeNull();
        });

        it('parses a valid JSON object', () => {
            const result = tryParseToolOutput('{"a":1,"b":"two"}');
            expect(result).toEqual({ a: 1, b: 'two' });
        });

        it('parses a tabular SQL result with columns and rows', () => {
            const raw = '{"columns":["n"],"rows":[[42]],"row_count":1}';
            const result = tryParseToolOutput(raw) as {
                columns: string[];
                rows: number[][];
                row_count: number;
            };
            expect(result.columns).toEqual(['n']);
            expect(result.rows).toEqual([[42]]);
            expect(result.row_count).toBe(1);
        });

        it('parses an empty-rows tabular result (boundary: zero rows)', () => {
            const result = tryParseToolOutput('{"columns":["n"],"rows":[]}') as {
                columns: string[];
                rows: unknown[][];
            };
            expect(result.columns).toEqual(['n']);
            expect(result.rows).toEqual([]);
        });

        it('preserves a JSON null cell as `null` (NOT the string "null")', () => {
            // Null DB column edge-case: agent serializes a real SQL NULL as JSON null.
            const result = tryParseToolOutput('{"columns":["x"],"rows":[[null]]}') as {
                rows: unknown[][];
            };
            expect(result.rows[0][0]).toBeNull();
            // Critical: not the string "null".
            expect(result.rows[0][0]).not.toBe('null');
        });

        it('parses Persian text content without mutation (codepoint-preserving)', () => {
            const raw = '{"note":"علت توقف کارخانه"}';
            const result = tryParseToolOutput(raw) as { note: string };
            expect(result.note).toBe('علت توقف کارخانه');
            expect(Array.from(result.note).length).toBe(Array.from('علت توقف کارخانه').length);
        });

        it('parses an array (top-level JSON array)', () => {
            const result = tryParseToolOutput('[1,2,3]');
            expect(result).toEqual([1, 2, 3]);
        });

        it('parses an array with duplicate items (duplicate rows edge-case)', () => {
            const result = tryParseToolOutput('[{"id":1},{"id":1}]');
            expect(result).toEqual([{ id: 1 }, { id: 1 }]);
        });

        it('parses a scalar number (boundary: zero)', () => {
            expect(tryParseToolOutput('0')).toBe(0);
        });

        it('parses a scalar boolean true', () => {
            expect(tryParseToolOutput('true')).toBe(true);
        });

        it('parses a JSON null literal to JS null', () => {
            // JSON.parse('null') returns null — same value as the helper's "empty"
            // sentinel, but for a different reason. Caller must rely on
            // hasTabularResult / hasPythonResult predicates rather than null-checking
            // alone; here we only assert the underlying behavior.
            expect(tryParseToolOutput('null')).toBeNull();
        });

        it('parses python_exec output shape with stdout', () => {
            const result = tryParseToolOutput('{"stdout":"ok\\n"}') as { stdout: string };
            expect(result.stdout).toBe('ok\n');
        });

        it('parses save_memory confirmation shape', () => {
            const result = tryParseToolOutput('{"saved_id":7,"kind":"insight"}') as {
                saved_id: number;
                kind: string;
            };
            expect(result.saved_id).toBe(7);
            expect(result.kind).toBe('insight');
        });
    });

    describe('KNOWN_TOOLS tuple', () => {
        it('contains the four known tool names in declaration order', () => {
            expect(KNOWN_TOOLS).toEqual(['execute_sql', 'semantic_search', 'python_exec', 'save_memory']);
        });

        it('contains each known tool name (membership check)', () => {
            expect(KNOWN_TOOLS).toContain('execute_sql');
            expect(KNOWN_TOOLS).toContain('semantic_search');
            expect(KNOWN_TOOLS).toContain('python_exec');
            expect(KNOWN_TOOLS).toContain('save_memory');
        });
    });
});
