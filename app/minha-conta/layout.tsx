import { auth } from "@/auth"
import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"

export default async function MinhaContaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar session={session} />
      {children}
      <Footer />
    </div>
  )
}
