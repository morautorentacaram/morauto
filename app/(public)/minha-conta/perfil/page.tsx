import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/public/ProfileForm"

export const metadata = { title: "Meu Perfil — Morauto" }

export default async function PerfilPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/minha-conta/perfil")
  }

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  })

  if (!customer) {
    redirect("/minha-conta")
  }

  const defaultValues = {
    name: customer.user.name ?? "",
    phone: customer.phone ?? "",
    cnh: customer.cnh ?? "",
    cnhExpiration: customer.cnhExpiration
      ? customer.cnhExpiration.toISOString().split("T")[0]
      : "",
    email: customer.user.email ?? "",
    document: customer.document,
    type: customer.type === "PF" ? "Pessoa Física (PF)" : "Pessoa Jurídica (PJ)",
    score: customer.score ?? 100,
    memberSince: new Date(customer.user.createdAt).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-outfit text-white">Meu Perfil</h1>
        <p className="text-zinc-400 mt-1">Gerencie suas informações pessoais</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
        <ProfileForm customerId={customer.id} defaultValues={defaultValues} />
      </div>
    </div>
  )
}
