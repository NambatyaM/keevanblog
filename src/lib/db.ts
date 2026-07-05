import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL env var is required')
  }

  if (url.startsWith('libsql:') || url.startsWith('http:') || url.startsWith('https:')) {
    const adapter = new PrismaLibSql({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN,
    })
    return new PrismaClient({ adapter })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['query', 'warn', 'error'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
