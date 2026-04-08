const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany();
    const properties = await prisma.property.findMany();
    console.log("Users in DB:", users.map(u => ({ id: u.id, name: u.name, role: u.role })));
    console.log("Properties in DB:", properties.map(p => ({ id: p.id, title: p.title })));
}

check().catch(console.error).finally(() => prisma.$disconnect());
