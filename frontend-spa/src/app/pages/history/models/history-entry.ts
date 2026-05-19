export type AgentMode = 'simple' | 'deep';

export interface HistoryToolCall {
    tool: string;
    input: unknown;
    output: unknown;
}

export interface HistoryEntry {
    id: number;
    asked_at: string | null;
    question: string;
    answer: string | null;
    llm_provider: string | null;
    tool_calls: HistoryToolCall[] | null;
    agent_mode: AgentMode | null;
}
