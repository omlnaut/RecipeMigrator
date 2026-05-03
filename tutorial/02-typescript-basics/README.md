# Section 2 — TypeScript for C#/Python Developers

## Overview

You already know what a type system is — C# is nominally typed and Python (via mypy) is structurally typed. TypeScript is also structural, which means it behaves more like mypy than C#. This section maps TypeScript's type system onto what you already know, highlights the sharp edges, and gives you the vocabulary you'll need to read and write typed React code in later sections.

All exercises in this section use plain `.ts` files. No React, no JSX. You will run them with `npx tsx <file>` or check them with `npx tsc --noEmit` — the goal is to read compiler output, not render a UI.

---

## Background

### 2.1 — Structural vs. nominal typing: what you need to unlearn from C#

In C#, two types are the same only if they share a name or an explicit inheritance/interface relationship:

```csharp
class RecipeId { public string Value { get; init; } }
class UserId   { public string Value { get; init; } }
// RecipeId and UserId are NOT assignable to each other — different nominal types.
```

TypeScript is **structural**: two types are compatible if their _shapes_ match, regardless of their names.

```ts
type RecipeId = { value: string };
type UserId = { value: string };

const rid: RecipeId = { value: "r1" };
const uid: UserId = rid; // ✅ no error — same shape
```

This is the single biggest mental shift from C#. Key consequences:

**Object literal excess property checking** — TypeScript makes one exception to pure structural typing: when you assign an _object literal directly_ to a typed variable, it rejects extra properties. This rule only fires for object literals, not for variables:

```ts
type Recipe = { name: string };

const r: Recipe = { name: "Pasta", servings: 4 }; // ❌ excess property
const obj = { name: "Pasta", servings: 4 };
const r2: Recipe = obj; // ✅ variable — structurally compatible
```

**Branded/opaque types** — If you want nominal-like safety (e.g., never pass a `UserId` where a `RecipeId` is expected), TypeScript developers use a pattern called _branding_:

```ts
type RecipeId = string & { readonly _brand: "RecipeId" };
type UserId = string & { readonly _brand: "UserId" };

function makeRecipeId(s: string): RecipeId {
  return s as RecipeId;
}
```

The `_brand` property never exists at runtime — the intersection type simply makes the shapes incompatible. You won't need branding in this project, but recognising the pattern matters when reading library code.

**Type widening** — TypeScript infers the _widest reasonable type_ for `let` (mutable) and the _narrowest literal type_ for `const`:

```ts
let name = "Pasta"; // inferred: string
const name = "Pasta"; // inferred: "Pasta" (string literal type)
```

This mirrors Python's distinction between a variable that may be reassigned and one that won't.

---

### 2.2 — `type` vs `interface`, union types, `unknown` vs `any`

**`type` alias vs `interface`**

Both declare object shapes. The practical differences:

| Feature              | `type`                  | `interface`             |
| -------------------- | ----------------------- | ----------------------- |
| Union / intersection | ✅                      | ❌                      |
| Declaration merging  | ❌                      | ✅ (libraries use this) |
| Extends another type | Via `&`                 | Via `extends`           |
| Primitive alias      | ✅ (`type ID = string`) | ❌                      |

Rule of thumb for this project: use `type` for domain models and `interface` only when you explicitly want to allow extension. In practice both work fine for plain object shapes — the TypeScript team no longer recommends one universally.

**Union types**

A union `A | B` means "this value is either A or B". TypeScript narrows unions via control flow:

```ts
type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: string[] };

function describe(s: LoadState): string {
  if (s.status === "error") {
    return s.message; // TypeScript knows s.message exists here
  }
  return s.status;
}
```

This pattern — a union of objects each carrying a discriminant `status` field — is called a **discriminated union**. It is the idiomatic replacement for abstract base classes in TypeScript. You will use this pattern for async state throughout the app.

**Intersection types**

`A & B` means "a value that satisfies both A and B simultaneously". Useful for composing shapes:

```ts
type WithId = { id: string };
type WithName = { name: string };
type Named = WithId & WithName; // { id: string; name: string }
```

**`unknown` vs `any`**

`any` is a complete escape hatch — it disables all type checking for the annotated value. Avoid it; it defeats the purpose of TypeScript and is equivalent to `object` in C# used carelessly.

`unknown` is the _type-safe_ top type. You can assign anything _to_ `unknown`, but you must narrow the type before using it:

```ts
function parse(input: unknown): string {
  if (typeof input === "string") return input; // narrowed to string
  throw new Error("Expected a string");
}
```

`unknown` is what you get from `JSON.parse` in well-typed code — and it is what Zod validators accept in section 5.

**`never`**

`never` is the bottom type — a value that can never exist. It appears at the end of exhaustive checks:

```ts
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

function handle(s: LoadState) {
  switch (s.status) {
    case "idle":
      return "idle";
    case "loading":
      return "loading";
    case "error":
      return s.message;
    case "ready":
      return s.data.join(", ");
    default:
      return assertNever(s); // compiler error if a case is missing
  }
}
```

---

### 2.3 — Generics and utility types (`Partial`, `Pick`, `Record`)

**Generics**

TypeScript generics work like C# generics and Python `TypeVar`. The syntax is identical to C# except angle brackets appear after the function name (not after `function`):

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([1, 2, 3]); // inferred: number | undefined
const s = first(["a", "b"]); // inferred: string | undefined
```

Generic constraints with `extends`:

```ts
function getId<T extends { id: string }>(item: T): string {
  return item.id;
}
```

**Built-in utility types**

TypeScript ships a set of generic utility types. The ones you'll use most:

| Utility         | Effect                                       | Equivalent concept                |
| --------------- | -------------------------------------------- | --------------------------------- |
| `Partial<T>`    | All properties of T become optional          | C# nullable record properties     |
| `Required<T>`   | All optional properties become required      | Inverse of `Partial`              |
| `Readonly<T>`   | All properties become `readonly`             | C# `init`-only properties         |
| `Pick<T, K>`    | Keep only the listed keys                    | Selecting columns in a projection |
| `Omit<T, K>`    | Drop the listed keys                         | Inverse of `Pick`                 |
| `Record<K, V>`  | Object whose keys are `K` and values are `V` | C# `Dictionary<K,V>`              |
| `ReturnType<F>` | Infer the return type of function `F`        | Not directly in C#                |

Example:

```ts
type Recipe = {
  id: string;
  name: string;
  servings: number;
  instructions: string;
};

type RecipeSummary = Pick<Recipe, "id" | "name">;
type RecipeDraft = Omit<Recipe, "id">;
type PartialRecipe = Partial<Recipe>;
type RecipeIndex = Record<string, Recipe>; // keyed by id
```

`Record<string, Recipe>` is the TypeScript idiom for what Python developers write as `dict[str, Recipe]` and C# developers write as `Dictionary<string, Recipe>`.

---

## Exercises

### Exercise 2.1 — Explore structural typing

**File:** `src/types/structural.ts`

**Task:**

1. Declare two `type` aliases, `RecipeRef` and `IngredientRef`, each with a single `id: string` property.
2. Write a function `printId` that accepts a `RecipeRef` and logs `id` to the console.
3. Create a variable of type `IngredientRef` and pass it to `printId`. Confirm TypeScript accepts it (it will — the shapes are identical).
4. Add a second property `_kind: "recipe"` to `RecipeRef` and `_kind: "ingredient"` to `IngredientRef`. Re-check: now TypeScript should reject the cross-assignment.
5. Run `npx tsc --noEmit` and read the error. Note how TypeScript reports the shape mismatch.

**Why:** Demonstrates that TypeScript types are compatible by shape, and shows the minimal change required to enforce distinct identity.

---

### Exercise 2.2 — Discriminated union for load state

**File:** `src/types/load-state.ts`

**Task:**

1. Define a discriminated union type `LoadState<T>` with four variants:
   - `{ status: "idle" }`
   - `{ status: "loading" }`
   - `{ status: "error"; message: string }`
   - `{ status: "ready"; data: T }`
2. Write a function `describe<T>(s: LoadState<T>): string` that switches on `s.status` and returns a string for each case. Add a `default:` branch that calls `assertNever(s)` (define `assertNever` yourself).
3. Temporarily delete one `case` from the switch. Confirm TypeScript reports an error on the `assertNever` call.
4. Restore the missing case.

**Why:** `LoadState<T>` is a pattern you'll reuse in section 3 to model async data in React state. Practising it here in plain TypeScript first makes the React version easier to read.

---

### Exercise 2.3 — Utility types for recipe data

**File:** `src/types/recipe.ts`

**Task:**

1. Declare a `Recipe` type with these fields: `id: string`, `name: string`, `servings: number`, `imageFileName: string | null`, `instructions: string`.
2. Derive the following using utility types (no repeating property lists):
   - `RecipeSummary` — only `id` and `name`
   - `RecipeDraft` — all fields except `id` (used before an id is assigned)
   - `RecipeIndex` — a `Record` mapping `string` keys to `Recipe` values
3. Write a function `indexRecipes(recipes: Recipe[]): RecipeIndex` that converts an array into a `RecipeIndex` keyed by `id`.
4. Annotate the return type explicitly. Run `npx tsc --noEmit` with no errors.

**Why:** `Recipe` is the central domain type for the app. You will extend this type in section 4 when you parse the MyCookBook XML. Practising utility-type derivation now means section 4 starts with a familiar shape.

---

## Acceptance Criteria

### 2.1 — Structural typing exploration

- [ ] `src/types/structural.ts` exists
- [ ] Two `type` aliases with a `_kind` discriminant property are defined (one `"recipe"`, one `"ingredient"`)
- [ ] A function accepting one of the two types is defined
- [ ] `npx tsc --noEmit` passes with no errors (after adding `_kind` to both types)

### 2.2 — Discriminated union

- [ ] `src/types/load-state.ts` exists
- [ ] `LoadState<T>` is a generic discriminated union with `idle`, `loading`, `error`, and `ready` variants
- [ ] An `assertNever` function is defined and called in the `default` branch
- [ ] `npx tsc --noEmit` passes with no errors

### 2.3 — Utility types and recipe model

- [ ] `src/types/recipe.ts` exists
- [ ] `Recipe` type declares all five fields (`id`, `name`, `servings`, `imageFileName`, `instructions`)
- [ ] `RecipeSummary`, `RecipeDraft`, and `RecipeIndex` are derived using `Pick`, `Omit`, and `Record` respectively (no manually repeated property lists)
- [ ] `indexRecipes` function is defined, accepts `Recipe[]`, and has an explicit `RecipeIndex` return type annotation
- [ ] `npx tsc --noEmit` passes with no errors
