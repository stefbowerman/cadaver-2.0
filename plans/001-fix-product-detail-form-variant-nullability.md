# Plan 001: Make product variant updates type-safe for incomplete selections

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 505d236..HEAD -- _scripts/components/product/productDetailForm.ts _scripts/components/product/productPrice.ts _scripts/components/product/atcButton.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `505d236`, 2026-07-29

## Why this matters

`VariantChangeEvent.variant` is optional because the picker can represent an
incomplete or unmatched selection. `ProductDetailForm.onVariantChange()` passes
that optional value to three methods typed as requiring a `LiteVariant`, which
fails under strict TypeScript checking even though all three call paths already
handle the missing-variant state at runtime. Widening the method contracts to
match their existing behavior removes the type errors without changing the
URL, price, or add-to-cart UI behavior.

## Current state

- `_scripts/components/product/productDetailForm.ts` — coordinates the variant
  picker, price display, add-to-cart button, hidden master select, and history
  state.
- `_scripts/components/product/productPrice.ts` — hides the price element when
  no variant exists; its `update()` implementation already checks for a
  missing variant at lines 45–64.
- `_scripts/components/product/atcButton.ts` — disables the button and uses an
  unavailable label when no variant exists; its `update()` implementation
  already handles that branch at lines 38–56.
- `_scripts/components/product/variantPicker.ts` — declares
  `VariantChangeEvent.variant?: LiteVariant` at lines 5–8, so the form must
  accept `LiteVariant | undefined`.

The strict diagnostics are concentrated in the form:

```ts
// productDetailForm.ts:71–81
updateHistoryState(variant: LiteVariant) {
  if (!this.settings.enableHistoryState) return
  // The existing if/else explicitly supports an absent variant.
  if (variant) {
    newurl.searchParams.set('variant', variant.id.toString())
  }
  else {
    newurl.searchParams.delete('variant')
  }
}

// productDetailForm.ts:86–93
onVariantChange(e: VariantChangeEvent) {
  const { variant } = e // LiteVariant | undefined
  this.updateHistoryState(variant)
  this.atcButton.update(variant)
  this.price.update(variant)
}
```

The dependent implementations intentionally support the same absent state but
currently declare a non-optional parameter:

```ts
// productPrice.ts:45 and atcButton.ts:38
update(variant: LiteVariant) {
  if (variant) {
    // update the selected variant state
  }
  // productPrice hides itself / atcButton remains disabled when absent
}
```

The repository's default `npx tsc --noEmit --pretty false` currently exits 0,
because `tsconfig.json` does not enable `strict`. Running
`npx tsc --noEmit --strict --pretty false` exposes the three form errors above,
alongside pre-existing strict errors in other files. Do not enable strict mode
repo-wide in this plan.

At plan time, the working tree already contains unrelated modifications to
`assets/app.bundle.css`, `assets/app.bundle.js`, and `tsconfig.json`. Preserve
those changes; they are not part of this plan and must not be reset or
overwritten.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Default compiler baseline | `npx tsc --noEmit --pretty false` | Exit 0 with no diagnostics. |
| Strict targeted diagnostic check | `npx tsc --noEmit --strict --pretty false 2>&1 \| rg '_scripts/components/product/productDetailForm\\.ts'` | No matching `productDetailForm.ts` diagnostics. `rg` may exit 1 because no matches is the success condition; the full strict command is known to report unrelated existing errors elsewhere. |
| Lint changed files | `npx eslint _scripts/components/product/productDetailForm.ts _scripts/components/product/productPrice.ts _scripts/components/product/atcButton.ts` | Exit 0. |
| Repository test baseline | `npm test` | Known baseline failure: package script prints `Error: no test specified` and exits 1; no test runner is configured. Do not treat this plan as responsible for that pre-existing failure. |

## Scope

**In scope** (the only source files to modify):

- `_scripts/components/product/productDetailForm.ts`
- `_scripts/components/product/productPrice.ts`
- `_scripts/components/product/atcButton.ts`

**Out of scope** (do not touch):

- `tsconfig.json` — enabling strict mode would expose many unrelated errors and
  is a separate migration.
- `_scripts/components/product/variantPicker.ts` — its optional variant event
  contract accurately describes incomplete selections and is the source
  contract this plan must honor.
- `_scripts/components/product/variantPickerOption.ts` and all other files
  reported by the repo-wide strict check — unrelated existing diagnostics.
- Liquid snippets, product JSON shape, history-state semantics, accessibility
  text, or any runtime behavior unrelated to parameter nullability.
- New test infrastructure; the repository currently has no configured test
  runner.

## Git workflow

- Current branch: `fix/qs`; do not switch branches.
- Match the repository's existing plain imperative commit style if a commit is
  requested by the operator. Do not push or open a PR.

## Steps

### Step 1: Widen the form's history-state parameter

In `_scripts/components/product/productDetailForm.ts`, change
`updateHistoryState` to accept an optional variant (`variant?: LiteVariant`, or
the equivalent explicit `LiteVariant | undefined`). Keep the existing
`enableHistoryState` guard and both URL branches unchanged. The method must
continue adding `?variant=<id>` for a selected variant and removing the query
parameter when the picker has no matching variant.

**Verify**: `npx tsc --noEmit --strict --pretty false 2>&1 | rg '_scripts/components/product/productDetailForm\\.ts'` → the line 91 diagnostic is absent; any remaining output must be from other files.

### Step 2: Align child component update contracts with their implementations

Change the `update` parameter in `_scripts/components/product/productPrice.ts`
and `_scripts/components/product/atcButton.ts` to accept an optional
`LiteVariant`. Do not remove their existing missing-variant branches:

- `ProductPrice.update(undefined)` must hide `this.el`.
- `ATCButton.update(undefined)` must leave the button disabled and use the
  unavailable label.
- A concrete variant must retain the current selected-price and availability
  behavior.

Update the nearby JSDoc only if needed so it no longer claims that the method
requires a concrete variant.

**Verify**: `npx tsc --noEmit --strict --pretty false 2>&1 | rg '_scripts/components/product/productDetailForm\\.ts'` → no output for the form; the line 92 and 93 diagnostics are absent.

### Step 3: Run the focused quality gates

Run the default compiler check and lint all three changed files. Then run the
strict diagnostic check again and confirm that any remaining strict errors are
outside the three planned behavior changes. Do not “fix” unrelated strict
errors just to make the whole strict invocation pass.

**Verify**:

- `npx tsc --noEmit --pretty false` → exit 0.
- `npx eslint _scripts/components/product/productDetailForm.ts _scripts/components/product/productPrice.ts _scripts/components/product/atcButton.ts` → exit 0.
- `npx tsc --noEmit --strict --pretty false 2>&1 | rg '_scripts/components/product/productDetailForm\\.ts'` → no matches.
- `git diff --check -- _scripts/components/product/productDetailForm.ts _scripts/components/product/productPrice.ts _scripts/components/product/atcButton.ts` → no whitespace errors in the planned source files.
- `git status --short` → the pre-existing `assets/app.bundle.css`, `assets/app.bundle.js`, and `tsconfig.json` changes remain untouched; only the planned source files and plan files are newly changed.

## Test plan

There is no configured test runner (`package.json` maps `npm test` to a known
failure), and this change only aligns TypeScript signatures with already-tested
runtime branches. Use the compiler and lint checks as the regression gates.
The strict targeted check must prove that the optional variant is accepted at
all three call sites; preserve the existing runtime branches so incomplete
picker selections continue to clear history state, hide price, and disable the
add-to-cart button.

## Done criteria

- [ ] `npx tsc --noEmit --pretty false` exits 0.
- [ ] No strict compiler diagnostics reference
      `_scripts/components/product/productDetailForm.ts`.
- [ ] `npx eslint _scripts/components/product/productDetailForm.ts _scripts/components/product/productPrice.ts _scripts/components/product/atcButton.ts` exits 0.
- [ ] `updateHistoryState`, `ProductPrice.update`, and `ATCButton.update` all
      accept `LiteVariant | undefined` while preserving their existing absent
      variant branches.
- [ ] `git diff --check -- _scripts/components/product/productDetailForm.ts _scripts/components/product/productPrice.ts _scripts/components/product/atcButton.ts` exits 0.
- [ ] No files outside the in-scope list are newly modified; the pre-existing
      `assets/app.bundle.css`, `assets/app.bundle.js`, and `tsconfig.json`
      changes remain intact.
- [ ] `plans/README.md` status row is updated.

## STOP conditions

Stop and report back instead of improvising if:

- Any current-state excerpt or method signature differs from the live code
  after the drift check.
- The form's optional variant is found to be impossible at runtime and the
  existing `undefined` branches are no longer desired; that would require a
  product-behavior decision.
- Making the signatures optional requires changing the public shape of
  `VariantChangeEvent` or the Liquid product JSON contract.
- The default compiler check, focused lint, or `git diff --check` fails after a
  reasonable correction attempt.
- The strict diagnostic check still reports a `productDetailForm.ts` error
  after the three method contracts are aligned.

## Maintenance notes

The optional-variant contract is shared behavior between the picker and its
consumers. Future product UI methods that receive the picker event should use
the same `LiteVariant | undefined` type rather than asserting a variant exists.
Reviewers should verify that the null branch remains behaviorally meaningful:
clearing the URL parameter, hiding stale price data, and keeping the add button
unavailable are intentional safeguards for partial selections. A future plan
may address the broader repo-wide strict-mode errors and the unsound
`JSON.parse` assignment in `productDetailForm.ts`; those are deliberately
deferred here to keep this fix focused on the reported variant nullability
errors.
