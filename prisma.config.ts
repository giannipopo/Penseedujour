import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: './prisma/schema.prisma',
    datasource: {
        // On accepte DATABASE_URL ou POSTGRES_URL (injecté par Vercel)
        url: process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgresql://unused:unused@localhost:5432/unused",
    },
});
