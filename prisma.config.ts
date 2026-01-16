import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: './prisma/schema.prisma',
    datasource: {
        // On essaie les différents noms que Vercel/Neon peuvent donner à la variable
        url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    },
});
