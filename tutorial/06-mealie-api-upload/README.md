# Section 6 - Mealie API Upload Pipeline

## Overview

This section adds the missing backend integration path: uploading selected recipes directly into Mealie. The key design constraint is architectural separation. You will implement three explicit layers:

1. **Transform layer** - convert local `ParsedRecipe` objects into schema.org `Recipe` payloads.
2. **API layer** - call Mealie with typed request/response handling and predictable error mapping.
3. **Orchestration layer** - schedule uploads with a fixed launch cadence (200 ms), expose progress, and support cancellation.

By the end, clicking Export selected can start a paced upload run that is observable, cancellable, and type-safe.

---

### 6.1 - Transform layer: `ParsedRecipe` -> schema.org `Recipe`

The transform layer is a pure boundary function: same input, same output, no side effects. C# analogy: this is a deterministic DTO mapper. Python analogy: a pure normalization function before transport. The analogy breaks down in one place: TypeScript's structural typing lets many shapes appear compatible, so you must still define an explicit output contract and avoid ad hoc object literals leaking from components.

Create a transform module that accepts your existing `ParsedRecipe` and returns a narrow schema.org shape used by upload code only.

```ts
// src/lib/schemaOrgRecipe.ts
import type { ParsedRecipe } from "../types/recipe";

export type SchemaOrgHowToStep = {
  "@type": "HowToStep";
  position: number;
  text: string;
};

export type SchemaOrgRecipe = {
  "@context": "https://schema.org";
  "@type": "Recipe";
  name: string;
  description?: string;
  recipeIngredient: string[];
  recipeInstructions: SchemaOrgHowToStep[];
  recipeYield?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeCategory?: string;
  image?: string[];
  url?: string;
};
```

Use tiny helpers to normalize blank strings and parse time fields only when parseable.

```ts
function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
```

Wrong: pass raw XML values through unchanged.

```ts
// Wrong: keeps empty strings and fragile instruction shape
recipeInstructions: parsed.instructions as unknown as any[];
```

Correct: map into stable `HowToStep[]` and omit absent optional fields.

```ts
recipeInstructions: parsed.instructions
  .filter((x) => x.trim().length > 0)
  .map((text, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    text,
  }));
```

#### Exercise 6.1.A - Implement the transform module

**File:** `src/lib/schemaOrgRecipe.ts`

**Task:** Add typed schema.org recipe types and implement `toSchemaOrgRecipe(parsed: ParsedRecipe): SchemaOrgRecipe`. Ensure blank strings are normalized to `undefined` for optional fields.

**Why:** Upload orchestration and transport logic should consume a clean, transport-oriented contract, not raw parser output.

#### Acceptance Criteria

- [ ] `src/lib/schemaOrgRecipe.ts` exports `SchemaOrgRecipe`
- [ ] `toSchemaOrgRecipe` maps `ingredients` to `recipeIngredient`
- [ ] `instructions` become ordered `HowToStep[]`
- [ ] Optional scalar fields are omitted when empty (not emitted as empty strings)

---

### 6.2 - API layer: typed Mealie client

The API layer owns all HTTP concerns: URL composition, headers, auth, response parsing, and error translation. React components should not call `fetch` directly for domain actions. C# analogy: this is an application service client. Python analogy: this is a thin gateway object wrapping `requests` calls. The analogy breaks down because browser `fetch` resolves many failures as successful promises (`response.ok` false), so error mapping must be explicit.

For Mealie import, use the endpoint designed for schema.org ingestion:

- `POST /api/recipes/create/html-or-json`
- body: `{ data: string }` where `data` is a JSON string containing schema.org `Recipe`

Define typed input/output contracts for your client module.

```ts
// src/lib/mealieClient.ts
export type MealieImportRequest = {
  baseUrl: string;
  token: string;
  recipeJson: string;
  signal?: AbortSignal;
};

export type MealieImportResult =
  | {
      ok: true;
      slugOrId: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
      retryable: boolean;
    };
```

Normalize auth/header handling in one place.

```ts
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
}
```

Wrong: composing route strings in UI event handlers.

```ts
// Wrong: transport detail leaks into App.tsx
await fetch(base + "/api/recipes/create/html-or-json", { ... })
```

Correct: event handlers call one client function and receive domain-level success/failure.

#### Exercise 6.2.A - Build a typed upload client

**File:** `src/lib/mealieClient.ts`

**Task:** Implement `importSchemaOrgRecipe(request: MealieImportRequest): Promise<MealieImportResult>`. Return a structured failure result with `retryable` set for `429` and `5xx`.

**Why:** This keeps HTTP-specific concerns centralized and testable.

#### Acceptance Criteria

- [ ] `src/lib/mealieClient.ts` exports a single recipe-import function
- [ ] Client sends Bearer auth and JSON body `{ data: string }`
- [ ] Response handling does not throw for expected API errors
- [ ] Failures are mapped to a typed result containing `status`, `message`, and `retryable`

---

### 6.3 - Orchestration layer: paced uploads, progress, and cancellation

The orchestration layer coordinates many API calls under policy constraints. Your policy here is launch pacing: start each next upload after 200 ms. This is not the same as "wait for previous completion" unless you intentionally enforce sequential mode. C# analogy: think producer scheduling with bounded workers. Python analogy: queue + scheduler around async tasks. The analogy breaks down because React render cycles and state snapshots require careful reducer-driven state transitions to avoid stale closure bugs.

Use `useReducer` for run state and keep side-effectful control flow in a custom hook.

Suggested run model:

- Build queue from selected recipes
- Launch one job every 200 ms
- Keep per-item status: `queued | uploading | success | error | cancelled`
- Track summary counters and in-flight count
- Expose `startRun`, `cancelRun`, and derived progress values

```ts
type UploadItemStatus =
  | "queued"
  | "uploading"
  | "success"
  | "error"
  | "cancelled";
```

For cancellation, keep `AbortController` instances per in-flight item.

```ts
const controller = new AbortController();
controllers.set(item.id, controller);
```

Wrong: store upload progress in scattered `useState` calls and mutate arrays in place.

```ts
// Wrong: hard to reason about and easy to race
items[i].status = "success";
setItems(items);
```

Correct: reducer actions with immutable updates.

```ts
dispatch({ type: "item-finished", id: item.id, result });
```

#### Exercise 6.3.A - Wire the paced upload run to Export selected

**File:** `src/App.tsx` (and optionally `src/lib/usePacedUploader.ts`)

**Task:** Connect the Export selected button to start a paced upload run for selected recipes. Launch each next upload after 200 ms, render progress counts, and add a Cancel action that aborts in-flight requests.

**Why:** This teaches queue orchestration and side-effect control in React without collapsing boundaries between mapping, transport, and UI state.

#### Acceptance Criteria

- [ ] Clicking Export selected starts upload orchestration instead of local-only export
- [ ] New uploads start at 200 ms launch intervals
- [ ] UI displays at least total, succeeded, failed, and in-flight counts
- [ ] A cancel action aborts in-flight requests and prevents launching new ones
- [ ] Components do not call `fetch` directly; API calls go through the client layer
