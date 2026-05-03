---
name: check-my-work
description: Evaluates the learner's code changes against the current subsection's acceptance criteria. Infers current position from git tags. Advances progress, and generates new section content when crossing into a stub section. This is the single entry point for all tutorial progression.
---

<what-to-do>

Evaluate whether the learner has completed the current subsection's exercises, then advance progress. This skill handles everything: evaluation, tagging, and section-content generation.

Follow these steps in order:

1. **Determine the current subsection.**
   Run `git tag --list 's*'` to get all tutorial tags.
   - Find all tags matching `s[X].[Y]-start`.
   - Find all tags matching `s[X].[Y]-done`.
   - The current subsection is the highest `sX.Y-start` tag that has no corresponding `sX.Y-done` tag.
   - If no start tags exist at all, tell the user to run `git tag s1.1-start` before beginning.

2. **Read the acceptance criteria.**
   Determine which section folder corresponds to the current subsection number.
   Read that section's `README.md`.
   Find the `### X.Y — Title` subsection heading for the current subsection, then locate the `#### Acceptance Criteria` block nested inside it. Use those checklist items as the criteria to evaluate.

3. **Get the diff.**
   Run `git diff sX.Y-start..HEAD` to see all changes made since the subsection started.
   Also run `git status` to catch untracked files.

4. **Evaluate each criterion.**
   Go through every criterion in the checklist. For each one, determine from the diff whether it is satisfied.
   Be strict: if a criterion is ambiguous in the diff, mark it as not yet met and explain what is missing.

5. **Report results.**
   Show the full checklist with each item marked ✅ or ❌, plus a brief explanation for any ❌.

6. **If all criteria pass:**
   Ask the user: "All checks passed ✅. Mark subsection sX.Y as done and advance to the next one? (yes / no)"

   **If the user confirms:**
   - Run `git tag sX.Y-done`
   - Determine the next subsection. If sX.Y is the last subsection in its section (e.g. s1.3 and section 1 has 3 subsections), the next is s(X+1).1. Otherwise it is sX.(Y+1).
   - If the next subsection is in the same section: run `git tag s[next]-start`.
   - If the next subsection is `s(X+1).1` (entering a new section):
     - Read the target section's README.
     - If it still contains the stub line "Content not yet generated": generate the full section content now (see `<section-content-format>` below), write it to that README, then validate the shape (see `<constraints>`), then run `git tag s[next]-start`.
     - If it is already generated: run `git tag s[next]-start`.
   - Update `tutorial/SYLLABUS.md`: change the completed subsection's status to `done` and the next subsection's status to `in-progress`.
   - Auto-commit if tutorial metadata/content changed:
     - Stage `tutorial/SYLLABUS.md` and any section README that was modified or generated, then commit.
     - Commit message format: `progressed subsection sX.Y to done (next: sA.B in-progress)`
       Example: `progressed subsection s1.1 to done (next: s1.2 in-progress)`
     - If no tracked files changed, skip committing.
   - Tell the user they can begin the next subsection.

   **If the user declines:**
   Do nothing. Confirm that no tags or files were changed.

7. **If any criterion fails:**
   Do not tag anything. Tell the user specifically what is missing and which file to look at.

</what-to-do>

<section-content-format>

When generating a new section README, replace the stub entirely with content matching this structure:

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
Do not collect all explanations under a top-level section or collect all exercises/criteria into separate top-level sections. The subsection block is the unit of organisation.

Context rules when generating:

- Read all already-generated section READMEs (non-stubs). Do not re-introduce terminology or concepts already covered.
- Read all future stub READMEs. Do not front-load content planned for later sections.
- Tailor depth and speed to the learner profile in `tutorial/SYLLABUS.md`: senior backend/ML developer (Python, C#), no meaningful JavaScript experience, strong typing instincts. Move fast through syntax basics, spend real time on concepts that differ from C# or Python.

</section-content-format>

<constraints>

- Never guess at intent. Evaluate only what is in the diff.
- Do not modify app source files — only git tags, `tutorial/SYLLABUS.md`, and section READMEs.
- When generating a new section README, validate its shape before committing:
  - Must contain `## Overview` followed by one paragraph.
  - Must NOT contain top-level `## Background`, `## Exercises`, or `## Acceptance Criteria` headings.
  - Each `### X.Y — Title` block must contain exactly one nested `#### Exercise X.Y.A — ...` and one nested `#### Acceptance Criteria` before the next `---` separator.
  - If the generated README fails this shape check, rewrite it before continuing.
- Do not reveal answers to exercises in the subsection explanation.
- Do not introduce tools or libraries not listed in the syllabus tech stack without flagging it.
- Keep the tone direct and technical. No hand-holding. No "Great job!" padding.
- When `tutorial/SYLLABUS.md` or any section `README.md` is modified, commit automatically using the step 6 message format.

</constraints>
