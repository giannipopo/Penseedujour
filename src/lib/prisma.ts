import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

/**
 * Proxy ultra-robuste pour Prisma 7.
 * Pendant la phase de build (Next.js prerendering), il renvoie des mocks qui ne font rien.
 * Au runtime (sur le site), il instancie la vraie connexion.
 */
const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    // Détection de la phase de build
    const isBuild =
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.IS_BUILD === 'true' ||
      process.env.VERCEL_ENV === 'production' && !process.env.DATABASE_URL && !process.env.POSTGRES_URL;

    if (isBuild) {
      // Pour éviter les erreurs de type pendant le build, on renvoie une fonction qui renvoie une promesse.
      // On utilise un Proxy récursif pour supporter prisma.user.findMany etc.
      const mock: any = new Proxy(() => Promise.resolve(null), {
        get: () => mock
      });
      return mock;
    }

    // Runtime : Instanciation réelle (Singleton)
    if (!prismaInstance) {
      if (process.env.NODE_ENV === 'production') {
        prismaInstance = new PrismaClient();
      } else {
        if (!(global as any).prisma) {
          (global as any).prisma = new PrismaClient();
        }
        prismaInstance = (global as any).prisma;
      }
    }

    return (prismaInstance as any)[prop];
  }
});

export default prisma;
