"use client"

import { useTransition, useState } from "react"
import { registerCustomer } from "@/app/actions/register"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ShieldAlert, CheckCircle } from "lucide-react"

export default function CadastroPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPasswordError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setPasswordError("As senhas não coincidem.")
      return
    }

    startTransition(async () => {
      const result = await registerCustomer(formData)
      if (result.error) {
        setError(result.error)
      } else {
        router.push("/login?registered=1")
      }
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-900 to-black" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d4a017] rounded-full blur-[150px] opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-black text-white font-outfit uppercase tracking-tighter mb-2">
              Morauto<span className="text-[#d4a017]">.</span>
            </h1>
          </Link>
          <p className="text-zinc-400 font-light">Crie sua conta e acesse o portal do cliente</p>
        </div>

        <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4a017] to-transparent opacity-50" />

          <h2 className="text-xl font-bold text-white mb-6">Criar conta gratuita</h2>

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <ShieldAlert size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
                Nome completo <span className="text-[#d4a017]">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="João da Silva"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
                E-mail <span className="text-[#d4a017]">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="joao@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Senha e Confirmar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Senha <span className="text-[#d4a017]">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Min. 6 caracteres"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Confirmar senha <span className="text-[#d4a017]">*</span>
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:bg-white/10 transition-all ${
                    passwordError ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#d4a017]/50"
                  }`}
                />
                {passwordError && (
                  <p className="text-red-400 text-xs mt-1">{passwordError}</p>
                )}
              </div>
            </div>

            {/* Telefone e CPF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Telefone <span className="text-[#d4a017]">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="(92) 99999-0000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  CPF <span className="text-[#d4a017]">*</span>
                </label>
                <input
                  name="document"
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            {/* CNH e Vencimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  CNH <span className="text-zinc-600">(opcional)</span>
                </label>
                <input
                  name="cnh"
                  type="text"
                  placeholder="00000000000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Vencimento CNH <span className="text-zinc-600">(opcional)</span>
                </label>
                <input
                  name="cnhExpiration"
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 rounded-xl bg-[#d4a017] text-black font-bold hover:bg-[#b8860b] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <><Loader2 size={20} className="animate-spin" /> Criando conta...</>
              ) : (
                "Criar conta grátis"
              )}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-[#d4a017] hover:text-[#b8860b] font-semibold transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
