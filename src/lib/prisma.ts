import { PrismaClient } from '@prisma/client';

// SÉCURITÉ VERCEL : On s'assure que Prisma trouve l'URL peu importe son nom
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;

if (url && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = url;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasourceUrl: url,
  } as any);
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
