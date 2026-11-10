# Mobile engineering samples

Selected TypeScript and React Native code adapted from a private mobile project by **Enrico Spadaro**. This repository gives reviewers a small, runnable view of the engineering practices behind that project.

## Start here

| Sample | What to look for |
| --- | --- |
| [Catalog repository](src/data/catalogRepository.ts) | Typed adapters, remote reads with an offline fallback, validation at data boundaries, and shared in-flight requests. |
| [Primary button](src/ui/PrimaryButton.tsx) | One component for loading, disabled, primary, and secondary states; theme tokens and caller-provided styles. |
| [Text field](src/ui/Field.tsx) | Native input props, composed focus callbacks, multiline support, and caller-provided styles. |
| [Controls in use](examples/ControlsExample.tsx) | A small form that owns its async state, handles failure, and passes native props through. |
| [Behavior tests](tests/catalogRepository.test.mjs) | Offline reads, broken storage, invalid payloads, empty results, concurrent consumers, and retry recovery. |

The UI components are close adaptations of the private code. The repository combines and generalizes existing data-loading patterns. Its adapters, synthetic fixtures, validation refinements, tests, usage example, and runnable demo were prepared for this public sample. See [design notes](docs/design-notes.md) for the boundaries and tradeoffs.

## Run locally

Requires Node.js 22.13+ and npm. No accounts, keys, backend, or native SDK are needed for the demo and data tests.

```sh
npm ci --ignore-scripts
npm run check
npm run demo
```

The demo loads a synthetic tutorial catalog, simulates losing connectivity, and reads the same items from a saved snapshot. Its storage adapter uses memory for a reproducible example; the repository only requires an AsyncStorage-style interface.

The React Native dependencies support static type checking of the UI samples. The demo and tests execute the data layer only. To render the controls, import them into an existing React Native application; this repository is a code sample rather than a standalone mobile app.

## Engineering choices

- Keep remote fetching, storage, and rendering behind separate interfaces.
- Preserve useful data when connectivity fails, and expose whether a result came from the cache.
- Treat storage and network payloads as untrusted until their shape is checked.
- Keep failed requests retryable, including requests shared by multiple consumers.
- Keep native inputs composable instead of hiding their event handlers and styling props.

## Publication scope

All example records are invented. Product screens, proprietary workflows, generation logic, prompts, ranking rules, datasets, branding, production endpoints, account configuration, and the private repository's history are excluded.

## Rights

Copyright © 2026 Enrico Spadaro. All rights reserved. Published for portfolio viewing and evaluation; no open-source license is granted. See [NOTICE](NOTICE). Third-party dependencies retain their own licenses.
