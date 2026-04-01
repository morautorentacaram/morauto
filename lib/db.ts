import type { PrismaClient } from "@prisma/client";

// Only the type is imported at module level — completely safe during Vercel build.
// The actual pg/PrismaPg modules are loaded lazily on first db use.

let _client: PrismaClient | undefined;
let _initPromise: Promise<PrismaClient> | undefined;

async function getClientAsync(): Promise<PrismaClient> {
  if (_client) return _client;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    const client = new PrismaClient({ adapter });
    _client = client;
    return client;
  })();

  return _initPromise;
}

// db.model.method(args) — two-level Proxy:
//   Level 1: db.user      → model proxy
//   Level 2: db.user.findUnique({...}) → awaits client, calls real method
//
// db.$transaction(fn) / db.$connect() — also handled via apply on level-1 proxy.
export const db = new Proxy({} as PrismaClient, {
  get(_, modelProp: string | symbol) {
    // Fast path: client already initialized
    if (_client) return (_client as any)[modelProp];

    // Return a proxy that handles both:
    //   db.$transaction(fn)  → apply trap (called as function on level-1)
    //   db.user.findUnique() → get trap on level-2
    return new Proxy(
      // Must be a function so the apply trap works for $-methods
      Object.assign(
        (...args: unknown[]) =>
          getClientAsync().then((c) => {
            const target = (c as any)[modelProp];
            return typeof target === "function" ? target.apply(c, args) : target;
          }),
        {}
      ),
      {
        // db.user.create({...}), db.user.findMany(), etc.
        get(_, methodProp: string | symbol) {
          return (...args: unknown[]) =>
            getClientAsync().then((c) => {
              const model = (c as any)[modelProp];
              const fn = model?.[methodProp];
              return typeof fn === "function" ? fn.apply(model, args) : fn;
            });
        },
      }
    );
  },
});
