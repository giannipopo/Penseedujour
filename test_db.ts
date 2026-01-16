import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    adapter: null,
} as any);
async function test() {
    try {
        const users = await prisma.user.findMany();
        console.log('Users:', users);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
