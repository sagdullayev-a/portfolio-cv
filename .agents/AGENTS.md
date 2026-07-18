# Portfolio Project — Agent Rules

## Rule: Always produce a full report after every prompt

After completing **any** user request — no matter how small — always end your response with a structured report using the following format:

---

## Report — `<short title of what was done>`

### What was done
- Bullet list of every action taken

### Files changed
| File | Change |
|---|---|
| `path/to/file` | Description of change |

### Verified / Tested
- What was tested or checked (build, HMR, type-check, manual review, etc.)

### Open items / Next steps
- Anything the user still needs to do (e.g. set env vars, deploy, review)
- Any known limitations or follow-up tasks

---

This rule applies to ALL responses, including small fixes, config changes, translations, and refactors.
