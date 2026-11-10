import assert from "node:assert/strict";
import test from "node:test";
import { createCatalogRepository } from "../dist/data/catalogRepository.js";

const fixtures = [
  { id: "demo-1", title: "TypeScript basics", category: "article", summary: "Small typed interfaces" },
  { id: "demo-2", title: "Layout practice", category: "video", summary: "Responsive UI composition" },
  { id: "demo-3", title: "Testing async code", category: "article", summary: "Errors and retries" },
];

function memoryStorage(initial = null) {
  let raw = initial;
  return {
    getItem: async () => raw,
    setItem: async (_key, value) => { raw = value; },
  };
}

test("filters all query terms across fields, applies category, and paginates consistently", async () => {
  const repository = createCatalogRepository({
    storage: memoryStorage(), fetchEntries: async () => fixtures,
  });
  const filtered = await repository.loadPage({ query: "  TYPESCRIPT  interfaces ", category: "article" });
  assert.deepEqual(filtered, { entries: [fixtures[0]], total: 1, source: "remote" });
  const second = await repository.loadPage({ page: 1, pageSize: 1 });
  assert.deepEqual(second.entries, [fixtures[2]]);
  assert.equal(second.total, 3);
  assert.deepEqual((await repository.loadPage({ page: 99 })).entries, []);
});

test("persists remote records and restores them through a new repository while offline", async () => {
  const storage = memoryStorage();
  await createCatalogRepository({ storage, fetchEntries: async () => fixtures }).loadPage();
  const offline = createCatalogRepository({
    storage, fetchEntries: async () => { throw new Error("Offline"); },
  });
  assert.deepEqual(await offline.loadPage({ query: "layout" }), {
    entries: [fixtures[1]], total: 1, source: "cache",
  });
});

test("deduplicates IDs and persists only the declared public fields", async () => {
  const storage = memoryStorage();
  const replacement = { ...fixtures[0], title: "Updated title" };
  const repository = createCatalogRepository({ storage, fetchEntries: async () => [
    { ...fixtures[0], extraField: "discard this field" }, replacement,
  ] });
  assert.deepEqual((await repository.loadPage()).entries, [replacement]);
  assert.deepEqual(JSON.parse(await storage.getItem("unused")), [replacement]);
});

test("returns successful remote data when local persistence is unavailable", async () => {
  const storage = {
    getItem: async () => { throw new Error("Storage unavailable"); },
    setItem: async () => { throw new Error("Storage full"); },
  };
  const repository = createCatalogRepository({ storage, fetchEntries: async () => fixtures });
  assert.equal((await repository.loadPage()).source, "remote");
});

test("an online empty result replaces a previous cache and remains a valid offline snapshot", async () => {
  const storage = memoryStorage(JSON.stringify(fixtures));
  let online = true;
  const repository = createCatalogRepository({ storage, fetchEntries: async () => {
    if (!online) throw new Error("Offline");
    return [];
  } });
  assert.deepEqual(await repository.loadPage(), { entries: [], total: 0, source: "remote" });
  online = false;
  assert.deepEqual(await repository.loadPage(), { entries: [], total: 0, source: "cache" });
});

for (const raw of [null, "{broken", "{}", '[{"id":"missing-fields"}]', '[null]']) {
  test(`preserves the remote error when no usable cache exists: ${raw}`, async () => {
    const original = new Error("Network unavailable");
    const repository = createCatalogRepository({
      storage: memoryStorage(raw), fetchEntries: async () => { throw original; },
    });
    await assert.rejects(repository.loadPage(), (error) => error === original);
  });
}

test("invalid remote payload falls back without overwriting the last good snapshot", async () => {
  const raw = JSON.stringify(fixtures);
  const storage = memoryStorage(raw);
  const repository = createCatalogRepository({ storage, fetchEntries: async () => [{ id: "invalid" }] });
  assert.equal((await repository.loadPage()).source, "cache");
  assert.equal(await storage.getItem("unused"), raw);
});

test("concurrent consumers share one fetch and receive independent filtered results", async () => {
  let calls = 0;
  let finish;
  const pending = new Promise((resolve) => { finish = resolve; });
  const repository = createCatalogRepository({ storage: memoryStorage(), fetchEntries: async () => {
    calls += 1;
    return pending;
  } });
  const first = repository.loadPage({ category: "article" });
  const second = repository.loadPage({ category: "video" });
  assert.equal(calls, 1);
  finish(fixtures);
  const results = await Promise.all([first, second]);
  assert.equal(results[0].total, 2);
  assert.equal(results[1].total, 1);
  await repository.loadPage();
  assert.equal(calls, 2, "later requests refresh rather than retaining a stale promise");
});

test("a rejected shared request does not poison later retries", async () => {
  let attempts = 0;
  const repository = createCatalogRepository({ storage: memoryStorage(), fetchEntries: async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("Temporary failure");
    return fixtures;
  } });
  const failed = await Promise.allSettled([repository.loadPage(), repository.loadPage()]);
  assert.ok(failed.every((result) => result.status === "rejected"));
  assert.equal(attempts, 1);
  assert.equal((await repository.loadPage()).source, "remote");
  assert.equal(attempts, 2);
});

test("rejects invalid pagination before calling the adapter", async () => {
  let called = false;
  const repository = createCatalogRepository({ storage: memoryStorage(), fetchEntries: async () => {
    called = true;
    return fixtures;
  } });
  for (const options of [
    { page: -1 }, { page: 0.5 }, { page: NaN }, { page: Number.MAX_SAFE_INTEGER },
    { pageSize: 0 }, { pageSize: 101 }, { pageSize: Infinity },
  ]) await assert.rejects(repository.loadPage(options), RangeError);
  assert.equal(called, false);
});
