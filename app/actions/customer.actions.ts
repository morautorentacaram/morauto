"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  try {
    return await db.customer.findMany({
      include: {
        user: true,
        _count: {
          select: { reservations: true }
        }
      },
      orderBy: { user: { name: 'asc' } }
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
}

export async function createCustomer(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const type = formData.get("type") as string; // PF or PJ
    const document = formData.get("document") as string; // CPF/CNPJ
    const cnh = formData.get("cnh") as string;
    const cnhExpirationRaw = formData.get("cnhExpiration") as string;

    if (!name || !email || !document || !type) {
      return { error: "Nome, E-mail, Tipo e Documento são obrigatórios." };
    }

    // Check if user already exists
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      user = await db.user.create({
        data: {
          name,
          email,
          role: "CUSTOMER",
          // Random strong password will prevent unauthorized direct logins if local provider is used.
          // Later they can "Reset Password" or use Google Auth since the emails will match.
        }
      });
    }

    // Check if customer explicitly exists
    const existingCustomer = await db.customer.findUnique({ where: { userId: user.id } });
    if (existingCustomer) {
      return { error: "Este e-mail já possui um registro de Cliente associado." };
    }

    // Create the customer record
    await db.customer.create({
      data: {
        userId: user.id,
        type,
        document: document.replace(/\D/g, ''),
        phone: phone.replace(/\D/g, ''),
        cnh: cnh ? cnh.replace(/\D/g, '') : null,
        cnhExpiration: cnhExpirationRaw ? new Date(cnhExpirationRaw) : null,
      }
    });

    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating customer:", error);
    if (error.code === 'P2002') {
      return { error: "Documento (CPF/CNPJ) ou CNH já cadastrados no sistema." };
    }
    return { error: "Erro ao cadastrar cliente." };
  }
}

export async function blockCustomer(id: string, reason: string) {
  try {
    await db.customer.update({
      where: { id },
      data: { blocked: true, blockedReason: reason },
    })
    revalidatePath("/admin/clientes")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao bloquear cliente." }
  }
}

export async function unblockCustomer(id: string) {
  try {
    await db.customer.update({
      where: { id },
      data: { blocked: false, blockedReason: null },
    })
    revalidatePath("/admin/clientes")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao desbloquear cliente." }
  }
}

export async function updateCustomerScore(id: string, score: number) {
  try {
    await db.customer.update({
      where: { id },
      data: { score: Math.max(0, Math.min(100, score)) },
    })
    revalidatePath("/admin/clientes")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Erro ao atualizar score." }
  }
}

export async function getCustomerById(id: string) {
  return db.customer.findUnique({
    where: { id },
    include: {
      user: true,
      reservations: {
        include: { vehicle: { include: { category: true } }, payments: true },
        orderBy: { createdAt: "desc" },
      },
      contracts: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  })
}

export async function deleteCustomer(id: string) {
  try {
    const resCount = await db.reservation.count({ where: { customerId: id } });
    if (resCount > 0) {
      return { error: "Cliente possui histórico de reservas. Não é possível excluir, apenas desativar." };
    }

    const customer = await db.customer.findUnique({ where: { id } });
    if (customer) {
      await db.customer.delete({ where: { id } });
      // We don't delete the User account directly in case they use it for something else,
      // but if strictly asked, we could.
    }
    
    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { error: "Erro ao deletar cliente." };
  }
}
