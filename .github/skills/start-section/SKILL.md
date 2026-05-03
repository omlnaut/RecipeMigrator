---
name: start-section
description: Deprecated compatibility alias. Use `check-my-work`, which now validates, advances, and generates next-section content when needed.
---

<what-to-do>

This skill is merged into `check-my-work`.

When invoked, do not run a separate standalone flow. Instead, run the `check-my-work` workflow and follow its progression logic:

- validate current subsection acceptance criteria
- on approval, mark current subsection done
- advance to next subsection
- if entering a new section and the README is still a stub, generate full section content and then set the next start tag

If the user explicitly asks to start a section without checking work, still follow `check-my-work` progression semantics and do not diverge into a separate instruction set.

</what-to-do>

<section-content-format>

Each section README must contain:

## Overview

One paragraph: what this section covers, why it matters for the app being built, and what the learner will be able to do by the end.

Then, for each subsection (X.1, X.2, X.3 etc.), write a self-contained block in this order:

---

### X.Y — Title

Conceptual explanation of the key ideas for this subsection. Use comparisons to C# or Python where helpful. Include concrete code examples. Do NOT use "we will learn" — explain things directly as facts. Do not reveal answers to the exercise below.

#### Exercise X.Y.A — Short title

**File:** `src/path/to/file.ts`

**Task:** [What to do, in 2-4 sentences. Specific enough that there is one clear right answer, but not so specific that it gives the solution.]

**Why:** [One sentence: what TypeScript/React concept this exercise targets.]

#### Acceptance Criteria

- [ ] [Specific, observable thing that must be true in the code]
- [ ] [Another specific thing]

---

Repeat the above block for each subsection. Criteria must be verifiable by reading the diff — no "understand" or "know" criteria.

</section-content-format>

<constraints>

- Do not reveal answers to exercises in the Background section.
- Do not introduce tools or libraries not listed in the syllabus tech stack without flagging it.
- Keep the tone direct and technical. No hand-holding. No "Great job!" padding.
- The `check-my-work` flow sets start tags automatically. Do not tell the user to tag manually.
- Commits remain automatic when `tutorial/SYLLABUS.md` or section `README.md` files changed.

</constraints>
