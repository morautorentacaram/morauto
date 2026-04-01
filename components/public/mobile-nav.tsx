import { auth } from "@/auth"
import MobileNavClient from "./MobileNavClient"

export async function MobileNav() {
  const session = await auth()
  return <MobileNavClient isLoggedIn={!!session?.user} />
}
