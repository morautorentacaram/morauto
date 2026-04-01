import type { PrismaClient } from "@prisma/client";

// All heavy imports are inside getDb() so importing this module
// at build time is completely safe — no pg/PrismaPg loaded until first use.
declare global {
  var prisma: PrismaClient | undefined;
}

async function createClient(): Promise<PrismaClient> {
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

function getDb(): PrismaClient {
  if (globalThis.prisma) return globalThis.prisma;
  // Synchronous stub: actual client is resolved lazily via Promise on first real call
  throw new Error(
    "db not initialized — call initDb() at the start of your handler"
  );
}

let _dbPromise: Promise<PrismaClient> | null = null;

function getDbAsync(): Promise<PrismaClient> {
  if (!_dbPromise) {
    _dbPromise = createClient().then((client) => {
      if (process.env.NODE_ENV !== "production") globalThis.prisma = client;
      return client;
    });
  }
  return _dbPromise;
}

// Proxy that resolves the client on first property access
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    // Return a function that awaits the client and proxies the call
    if (globalThis.prisma) {
      return (globalThis.prisma as any)[prop];
    }
    // Return a Proxy that lazily initializes on call
    return new Proxy(function () {}, {
      apply(_fn, _this, args) {
        return getDbAsync().then((client) => {
          const method = (client as any)[prop];
          if (typeof method === "function") {
            return method.apply(client, args);
          }
          return method;
        });
      },
      get(_t, innerProp) {
        return new Proxy(function () {}, {
          apply(_fn2, _this2, args2) {
            return getDbAsync().then((client) => {
              const model = (client as any)[prop];
              const method = model?.[innerProp];
              if (typeof method === "function") {
                return method.apply(model, args2);
              }
              return method;
            });
          },
        });
      },
    });
  },
});
