import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const isBuild =
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.IS_BUILD === 'true';

    if (isBuild) {
      const mock: any = new Proxy(() => Promise.resolve(null), {
        get: () => mock
      });
      return mock;
    }

    if (!prismaInstance) {
      // On essaie de récupérer l'URL de n'importe quelle source Vercel
      const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;

      console.log("Démarrage de Prisma avec URL locale/Vercel détectée");

      try {
        prismaInstance = new PrismaClient({
          datasources: {
            db: {
              url: databaseUrl
            }
          }
        });
      } catch (e) {
        console.error("CRITICAL: Erreur lors de l'instanciation de PrismaClient :", e);
        throw e;
      }
    }

    return (prismaInstance as any)[prop];
  }
});

export default prisma;
