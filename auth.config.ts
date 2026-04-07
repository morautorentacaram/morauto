import type { NextAuthConfig } from "next-auth"

// Lightweight config — no Node.js modules (bcrypt, Prisma) — safe for Edge Runtime
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
}
