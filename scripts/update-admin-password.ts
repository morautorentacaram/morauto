import "dotenv/config"
import bcrypt from "bcryptjs"
import pg from "pg"

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

  const hashedPassword = await bcrypt.hash("Morauto2026", 10)

  try {
    // Try to update existing admin first
    const updateResult = await pool.query(
      `UPDATE "User" SET password = $1, "updatedAt" = NOW()
       WHERE email = $2`,
      [hashedPassword, "admin@morauto.com.br"]
    )

    if (updateResult.rowCount === 0) {
      // Admin doesn't exist — create it
      await pool.query(
        `INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, 'ADMIN', NOW(), NOW())`,
        ["admin@morauto.com.br", hashedPassword, "Admin Morauto"]
      )
      console.log("✅ Admin criado com sucesso!")
    } else {
      console.log("✅ Senha do admin atualizada com sucesso!")
    }

    console.log("   Email: admin@morauto.com.br")
    console.log("   Senha: Morauto2026")
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error("❌ Erro:", err)
  process.exit(1)
})
