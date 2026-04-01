"use server"

import { signIn } from "@/auth"
import { auth } from "@/auth"
import { AuthError } from "next-auth"

export async function googleLoginAction() {
  await signIn("google", { redirectTo: "/" })
}

export async function loginAction(formData: FormData) {
  try {
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    })

    if (result?.error) {
      return { error: "Credenciais inválidas!" }
    }

    // Fetch session to get role for redirect
    const session = await auth()
    const role = (session?.user as any)?.role ?? "CUSTOMER"
    const isAdmin = role !== "CUSTOMER"

    return { success: true, role, redirectTo: isAdmin ? "/admin" : "/minha-conta" }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "E-mail ou senha incorretos." }
        default:
          return { error: "Algo deu errado. Tente novamente." }
      }
    }
    return { error: "Erro interno. Tente novamente." }
  }
}
