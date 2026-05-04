"""
Agent loop — calls the LLM, runs tools, streams the final answer.

Phase 1 tools: execute_sql only.
Phase 2 adds: semantic_search.
Phase 3 adds: run_python.

To add a tool: import it, add its TOOL_DEFINITION to TOOLS list,
and add its name + run() to the TOOL_RUNNERS dict.
"""
import json
from typing import Generator

from sqlalchemy.orm import Session

from app.llm import get_llm_client
from app.llm.claude import ClaudeClient
from app.config import settings
import app.tools.execute_sql as sql_tool
# Phase 2: import app.tools.semantic_search as search_tool

from app.query_log.log import save as save_log

MAX_ITERATIONS = 8  # prevent infinite tool loops

# ── Tool registry ─────────────────────────────────────────────────────────────

TOOLS = [
    sql_tool.TOOL_DEFINITION,
    # Phase 2: search_tool.TOOL_DEFINITION,
]

TOOL_RUNNERS = {
    "execute_sql": lambda inp: sql_tool.run(**inp),
    # Phase 2: "semantic_search": lambda inp: search_tool.run(**inp),
}

# ── System prompt ─────────────────────────────────────────────────────────────

def _build_system_prompt() -> str:
    """Load schema docs from markdown files and include them in the system prompt."""
    import os

    docs_dir = os.path.join(os.path.dirname(__file__), "schema_docs")
    schema_text = ""
    for fname in sorted(os.listdir(docs_dir)):
        if fname.endswith(".md"):
            with open(os.path.join(docs_dir, fname), encoding="utf-8") as f:
                schema_text += f.read() + "\n\n"

    return f"""You are a data assistant for an iron concentrate factory.
You have access to a PostgreSQL database that contains daily production reports.
Answer the user's question by querying the database with the tools provided.

Always:
- Show the key numbers in your answer, not just "I ran a query"
- If the question is in Persian, answer in Persian
- If a query returns no rows, say so clearly
- Round percentages to 2 decimal places

{schema_text}
"""

# ── Agent loop ────────────────────────────────────────────────────────────────

def run(question: str, db: Session) -> Generator[str, None, None]:
    """
    Run the agent loop and yield text chunks for streaming.
    Saves the full Q&A to query_log when done.
    """
    client = get_llm_client()
    system = _build_system_prompt()
    messages = [{"role": "user", "content": question}]

    all_tool_calls_log = []

    for iteration in range(MAX_ITERATIONS):
        response = client.chat(system=system, messages=messages, tools=TOOLS)

        if response.content:
            yield response.content

        if not response.wants_tool:
            # Model finished — save to log and stop
            save_log(
                db=db,
                question=question,
                tool_calls=all_tool_calls_log,
                answer=response.content,
                llm_provider=settings.llm_provider,
            )
            return

        # Run each tool the model asked for
        for tool_call in response.tool_calls:
            tool_name = tool_call["name"]
            tool_input = tool_call["input"]

            yield f"\n\n[tool: {tool_name}]\n"

            runner = TOOL_RUNNERS.get(tool_name)
            if runner is None:
                tool_result = json.dumps({"error": f"Unknown tool: {tool_name}"})
            else:
                tool_result = runner(tool_input)

            all_tool_calls_log.append({
                "tool": tool_name,
                "input": tool_input,
                "output": tool_result,
            })

            # Add assistant message + tool result back into the conversation
            if isinstance(client, ClaudeClient):
                # Anthropic format: assistant turn includes the tool_use block
                messages.append({"role": "assistant", "content": response.raw.content})
                messages.append(client.build_tool_result_message(tool_call, tool_result))
            else:
                # OpenAI format
                messages.append({
                    "role": "assistant",
                    "tool_calls": [{
                        "id": tool_call["id"],
                        "type": "function",
                        "function": {"name": tool_name, "arguments": json.dumps(tool_input)},
                    }],
                })
                messages.append(client.build_tool_result_message(tool_call, tool_result))

    # Safety: if we hit MAX_ITERATIONS without finishing, log what we have
    save_log(
        db=db,
        question=question,
        tool_calls=all_tool_calls_log,
        answer="[max iterations reached]",
        llm_provider=settings.llm_provider,
    )
    yield "\n\n[Reached maximum tool iterations. Please rephrase your question.]"
