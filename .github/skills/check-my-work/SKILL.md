---
name: check-my-work
description: Evaluates the learner's code changes against the current subsection's acceptance criteria. Infers current position from git tags. If all criteria pass, asks the user whether to mark the subsection as done. Use after completing a subsection's exercises.
---

<what-to-do>

Evaluate whether the learner has completed the current subsection's exercises, using git tags and the section README as the source of truth.

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
   Extract the `Acceptance Criteria` block for the current subsection (the `### sX.Y` heading).

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
   - Check whether the next section's README still contains the stub line "Content not yet generated".
     - If YES: tell the user to run the `start-section` skill before beginning the next subsection. Do NOT set the next start tag yet — `start-section` does that.
     - If NO: run `git tag s[next]-start` and tell the user they can begin.
   - Update `tutorial/SYLLABUS.md`: change the completed subsection's status to `done` and the next subsection's status to `in-progress`.
    - Auto-commit if tutorial metadata/content changed:
       - If `tutorial/SYLLABUS.md` and/or the current section `README.md` changed, stage only those changed files and commit them.
       - Commit message format: `progressed subsection sX.Y to done (next: sA.B in-progress)`
          Example: `progressed subsection s1.1 to done (next: s1.2 in-progress)`
       - If neither file changed, skip committing.

   **If the user declines:**
   Do nothing. Confirm that no tags or files were changed.

7. **If any criterion fails:**
   Do not tag anything. Tell the user specifically what is missing and which file to look at.

</what-to-do>

<constraints>

- Never guess at intent. Evaluate only what is in the diff.
- Do not modify any source files — only git tags and SYLLABUS.md.
- If the section README has not been generated yet (contains stub line), tell the user and stop.
- When `tutorial/SYLLABUS.md` or the section `README.md` is modified during this command, commit automatically using the step 6 message format.

</constraints>
