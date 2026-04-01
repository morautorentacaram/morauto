import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Lazy singleton — only instantiated on first use, NOT at module evaluation
// This prevents pg from attempting a connection during Vercel build workers
declare global {
  var prisma: PrismaClient | undefined;
}

function getDb(): PrismaClient {
  if (globalThis.prisma) return globalThis.prisma;

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = client;
  }

  return client;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
