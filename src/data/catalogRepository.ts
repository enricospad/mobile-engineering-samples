/** Adapted from the private app's content repositories; see docs/design-notes.md. */
export type CatalogEntry = {
  id: string;
  title: string;
  category: string;
  summary: string;
};

/** Compatible with an AsyncStorage-style adapter, without a native dependency. */
export type KeyValueStore = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

type RepositoryOptions = {
  fetchEntries: () => Promise<unknown>;
  storage: KeyValueStore;
};

type PageOptions = {
  page?: number;
  pageSize?: number;
  query?: string;
  category?: string;
};

export type CatalogResult = {
  entries: CatalogEntry[];
  source: "remote" | "cache";
  total: number;
};

const CACHE_KEY = "portfolio:catalog:v1";

function isCatalogEntry(value: unknown): value is CatalogEntry {
  if (!value || typeof value !== "object") return false;
  return (
    "id" in value && typeof value.id === "string" && value.id.trim() !== "" &&
    "title" in value && typeof value.title === "string" &&
    "category" in value && typeof value.category === "string" &&
    "summary" in value && typeof value.summary === "string"
  );
}

function decodeEntries(value: unknown): CatalogEntry[] {
  if (!Array.isArray(value) || !value.every(isCatalogEntry)) {
    throw new TypeError("Invalid catalog data");
  }

  // Keep only the public shape, and let a newer record replace the same ID.
  const byId = new Map<string, CatalogEntry>();
  for (const { id, title, category, summary } of value) {
    byId.set(id, { id, title, category, summary });
  }
  return Array.from(byId.values());
}

function filterPage(entries: CatalogEntry[], options: PageOptions) {
  const { query = "", category, page = 0, pageSize = 10 } = options;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = entries
    .filter((entry) => category === undefined || entry.category === category)
    .filter((entry) => {
      const text = [entry.title, entry.category, entry.summary].join(" ").toLowerCase();
      return terms.every((term) => text.includes(term));
    })
    .sort((a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id));

  const from = page * pageSize;
  return { entries: matches.slice(from, from + pageSize), total: matches.length };
}

/** Remote-first reads, with the last validated snapshot available offline. */
export function createCatalogRepository({ fetchEntries, storage }: RepositoryOptions) {
  let inFlight: Promise<{ entries: CatalogEntry[]; source: CatalogResult["source"] }> | null = null;

  async function readCache(): Promise<CatalogEntry[] | null> {
    try {
      const raw = await storage.getItem(CACHE_KEY);
      return raw === null ? null : decodeEntries(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  async function loadSnapshot() {
    try {
      const entries = decodeEntries(await fetchEntries());
      try {
        await storage.setItem(CACHE_KEY, JSON.stringify(entries));
      } catch {
        // A local storage failure must not hide a successful remote result.
      }
      return { entries, source: "remote" as const };
    } catch (remoteError) {
      const cached = await readCache();
      if (cached !== null) return { entries: cached, source: "cache" as const };
      throw remoteError;
    }
  }

  async function sharedSnapshot() {
    // Coalesce concurrent requests, then clear on success AND failure for retries.
    if (!inFlight) inFlight = loadSnapshot();
    const request = inFlight;
    try {
      return await request;
    } finally {
      if (inFlight === request) inFlight = null;
    }
  }

  return {
    async loadPage(options: PageOptions = {}): Promise<CatalogResult> {
      const { page = 0, pageSize = 10 } = options;
      if (!Number.isSafeInteger(page) || page < 0 ||
          !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 ||
          !Number.isSafeInteger((page + 1) * pageSize)) {
        throw new RangeError("Use a non-negative page and a page size from 1 to 100");
      }

      const { entries, source } = await sharedSnapshot();
      return { ...filterPage(entries, options), source };
    },
  };
}
