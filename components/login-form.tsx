"use client"

import { useState, useTransition } from "react"
import { loginAction } from "@/actions/auth"
import { ShieldCheck, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function LoginForm() {
  const [error, setError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(undefined)

    const formData = new FormData(e.currentTarget)
    startTransition(() => {
      loginAction(formData).then((res) => {
        if (res?.error) {
          setError(res.error)
        } else {
          const destination = callbackUrl || (res as any).redirectTo || "/minha-conta"
          router.push(destination)
        }
      })
    })
  }

  return (
    <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4a017] to-transparent opacity-50" />

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-400 uppercase tracking-widest ml-1">
            E-mail
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all font-light"
            placeholder="seu@email.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-400 uppercase tracking-widest ml-1">
            Senha
          </label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-[#d4a017]/50 focus:bg-white/10 transition-all font-light"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm font-medium">
            <ShieldCheck size={16} /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 rounded-xl bg-[#d4a017] text-black font-bold hover:bg-[#b8860b] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : "Acessar"}
        </button>
      </form>

    </div>
  )
}
