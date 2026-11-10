# Design notes

## Relationship to the private project

This is an adapted portfolio selection, with a fresh history. It does not represent the complete application architecture.

| Area | Preserved from the private code | Changed for this sample |
| --- | --- | --- |
| Data reads | Remote-first loading, persisted fallback, keyed deduplication, filtering and ordering, and promise reuse. | Domain models and backend queries replaced with a small synthetic catalog and injected adapters. |
| Data safety | Defensive handling of storage reads and JSON failures. | Explicit record validation, a source indicator, valid empty snapshots, and retry cleanup added to make the standalone contract clear. |
| Button | Typed props, disabled-while-loading behavior, variants, theme-based styles, and activity indicator. | Neutral palette, style-array support, and accessibility label/state added. |
| Field | Native props, focus state, composed consumer callbacks, and multiline styling. | Neutral palette and a default accessibility label added. |
| Verification | Small, scenario-driven checks. | The data tests, demo, controls usage example, CI workflow, and documentation were written for this extraction. |

## Why remote-first?

The repository waits for the current fetch and uses the last validated snapshot if the fetch fails. This makes fresh data the normal path while preserving a useful offline experience. The `source` field lets a caller tell the user when a result may be stale.

A successful empty result is meaningful and replaces old data. Invalid remote data takes the failure path and cannot replace a known-good snapshot. A storage write failure leaves a successful remote read usable.

## Concurrency and retries

Simultaneous callers share one fetch and cache write. Each caller then filters its own page. The promise is cleared in `finally`, including after rejection, so a temporary failure cannot permanently poison the repository. Requests after the shared work finishes refresh from the adapter.

## Deliberate limits

- This small catalog is fetched as one snapshot and paginated locally. Large datasets need server-side paging and a different cache strategy.
- Sorting uses the host locale. A real multilingual product should choose an explicit locale and search policy.
- The cache has a versioned key but no expiry or migration. Cached results can be stale.
- Injected storage must be dedicated to this public catalog. Private or account-specific data would require a scoped cache and lifecycle policy.
- The repository does not add cancellation, background synchronization, mutation queues, or cross-instance locking.
- The controls are statically type checked here. Device rendering, screen-reader behavior, and native interaction have not been tested in this sample.

These boundaries keep the selection small enough to review and avoid publishing product-specific behavior.
