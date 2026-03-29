import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
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
          <p className="text-zinc-400 font-light">Painel de Acesso Premium</p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
