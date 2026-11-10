import { createCatalogRepository } from "../dist/data/catalogRepository.js";

// Synthetic fixtures and memory storage: no account, network, or native app needed.
const entries = [
  { id: "demo-1", title: "TypeScript basics", category: "article", summary: "Small typed interfaces" },
  { id: "demo-2", title: "Layout practice", category: "video", summary: "Responsive UI composition" },
  { id: "demo-3", title: "Testing async code", category: "article", summary: "Errors and retries" },
];
const saved = new Map();
let online = true;
const repository = createCatalogRepository({
  storage: {
    getItem: async (key) => saved.get(key) ?? null,
    setItem: async (key, value) => { saved.set(key, value); },
  },
  fetchEntries: async () => {
    if (!online) throw new Error("Simulated offline connection");
    return entries;
  },
});

for (const connected of [true, false]) {
  online = connected;
  const result = await repository.loadPage({ category: "article", pageSize: 5 });
  console.log(`${online ? "Online" : "Offline"}: source=${result.source}, total=${result.total}`);
  for (const entry of result.entries) console.log(`  ${entry.title}`);
}
