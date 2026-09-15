# Repo conventions for Claude Code

- Do not add a `Co-Authored-By` trailer (or any AI-attribution line) to git
  commit messages in this repo. Commits should read as if written by the
  human author alone. Same rule as gasa-api and merchant-portal.
- The agent's working rules live in `ai-core/` (start at `00-agent.md`);
  the session-to-session state of the work is `docs/tasks/HANDOFF.md`.
