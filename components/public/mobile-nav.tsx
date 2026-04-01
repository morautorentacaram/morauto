import { auth } from "@/auth"
import { db } from "@/lib/db"
import MobileNavClient from "./MobileNavClient"

export async function MobileNav() {
  const session = await auth()

  let pendingCount = 0
  if (session?.user?.id) {
    const customer = await db.customer.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (customer) {
      pendingCount = await db.payment.count({
        where: {
          reservation: { customerId: customer.id },
          status: "PENDING",
        },
      })
    }
  }

  return <MobileNavClient isLoggedIn={!!session?.user} pendingCount={pendingCount} />
}
