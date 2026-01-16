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
      const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

      if (process.env.NODE_ENV === 'production') {
        prismaInstance = new PrismaClient({
          // @ts-ignore
          datasourceUrl: url
        });
      } else {
        if (!(global as any).prisma) {
          (global as any).prisma = new PrismaClient({
            // @ts-ignore
            datasourceUrl: url
          });
        }
        prismaInstance = (global as any).prisma;
      }
    }

    return (prismaInstance as any)[prop];
  }
});

export default prisma;
