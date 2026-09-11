import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const prisma = globalForPrisma.lawnProPrisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.lawnProPrisma = prisma
}

export default prisma
