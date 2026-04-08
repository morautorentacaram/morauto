import type { NextAuthConfig } from "next-auth"

// Lightweight config — no Node.js modules (bcrypt, Prisma) — safe for Edge Runtime
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string
        ;(session.user as any).id = token.id as string
      }
      return session
    },
  },
}
