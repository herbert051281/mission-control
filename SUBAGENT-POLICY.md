# SUBAGENT-POLICY.md

## Core Principle
Anything beyond a simple conversational message is delegated to a subagent.

## Delegate to Subagent
Use a subagent for:
- All coding work (any size), routed through Cursor agent CLI inside the worker
- Searches (web, X/Twitter, email), API calls, and multi-step tasks
- Data processing and file operations beyond simple reads
- Calendar/email operations, browser-control tasks, CRM multi-lookups
- KB ingestion and multi-step research (2+ searches)
- Anything expected to take more than a few seconds

## Handle Directly in Main Session
Main session handles only:
- Simple conversational replies
- Clarifying questions
- Acknowledgments
- Quick file reads (1–2 files)
- Manual inbox launches (`run inbox`) because launcher already detaches
- Training status checks (fast, single command)

## Delivery Sequence (Chat Workflows)
1. Send: "On it" acknowledgment first (standalone, before any tool call)
2. Announce model and provider (example: "gpt-5.4 via Cursor CLI")
3. Spawn subagent with `expectsCompletionMessage=false`
4. Stay silent until completion
5. Send one concise user-facing completion update
6. If completion was already delivered, reply exactly: `NO_REPLY`

## Failure Handling
- Report errors to Herb via Telegram
- Retry once for transient failures
- Stop after two failures
- Never fall back to writing code directly in the main session when subagent coding path is required
