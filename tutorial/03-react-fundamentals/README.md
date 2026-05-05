# Section 3 — React Fundamentals

## Overview

This section introduces React as a typed UI state machine running in the browser: components as pure render functions, state transitions triggered by events, and side effects for I/O. By the end, you will model UI state with TypeScript unions, render typed recipe data through props, and load the MyCookBook XML file into React state using `useEffect` without losing type safety.

---

### 3.1 — Components, JSX, and typed props

#### What is a React component?

A React component is a function that receives data (props) and returns a description of UI (JSX). React calls this function whenever it needs to know what to display.

```tsx
function Greeting() {
  return <h1>Hello</h1>;
}
```

That's it. No classes required (though they exist). The function is called on every render; there is no persistent object instance between renders.

#### What is JSX?

JSX looks like HTML embedded in TypeScript, but it's just syntax sugar for function calls. This:

```tsx
return (
  <div className="row">
    <span>{recipe.name}</span>
  </div>
);
```

compiles to roughly:

```ts
return React.createElement(
  "div",
  { className: "row" },
  React.createElement("span", null, recipe.name),
);
```

You never write the `createElement` calls directly. The key things to know:

- **`{}` is an escape back to TypeScript** — any valid TS expression goes inside braces
- **`className` not `class`** — `class` is a reserved word in JS
- **Components must return a single root element** — wrap siblings in `<div>` or the empty fragment `<>...</>`
- **JSX is type-checked** — passing the wrong type to a prop is a compile error, not a runtime error

#### Props

Props are the inputs to a component. You define them as a TypeScript type:

```tsx
type GreetingProps = {
  name: string;
  count: number;
};

function Greeting({ name, count }: GreetingProps) {
  return (
    <p>
      {name} has {count} recipes
    </p>
  );
}
```

The destructuring `{ name, count }` in the parameter is standard JS/TS — you're pulling fields out of the props object. This is equivalent to:

```ts
function Greeting(props: GreetingProps) {
  return <p>{props.name} has {props.count} recipes</p>;
}
```

Both are correct; the destructured form is more common in React codebases.

**C# analogy:** Props are a record/DTO that the caller must satisfy at compile time — like a constructor with named required parameters. There are no optional props unless you mark them with `?` and provide a default.

**Python analogy:** `@dataclass` with required fields, except the type enforcement is at compile time, not runtime.

#### Calling a component from JSX

```tsx
// The Greeting component from above
<Greeting name="Alice" count={12} />
```

- String literal props use `"quotes"`
- Everything else (numbers, booleans, expressions, variables) uses `{braces}`
- Self-closing `/>` is fine when there are no children

#### Using your project types

In this project `RecipeSummary` is already defined:

```ts
// src/types/recipe.ts
type Recipe = { id: string; name: string /* ... */ };
export type RecipeSummary = Pick<Recipe, "id" | "name">;
```

A component that consumes it:

```tsx
import type { RecipeSummary } from "../types/recipe";

type RecipeRowProps = {
  recipe: RecipeSummary;
  selected: boolean;
};

export function RecipeRow({ recipe, selected }: RecipeRowProps) {
  return (
    <div>
      <span>{selected ? ">>" : "  "}</span>
      <span>{recipe.name}</span>
      <span>({recipe.id})</span>
    </div>
  );
}
```

And the parent renders two instances with hardcoded data:

```tsx
// src/App.tsx
import { RecipeRow } from "./components/RecipeRow";

function App() {
  return (
    <div>
      <h1>Recipe Migrator</h1>
      <RecipeRow recipe={{ id: "1", name: "Chili" }} selected={true} />
      <RecipeRow recipe={{ id: "2", name: "Pasta" }} selected={false} />
    </div>
  );
}
```

Notice `{ id: "1", name: "Chili" }` satisfies `RecipeSummary` because `RecipeSummary` is `{ id: string; name: string }`. TypeScript checks this at compile time — if you pass `id: 1` (a number), it will be a type error.

#### Conditional rendering

There are three common patterns:

```tsx
// 1. Ternary — use when both branches produce JSX
{
  selected ? <strong>{recipe.name}</strong> : <span>{recipe.name}</span>;
}

// 2. Short-circuit — use when one branch produces nothing
{
  selected && <span>&gt;&gt;</span>;
}

// 3. Variable — use when the logic is complex
const marker = selected ? ">>" : "  ";
return (
  <div>
    <span>{marker}</span>
  </div>
);
```

Pattern 2 has a gotcha: if `selected` is `0` (falsy number), React renders `0` literally. Use `!!` coercion or a ternary when the condition might be a number.

---

#### Exercise 3.1.A — Extract a typed recipe row component

**File:** `src/components/RecipeRow.tsx`

**Task:** Create a reusable `RecipeRow` component that receives a single `recipe` prop typed as `RecipeSummary` and a `selected` prop typed as `boolean`. Render the recipe name and id in JSX, and render a visual selected marker that depends on `selected`. Then update `src/App.tsx` to render at least two `RecipeRow` instances with hardcoded sample data.

**Why:** This exercise forces a typed prop boundary between parent and child components, which is the core unit of React architecture.

#### Acceptance Criteria

- [ ] `src/components/RecipeRow.tsx` exists and exports a React function component
- [ ] `RecipeRow` props include `recipe: RecipeSummary` and `selected: boolean`
- [ ] JSX in `RecipeRow` renders both `recipe.name` and `recipe.id`
- [ ] `src/App.tsx` imports and uses `RecipeRow` at least twice with correctly typed props

---

### 3.2 — `useState<T>` and event handling

#### The core model: state snapshots and re-renders

React does not observe your variables. If you write `let count = 0; count++`, the UI does not update. You must use `useState`, which gives React a value it tracks:

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

`useState(0)` returns a tuple: `[currentValue, setter]`. The setter does two things atomically:

1. Schedules the component to re-render
2. Makes the new value available in the next render's call to `useState`

**The mental model:** each render is a fresh function call. `count` is not a mutable variable — it's a constant for that render snapshot. `setCount(count + 1)` does not mutate `count`; it tells React "next time you call this function, give me `1`".

**C# analogy:** Imagine an immutable record where the only way to "mutate" is to call a method that queues a re-creation of the whole component with a new record. There is no `this.count = 5`.

#### The type parameter

TypeScript can usually infer the type from the initial value:

```ts
const [count, setCount] = useState(0); // inferred: number
const [name, setName] = useState("Alice"); // inferred: string
const [recipe, setRecipe] = useState(null); // inferred: null — WRONG
```

When the initial value doesn't reflect the full type (like `null` for something that will later hold data), supply the type explicitly:

```ts
const [recipe, setRecipe] = useState<RecipeSummary | null>(null);
```

This is the same as `useState<RecipeSummary | null>(null)` and tells TypeScript the state can be either a `RecipeSummary` or `null`.

For a set of selected IDs:

```ts
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
// or
const [selectedIds, setSelectedIds] = useState<string[]>([]);
```

#### Event handlers

React events are typed. The most common ones:

```tsx
// Click — for buttons, divs, etc.
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  console.log(e.currentTarget.id);
}
<button onClick={handleClick}>Click</button>;

// Change — for inputs
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value);
}
<input onChange={handleChange} />;
```

In practice you often use inline arrow functions instead of named handlers, which avoids having to write the event type explicitly:

```tsx
<button onClick={() => setCount(count + 1)}>+</button>
```

#### Immutable state updates

This is where Python and C# instincts break down. You **must not mutate state in place**. React does not detect in-place mutations because it checks reference equality to decide if re-rendering is needed.

**Arrays — wrong:**

```ts
selectedIds.push(id); // mutation — React won't re-render
setSelectedIds(selectedIds); // same reference, React skips re-render
```

**Arrays — correct:**

```ts
setSelectedIds([...selectedIds, id]); // new array reference
// or to remove:
setSelectedIds(selectedIds.filter((x) => x !== id));
```

**Sets — wrong:**

```ts
selectedIds.add(id); // mutation
setSelectedIds(selectedIds); // same reference
```

**Sets — correct:**

```ts
setSelectedIds(new Set([...selectedIds, id])); // new Set
// or to remove:
setSelectedIds(new Set([...selectedIds].filter((x) => x !== id)));
```

**Objects — wrong:**

```ts
recipe.name = "New Name";
setRecipe(recipe);
```

**Objects — correct:**

```ts
setRecipe({ ...recipe, name: "New Name" }); // spread then override
```

#### Toggling membership in a set

A toggle adds the item if absent, removes it if present:

```ts
function toggleId(id: string, current: string[]): string[] {
  return current.includes(id)
    ? current.filter((x) => x !== id) // remove
    : [...current, id]; // add
}
```

Then in your handler:

```ts
const [selectedIds, setSelectedIds] = useState<string[]>([]);

function handleToggle(id: string) {
  setSelectedIds((prev) => toggleId(id, prev));
}
```

Note the `prev =>` form: passing a function to the setter instead of a value is safer when the new state depends on the current state, because React may batch multiple updates.

#### Wiring to a child component

The parent owns the state; the child receives a callback prop:

```tsx
// RecipeRow needs to report clicks up
type RecipeRowProps = {
  recipe: RecipeSummary;
  selected: boolean;
  onToggle: (id: string) => void; // callback
};

export function RecipeRow({ recipe, selected, onToggle }: RecipeRowProps) {
  return (
    <div onClick={() => onToggle(recipe.id)}>
      <span>{selected ? ">>" : "  "}</span>
      <span>{recipe.name}</span>
    </div>
  );
}
```

```tsx
// App owns state, passes handler down
function App() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function handleToggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const recipes: RecipeSummary[] = [
    { id: "1", name: "Chili" },
    { id: "2", name: "Pasta" },
  ];

  return (
    <div>
      {recipes.map((r) => (
        <RecipeRow
          key={r.id}
          recipe={r}
          selected={selectedIds.includes(r.id)}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
```

**`key` prop:** when rendering a list with `.map()`, React requires a `key` prop on the outermost element of each iteration. Use a stable unique identifier (like `id`). This is not for your code to use — it's for React's internal diffing. If you omit it, TypeScript will not error but you'll get a runtime warning.

---

#### Exercise 3.2.A — Add typed selection state and toggle handling

**File:** `src/App.tsx`

**Task:** Introduce local state for selected recipe ids using `useState<Set<string>>` or `useState<string[]>`. Add a typed click handler that toggles one recipe id in that state and wire it to each rendered recipe row. Ensure UI output changes when selection changes so the state transition is observable.

**Why:** This exercise maps event-driven updates to strongly typed state transitions, which is the central React mental model.

#### Acceptance Criteria

- [ ] `src/App.tsx` declares selection state with an explicit or inferable string-id type
- [ ] A toggle handler exists and is wired to user interaction
- [ ] State updates are immutable (no in-place mutation of existing state object/array)
- [ ] Rendered output reflects selected vs unselected state

---

### 3.3 — `useEffect` and loading data (parses the MyCookBook XML)

#### What `useEffect` is for

Side effects are operations that reach outside the component's pure render boundary: network requests, timers, DOM manipulation, subscriptions. React isolates these in `useEffect` so the render function itself stays pure and predictable.

```tsx
useEffect(
  () => {
    // side effect here
  },
  [
    /* dependency array */
  ],
);
```

The second argument (the dependency array) controls when the effect runs:

| Dependency array | When the effect runs                               |
| ---------------- | -------------------------------------------------- |
| Omitted          | After every render (usually wrong)                 |
| `[]` (empty)     | Once, after the component first mounts             |
| `[a, b]`         | After mount, and again whenever `a` or `b` changes |

For a one-time data load, use `[]`.

**C# analogy:** Think of `useEffect(() => { ... }, [])` as code you'd put in a constructor or `OnInitializedAsync` in Blazor — it runs once when the component comes into existence.

#### Async inside `useEffect`

You cannot make the effect callback itself `async`:

```ts
// WRONG — React ignores the returned Promise
useEffect(async () => { ... }, []);
```

Instead, define an inner async function and call it immediately:

```ts
useEffect(() => {
  async function load() {
    const response = await fetch("/data.xml");
    const text = await response.text();
    // update state with text
  }
  load();
}, []);
```

#### Fetching a local file

Files placed in the `public/` folder are served at the root URL. If you put `backup.xml` in `public/`, you fetch it as:

```ts
const response = await fetch("/backup.xml");
```

`fetch` returns a `Response` object. The most relevant methods:

- `response.ok` — `true` if HTTP status was 2xx
- `response.text()` — resolves to the body as a string (returns `Promise<string>`)
- `response.json()` — resolves to parsed JSON (returns `Promise<unknown>` in TypeScript)

#### The `LoadState<T>` discriminated union

You defined this in section 2:

```ts
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };
```

For loading XML text the state would be `LoadState<string>`. The four statuses map directly to the lifecycle of an async operation:

- `idle` — nothing has started yet (initial state)
- `loading` — fetch is in progress
- `error` — fetch or parsing failed; `message` holds the reason
- `ready` — data is available; `data` holds the result

#### Wiring it all together

```tsx
import { useState, useEffect } from "react";

// Assume LoadState<T> is exported from your types file
import type { LoadState } from "../types/load-state";

function App() {
  const [xmlState, setXmlState] = useState<LoadState<string>>({
    status: "idle",
  });

  useEffect(() => {
    setXmlState({ status: "loading" });

    async function load() {
      try {
        const response = await fetch("/myrecipes.xml");
        if (!response.ok) {
          setXmlState({ status: "error", message: `HTTP ${response.status}` });
          return;
        }
        const text = await response.text();
        setXmlState({ status: "ready", data: text });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setXmlState({ status: "error", message });
      }
    }

    load();
  }, []); // empty deps = run once on mount

  // Render based on state
  switch (xmlState.status) {
    case "idle":
      return <p>Not started</p>;
    case "loading":
      return <p>Loading…</p>;
    case "error":
      return <p>Error: {xmlState.message}</p>;
    case "ready":
      return <pre>{xmlState.data.slice(0, 200)}</pre>;
  }
}
```

A few things to note in the example:

1. **`setXmlState({ status: "loading" })` before the async call** — this transitions state immediately when the effect runs, before any await.
2. **`response.ok` check** — `fetch` does not throw on 404 or 500; you must check `ok` manually.
3. **`err instanceof Error` guard** — `catch (err)` types `err` as `unknown` in TypeScript's strict mode. You must narrow it before accessing `.message`.
4. **The `switch` is exhaustive** — TypeScript knows all four `status` values, so if you add a fifth case to the union and forget to handle it in the switch, you get a compile error.

#### Where to put the XML file

The exercise loads from `public/`. The backup file is at `backup/MyCookBook_Backup_2026-03-31.xml`. You'll need to copy it (or symlink it) into `public/` so Vite serves it:

```sh
cp backup/MyCookBook_Backup_2026-03-31.xml public/recipes.xml
```

Then fetch as `fetch("/recipes.xml")`.

---

#### Exercise 3.3.A — Load XML text and model async state

**File:** `src/App.tsx`

**Task:** Add a `LoadState<string>` state value to represent XML-loading progress (`idle`, `loading`, `error`, `ready`). Implement a `useEffect` that fetches the XML text from a local path in `public/` and updates the load state based on success or failure. Render different JSX for each status branch using a `switch` or equivalent exhaustive control flow.

**Why:** This exercise combines side effects and typed async state, which is the foundation for parsing and rendering real recipe data in section 4.

#### Acceptance Criteria

- [ ] `src/App.tsx` stores XML fetch progress using a discriminated union (`LoadState<string>` or equivalent)
- [ ] A `useEffect` triggers the XML load and updates state on both success and failure paths
- [ ] Render logic handles each load status explicitly (`idle`, `loading`, `error`, `ready`)
- [ ] No `any` is introduced in the loading and rendering flow
