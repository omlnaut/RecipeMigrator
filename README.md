# RecipeMigrator

A learn-by-doing project. You are building a local browser tool that converts recipes from a MyCookBook XML export into Mealie JSON format — while learning TypeScript and React from scratch.

See [CONTEXT.md](CONTEXT.md) for domain terminology and [tutorial/SYLLABUS.md](tutorial/SYLLABUS.md) for the full course outline.

---

## How to use this repo

### Starting a new section

In Copilot Chat (agent mode), ask to run the start-section skill:

```text
Use the start-section skill to generate the next section.
```

This generates the full learning material for the next section (background, exercises, acceptance criteria) and sets the git start tag automatically.

### Working through exercises

Read the generated section README in `tutorial/NN-section-name/README.md`. Each subsection has:
- **Background** — concepts explained, with C#/Python comparisons
- **Exercises** — specific tasks to implement yourself
- **Acceptance Criteria** — the checklist `check-my-work` evaluates against

Make your changes in the repo, commit as you go. The diff since the start tag is what gets evaluated.

### Checking your work

When you think you've finished a subsection, ask Copilot to run check-my-work:

```text
Run the check-my-work skill for my current subsection.
```

This diffs your changes against the subsection's acceptance criteria and reports ✅ / ❌ per item. If everything passes, it will ask you to confirm before setting the `done` tag and advancing to the next subsection.

### Getting help

Use the tutor agent when you're stuck on a concept or exercise:

```
@tutor why does TypeScript allow this assignment even though the types look different?
```

The tutor reads your current position from git tags before answering. It will give hints, not solutions.

---

## Skill reference

| Skill           | When to use                               |
| --------------- | ----------------------------------------- |
| `start-section` | Before beginning a new section            |
| `check-my-work` | After completing a subsection's exercises |
| `@tutor`        | When stuck on a concept or exercise       |

---

## Progress tags

Tags follow the pattern `sX.Y-start` / `sX.Y-done` where X is the section number and Y is the subsection number.

```
s1.1-start   ← baseline for subsection 1.1
s1.1-done    ← subsection 1.1 complete
s1.2-start   ← baseline for subsection 1.2
...
```

`start-section` sets the first start tag of a section. `check-my-work` sets the remaining tags after confirmation.
