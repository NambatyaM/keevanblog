import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

/**
 * Database client.
 *
 * Supports TWO modes:
 *  1. Local SQLite (sandbox/dev): DATABASE_URL=file:/path/to/custom.db
 *  2. Turso (production):         DATABASE_URL=libsql://...?authToken=...
 *
 * The mode is auto-detected from the DATABASE_URL scheme. No code changes
 * needed when promoting from dev → prod — just swap the env var.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL env var is required')
  }

  // Turso / libsql mode
  if (url.startsWith('libsql:') || url.startsWith('http:') || url.startsWith('https:')) {
    const libsql = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
  }

  // Local SQLite mode (sandbox/dev)
  return new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['query', 'warn', 'error'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
