import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // PrismaAdapter removed — using JWT sessions (no DB session storage needed)
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",  type: "email"    },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          // Lazy imports — kept out of module scope so Turbopack never bundles
          // pg/PrismaClient into the shared SSR chunk during static build.
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
})
