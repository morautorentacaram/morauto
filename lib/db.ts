// lib/db.ts
// Only a type-level import at module scope — safe for static build / Turbopack.
// The actual PrismaClient + pg are loaded lazily on first use at runtime.

import type { PrismaClient } from "@prisma/client"

let _db: PrismaClient | undefined

async function getDb(): Promise<PrismaClient> {
  if (_db) return _db
  const { PrismaClient } = await import("@prisma/client")
  const { PrismaPg }     = await import("@prisma/adapter-pg")
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  _db = new PrismaClient({ adapter })
  return _db
}

function makeProxy(prop: string) {
  // Returns a callable proxy so both db.user.findMany() and db.$transaction() work
  const callable = (...args: unknown[]) =>
    getDb().then((c) => {
      const target = (c as any)[prop]
      return typeof target === "function" ? target.apply(c, args) : target
    })

  return new Proxy(callable as any, {
    get(_, method: string) {
      return (...args: unknown[]) =>
        getDb().then((c) => {
          const model = (c as any)[prop]
          return model[method].apply(model, args)
        })
    },
  })
}

export const db = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    if (_db) return (_db as any)[prop]
    return makeProxy(prop)
  },
})
