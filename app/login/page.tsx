import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const { registered } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-900 to-black" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d4a017] rounded-full blur-[150px] opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white font-outfit uppercase tracking-tighter mb-2">
            Morauto<span className="text-[#d4a017]">.</span>
          </h1>
          <p className="text-zinc-400 font-light">Acesse sua conta ou cadastre-se</p>
        </div>

        {registered === "1" && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400">
            <CheckCircle size={20} className="flex-shrink-0" />
            <p className="font-semibold text-sm">
              Cadastro realizado! Faça login para continuar.
            </p>
          </div>
        )}

        <Suspense fallback={<div className="bg-zinc-950/50 border border-white/10 rounded-3xl p-8 h-64 animate-pulse" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-zinc-500 text-sm mt-6">
          Novo cliente?{" "}
          <Link href="/cadastro" className="text-[#d4a017] hover:text-[#b8860b] font-semibold transition-colors">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </main>
  )
}
