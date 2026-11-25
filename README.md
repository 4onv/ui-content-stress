# UI Content Stress

**Your responsive UI passed with “Northwind.” Will it pass with a 44-character workspace name?**

UI Content Stress is a skill for Codex and Claude Code. It helps the agent reproduce long-content layout failures in the real component, fix the responsible CSS, and keep a browser regression. The included helper checks page overflow and named content boxes, so hiding a scrollbar can still surface as a clipped title.

## Install

Download and extract [the skill ZIP](https://github.com/4onv/ui-content-stress/releases/latest). Copy the entire extracted `ui-content-stress/` folder into your project’s skills directory.

| Agent | Directory | Invoke |
| --- | --- | --- |
| Codex | `.agents/skills/` | `$ui-content-stress` |
| Claude Code | `.claude/skills/` | `/ui-content-stress` |

Keep `SKILL.md`, `references/`, and `scripts/` together. The helper is optional. It can be imported by Playwright or another browser runner that accepts an evaluated function. For a manual test, the reference explains the measurements to reproduce. [Codex skills documentation](https://learn.chatgpt.com/docs/build-skills) · [Claude Code skills documentation](https://code.claude.com/docs/en/skills)

Try asking “Stress-test the workspace header at 320px with a long account name. Keep the full name available and preserve the settings action. Add a regression test for the exact failure.”

## Run the demo

From the repository with Node.js 22 or newer:

```sh
npm ci
npx playwright install chromium
npm run demo
npm test
```

On Linux, use `npx playwright install --with-deps chromium` if system libraries are missing. Run `npm run demo -- --json` for measurements.

| Synthetic fixture | Width | Result |
| --- | --- | --- |
| Ordinary workspace name, original CSS | 320 px | Fits |
| Long workspace name, original CSS | 768 px | Fits |
| Same long name, original CSS | 320 px | Horizontal page overflow and displaced action |
| Same long name, clipped CSS | 320 px | Page fits, essential title is clipped |
| Same long name, corrected CSS | 320 px | Title wraps, action fits |

These are spatial checks against a rendered fixture. They do not measure how reliably an agent follows the skill or establish complete visual or accessibility coverage. [Browser check recipe](skills/ui-content-stress/references/browser-checks.md) · [Research and alternatives](docs/research-2026-11-24.md)

MIT licensed.
