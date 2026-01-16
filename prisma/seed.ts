import { PrismaClient } from '@prisma/client';

// For Prisma 7 scripts, if ENV is not working, we manually override the connection string
// via the config function instead of constructor properties if available, 
// OR we rely on the process sync.
const prisma = new PrismaClient();

async function main() {
    console.log("Checking connection...");
    // Create a dev user
    const devUser = await prisma.user.upsert({
        where: { id: 'dev-user-123' },
        update: {},
        create: {
            id: 'dev-user-123',
            email: 'dev@example.com',
            displayName: 'Aristote',
            name: 'Aristote',
        },
    });

    console.log({ devUser });

    // Create some thoughts
    const thoughts = [
        {
            userId: devUser.id,
            content: "Le commencement est la moitié de tout.",
            dateKey: "2026-01-14",
            createdAt: new Date("2026-01-14T08:00:00Z"),
        },
        {
            userId: devUser.id,
            content: "La patience est amère, mais son fruit est doux.",
            dateKey: "2026-01-15",
            createdAt: new Date("2026-01-15T08:00:00Z"),
        },
    ];

    for (const t of thoughts) {
        await prisma.thought.upsert({
            where: {
                userId_dateKey: {
                    userId: t.userId,
                    dateKey: t.dateKey,
                },
            },
            update: {},
            create: t,
        });
    }

    console.log('Seed completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
