import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Lazy singleton — instantiated on first property access, never at module import.
// Static imports are safe because @prisma/client and pg are in serverExternalPackages.
declare global {
  var prisma: PrismaClient | undefined;
}

function getClient(): PrismaClient {
  if (globalThis.prisma) return globalThis.prisma;

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = client;
  }

  return client;
}

// Single-level Proxy: db.user returns the REAL Prisma delegate,
// so all model methods, includes, and $transaction work correctly.
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    return (getClient() as any)[prop];
  },
});
