---
name: start-section
description: Generates full learning content for the next tutorial section and sets the first subsection's start tag. Reads the syllabus, all previously generated sections, and future stubs for consistency. Produces learning material, exercises, and structured acceptance criteria. Use when starting a new section.
---

<what-to-do>

Generate the full content for the next tutorial section and set it up for the learner to begin.

Follow these steps in order:

1. **Determine which section to generate.**
   Read `tutorial/SYLLABUS.md`. Find the first section whose README still contains the stub line "Content not yet generated". That is the target section.

2. **Read context from already-generated sections.**
   Read all section READMEs that are already fully generated (i.e., do NOT contain the stub line). Extract terminology, code patterns, and concepts already introduced. Do not re-introduce or re-explain these.

3. **Read future section stubs.**
   Read the remaining stub READMEs. Note what concepts are planned for later. Do not front-load content that belongs there.

4. **Read the learner profile from `tutorial/SYLLABUS.md`.**
   Tailor the content: senior backend/ML developer (Python, C#), no meaningful JavaScript experience, strong typing instincts. Move fast through syntax basics, spend real time on concepts that differ from C# or Python. No aesthetic focus.

5. **Generate the section content** and write it to the target section's README.md, replacing the stub entirely.

6. **Set the start tag for the first subsection.**
   Run `git tag sX.1-start` (where X is the section number). This marks the baseline for `check-my-work` to diff against.
   Update `tutorial/SYLLABUS.md`: set the first subsection's status to `in-progress`.

7. **Auto-commit tutorial metadata/content updates.**
   If this command changed `tutorial/SYLLABUS.md` and/or the target section `README.md`, stage only those changed files and commit them.
   Use a message in this format:
   - `generated subsection sX.1 content`
   Example: `generated subsection s1.1 content`
   If there are no changes in those files, skip committing.

   Tell the learner the tag has been set and they can begin subsection X.1.

</what-to-do>

<section-content-format>

Each section README must contain:

## Overview

One paragraph: what this section covers, why it matters for the app being built, and what the learner will be able to do by the end.

## Background

Conceptual explanation of the key ideas. Use comparisons to C# or Python where helpful. Include concrete code examples. Do NOT use "we will learn" — explain things directly as facts.

For each subsection (X.1, X.2, X.3 etc.), write its background content under a `### X.Y — Title` heading.

## Exercises

For each subsection, one or more hands-on exercises. Each exercise:
- States clearly what file to create or modify
- Gives enough constraints to be unambiguous without giving the answer
- Includes a "Why" sentence explaining what concept the exercise targets

Format:

```
### Exercise X.Y.A — Short title

**File:** `src/path/to/file.ts`

**Task:** [What to do, in 2-4 sentences. Specific enough that there is one clear right answer, but not so specific that it gives the solution.]

**Why:** [One sentence: what TypeScript/React concept this exercise targets.]
```

## Acceptance Criteria

A structured checklist the `check-my-work` skill uses to evaluate the diff. Be precise and machine-readable.

Format:

```
### s[section].[subsection] — [Title]

- [ ] [Specific, observable thing that must be true in the code]
- [ ] [Another specific thing]
```

Example:
```
### s1.1 — DevContainer

- [ ] A `.devcontainer/devcontainer.json` file exists
- [ ] The devcontainer specifies a Node.js version >= 20
- [ ] The `dbaeumer.vscode-eslint` extension is listed in `customizations.vscode.extensions`
```

Criteria must be verifiable by reading the diff — no "understand" or "know" criteria.

</section-content-format>

<constraints>

- Do not reveal answers to exercises in the Background section.
- Do not introduce tools or libraries not listed in the syllabus tech stack without flagging it.
- Keep the tone direct and technical. No hand-holding. No "Great job!" padding.
- The start tag is set automatically in step 6. Do not tell the user to do it manually.
- The commit in step 7 is automatic when `tutorial/SYLLABUS.md` or the section `README.md` changed. Do not ask the user to commit manually.

</constraints>
