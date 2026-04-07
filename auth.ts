import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",  type: "email"    },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const { db }     = await import("./lib/db")
          const { default: bcrypt } = await import("bcryptjs")

          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user || !user.password) return null

          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          return passwordsMatch ? user : null
        } catch (err) {
          console.error("[auth] authorize error:", err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    // Cria o usuário no banco na primeira vez que entra com Google
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { db } = await import("./lib/db")
          let dbUser = await db.user.findUnique({ where: { email: user.email! } })
          if (!dbUser) {
            dbUser = await db.user.create({
              data: {
                email: user.email!,
                name:  user.name,
                image: user.image,
                role:  "CUSTOMER",
              },
            })
          }
          user.id = dbUser.id
          ;(user as any).role = dbUser.role
        } catch (err) {
          console.error("[auth] Google signIn error:", err)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      // Primeiro login — seta dados no token
      if (user) {
        token.id   = user.id
        token.role = (user as any).role ?? "CUSTOMER"
      }
      // Google OAuth — garante que role está no token
      if (account?.provider === "google" && token.email && !token.role) {
        try {
          const { db } = await import("./lib/db")
          const dbUser = await db.user.findUnique({ where: { email: token.email } })
          if (dbUser) {
            token.role = dbUser.role
            token.id   = dbUser.id
          }
        } catch {}
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string
        ;(session.user as any).id  = token.id  as string
      }
      return session
    },
  },
})
