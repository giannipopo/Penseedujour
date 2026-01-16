import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: './prisma/schema.prisma',
    datasource: {
        // Fournir une valeur par défaut vide pendant le build pour éviter les erreurs de config
        url: process.env.DATABASE_URL || "postgresql://unused:unused@localhost:5432/unused",
    },
});
