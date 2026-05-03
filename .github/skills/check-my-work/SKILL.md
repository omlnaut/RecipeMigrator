---
name: check-my-work
description: Evaluates the learner's code changes against the current subsection's acceptance criteria, then advances progress. When crossing into a new section, it sets the next start tag and generates section content if still stubbed.
---

<what-to-do>

Evaluate whether the learner has completed the current subsection's exercises, then advance to the next subsection when approved.
This skill is the single entry point for progression, including section-content generation when needed.

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
   - If the next subsection is `s(X+1).1` (entering a new, larger section):
     - Check whether that section README contains the stub line "Content not yet generated".
     - If the README is already generated: run `git tag s[next]-start`.
     - If the README is still a stub: generate content for that new section before setting the start tag.
       - Read all already-generated section READMEs (non-stubs) and extract terminology/patterns already introduced.
       - Read all future stub READMEs and avoid front-loading concepts planned for later sections.
       - Read learner profile from `tutorial/SYLLABUS.md` and tailor the section depth/speed to it.
       - Replace the target section README stub with full section content, following the old `start-section` format requirements.
       - Then run `git tag s[next]-start`.
   - Update `tutorial/SYLLABUS.md`: change the completed subsection's status to `done` and the next subsection's status to `in-progress`.
   - Auto-commit if tutorial metadata/content changed:
     - If `tutorial/SYLLABUS.md` and/or any touched section `README.md` changed (current and/or newly generated next section), stage only those changed files and commit them.
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
- Do not modify app source files while checking criteria.
- It is allowed to modify tutorial docs (`tutorial/SYLLABUS.md`, section `README.md`) as part of section progression/generation.
- If generating a new section README in this command, follow the exact `start-section` content structure (overview, subsection blocks, exercises, acceptance criteria).
- When `tutorial/SYLLABUS.md` or any section `README.md` is modified during this command, commit automatically using the step 6 message format.

</constraints>
