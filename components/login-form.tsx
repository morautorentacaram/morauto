"use client"

import { useState, useTransition } from "react"
import { loginAction, googleLoginAction } from "@/actions/auth"
import { ShieldCheck, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function LoginForm() {
  const [error, setError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()
  const [isGooglePending, setIsGooglePending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
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

  const handleGoogle = async () => {
    setIsGooglePending(true)
    await googleLoginAction()
  }

  return (
    <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4a017] to-transparent opacity-50" />

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isGooglePending || isPending}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-3 rounded-xl transition-all disabled:opacity-60 mb-6"
      >
        {isGooglePending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
        )}
        Continuar com Google
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-zinc-600 text-xs uppercase tracking-widest">ou</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

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
          disabled={isPending || isGooglePending}
          className="w-full py-4 rounded-xl bg-[#d4a017] text-black font-bold hover:bg-[#b8860b] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : "Acessar"}
        </button>
      </form>
    </div>
  )
}
