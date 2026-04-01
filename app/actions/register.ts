"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function registerCustomer(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const phone = formData.get("phone") as string
    const document = formData.get("document") as string
    const cnh = formData.get("cnh") as string
    const cnhExpirationRaw = formData.get("cnhExpiration") as string

    if (!name || !email || !password || !phone || !document) {
      return { error: "Preencha todos os campos obrigatórios." }
    }

    if (password.length < 6) {
      return { error: "A senha deve ter no mínimo 6 caracteres." }
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "Este e-mail já está cadastrado." }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "CUSTOMER",
        },
      })

      await tx.customer.create({
        data: {
          userId: user.id,
          type: "PF",
          document: document.replace(/\D/g, ""),
          phone: phone.replace(/\D/g, ""),
          cnh: cnh ? cnh.replace(/\D/g, "") : null,
          cnhExpiration: cnhExpirationRaw ? new Date(cnhExpirationRaw) : null,
        },
      })
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error registering customer:", error)
    if (error.code === "P2002") {
      return { error: "CPF, CNH ou e-mail já cadastrado no sistema." }
    }
    return { error: "Erro ao criar conta. Tente novamente." }
  }
}
