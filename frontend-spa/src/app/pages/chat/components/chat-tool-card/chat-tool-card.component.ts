import { Component, Input } from '@angular/core';

import { ChatToolBlock, tryParseToolOutput } from '../../models/chat-event';

/**
 * Collapsible per-tool card.
 *
 * Renders one mat-expansion-panel per tool call. The header shows the tool
 * name and a running spinner (or a check icon when complete). The body shows
 * the tool's input and result, rendered specially for each of the four known
 * tools and generically (JSON dump) for anything else.
 *
 * The output is delivered by the backend as a JSON-encoded string; we parse it
 * lazily here and fall back to raw `<pre>` if parsing fails.
 */
@Component({
    selector: 'app-chat-tool-card',
    templateUrl: './chat-tool-card.component.html',
    styleUrl: './chat-tool-card.component.scss',
    standalone: false,
})
export class ChatToolCardComponent {
    @Input({ required: true }) tool!: ChatToolBlock;

    // ── Input getters ─────────────────────────────────────────────────────

    get sqlQuery(): string | null {
        const q = (this.tool.args as Record<string, unknown>)['query'];
        return typeof q === 'string' ? q : null;
    }

    get pythonCode(): string | null {
        const c = (this.tool.args as Record<string, unknown>)['code'];
        return typeof c === 'string' ? c : null;
    }

    get semanticQuery(): string | null {
        const q = (this.tool.args as Record<string, unknown>)['query'];
        return typeof q === 'string' ? q : null;
    }

    get semanticLimit(): number | null {
        const l = (this.tool.args as Record<string, unknown>)['limit'];
        return typeof l === 'number' ? l : null;
    }

    get memoryKind(): string {
        const k = (this.tool.args as Record<string, unknown>)['kind'];
        return typeof k === 'string' ? k : '?';
    }

    get memoryContent(): string {
        const c = (this.tool.args as Record<string, unknown>)['content'];
        return typeof c === 'string' ? c : '';
    }

    get memorySourceQuestion(): string | null {
        const s = (this.tool.args as Record<string, unknown>)['source_question'];
        return typeof s === 'string' && s.length > 0 ? s : null;
    }

    get fallbackArgsJson(): string {
        try {
            return JSON.stringify(this.tool.args ?? {}, null, 2);
        } catch {
            return '';
        }
    }

    // ── Output parsing ────────────────────────────────────────────────────

    private get parsedOutput(): unknown {
        return tryParseToolOutput(this.tool.output);
    }

    /** True when the parsed output is `{columns: string[], rows: any[][], …}`. */
    get hasTabularResult(): boolean {
        const p = this.parsedOutput;
        return (
            p !== null &&
            typeof p === 'object' &&
            Array.isArray((p as { columns?: unknown }).columns) &&
            Array.isArray((p as { rows?: unknown }).rows)
        );
    }

    get tabularColumns(): string[] {
        const p = this.parsedOutput as { columns?: unknown };
        return Array.isArray(p?.columns) ? (p.columns as string[]) : [];
    }

    get tabularRows(): Array<Record<string, unknown>> {
        const p = this.parsedOutput as { rows?: unknown };
        if (!Array.isArray(p?.rows)) return [];
        return (p.rows as unknown[]).map((r) =>
            r !== null && typeof r === 'object' && !Array.isArray(r)
                ? (r as Record<string, unknown>)
                : {},
        );
    }

    /** Look up a cell by column name. Returns `undefined` if the row lacks that key. */
    cellAt(row: Record<string, unknown>, column: string): unknown {
        return row[column];
    }

    get tabularRowCount(): number | null {
        const p = this.parsedOutput as { row_count?: unknown };
        return typeof p?.row_count === 'number' ? p.row_count : null;
    }

    get tabularWarning(): string | null {
        const p = this.parsedOutput as { warning?: unknown };
        return typeof p?.warning === 'string' ? p.warning : null;
    }

    /** True when parsed output looks like a python_exec result. */
    get hasPythonResult(): boolean {
        const p = this.parsedOutput;
        if (p === null || typeof p !== 'object') return false;
        const obj = p as Record<string, unknown>;
        return 'stdout' in obj || 'error' in obj || 'note' in obj;
    }

    get pythonStdout(): string {
        const p = this.parsedOutput as { stdout?: unknown };
        return typeof p?.stdout === 'string' ? p.stdout : '';
    }

    get pythonError(): string | null {
        const p = this.parsedOutput as { error?: unknown };
        return typeof p?.error === 'string' ? p.error : null;
    }

    get pythonNote(): string | null {
        const p = this.parsedOutput as { note?: unknown };
        return typeof p?.note === 'string' ? p.note : null;
    }

    /** True when parsed output looks like a save_memory confirmation. */
    get hasMemoryResult(): boolean {
        const p = this.parsedOutput;
        if (p === null || typeof p !== 'object') return false;
        const obj = p as Record<string, unknown>;
        return 'saved_id' in obj || ('kind' in obj && typeof obj['kind'] === 'string');
    }

    get memorySavedId(): string | number | null {
        const p = this.parsedOutput as { saved_id?: unknown };
        const v = p?.saved_id;
        return typeof v === 'string' || typeof v === 'number' ? v : null;
    }

    get memoryResultKind(): string | null {
        const p = this.parsedOutput as { kind?: unknown };
        return typeof p?.kind === 'string' ? p.kind : null;
    }

    /** Raw output fallback when nothing parses. */
    get rawOutput(): string {
        return this.tool.output ?? '';
    }

    // ── Cell rendering ────────────────────────────────────────────────────

    /** Convert a cell value to a displayable string. Null/undefined → empty. */
    renderCell(value: unknown): string {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }
}
