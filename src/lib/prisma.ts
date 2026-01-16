import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

/**
 * Proxy qui empêche l'instanciation de Prisma pendant la phase de build de Next.js.
 * Cela évite les erreurs de connexion à la base de données quand Vercel génère les pages statiques.
 */
const prismaProxy = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true';

    if (isBuild) {
      // Pour éviter les erreurs de type pendant le build, on renvoie un mock safe.
      // Si une fonction est appelée (ex: findMany), elle ne fera rien et renverra une promesse vide.
      return new Proxy(() => Promise.resolve(null), {
        get: () => () => Promise.resolve(null)
      });
    }

    // Instanciation réelle uniquement au runtime (hors build)
    if (!prismaInstance) {
      try {
        if (process.env.NODE_ENV === 'production') {
          prismaInstance = new PrismaClient();
        } else {
          if (!(global as any).prisma) {
            (global as any).prisma = new PrismaClient();
          }
          prismaInstance = (global as any).prisma;
        }
      } catch (e) {
        console.error("Prisma loading error:", e);
        // Fallback safe si instanciation impossible
        return new Proxy(() => Promise.resolve(null), {
          get: () => () => Promise.resolve(null)
        });
      }
    }

    return (prismaInstance as any)[prop];
  }
});

export default prismaProxy;
