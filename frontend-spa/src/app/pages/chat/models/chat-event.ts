/**
 * Type model for the Chat page.
 *
 * The backend's POST /chat endpoint streams NDJSON — one JSON object per line —
 * with four event types. We mirror those exactly as `ChatEvent`, and translate
 * them into a richer per-message `ChatBlock` model that the UI renders.
 *
 * Tool output is delivered as a JSON-encoded string (the agent's tool implementations
 * call `json.dumps(...)` on their return value). The component keeps the raw string
 * on the block and parses lazily inside the tool-card component.
 */

export type ChatRole = 'user' | 'assistant';
export type AgentMode = 'simple' | 'deep';

export type ChatEvent =
    | { type: 'text'; content: string }
    | { type: 'tool_start'; id: string | null; name: string; args: Record<string, unknown> }
    | { type: 'tool_end'; id: string | null; name: string; output: string }
    | { type: 'error'; message: string };

export interface ChatToolBlock {
    kind: 'tool';
    id: string | null;
    name: string;
    args: Record<string, unknown>;
    output?: string; // raw JSON string from backend
    state: 'running' | 'complete' | 'error';
}

export interface ChatTextBlock {
    kind: 'text';
    text: string;
}

export interface ChatErrorBlock {
    kind: 'error';
    error: string;
}

export type ChatBlock = ChatTextBlock | ChatToolBlock | ChatErrorBlock;

export interface ChatMessage {
    role: ChatRole;
    blocks: ChatBlock[];
}

/**
 * Tool names the chat page knows how to render specially. Anything else falls
 * back to the generic JSON-stringify view.
 */
export const KNOWN_TOOLS = ['execute_sql', 'semantic_search', 'python_exec', 'save_memory'] as const;
export type KnownToolName = (typeof KNOWN_TOOLS)[number];

/**
 * Attempt to parse a tool's output JSON string. Returns `null` if the string
 * is not valid JSON — caller renders the raw output in that case.
 */
export function tryParseToolOutput(output: string | undefined | null): unknown | null {
    if (output === undefined || output === null || output === '') return null;
    try {
        return JSON.parse(output);
    } catch {
        return null;
    }
}
