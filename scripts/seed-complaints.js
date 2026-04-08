const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Create a dummy tenant
    let tenant = await prisma.user.findFirst({ where: { role: 'TENANT' } });
    if (!tenant) {
        tenant = await prisma.user.create({
            data: {
                name: "John Doe",
                email: "tenant@example.com",
                password: "password123",
                role: "TENANT",
                phone: "9876543210"
            }
        });
        console.log("Created dummy tenant:", tenant.name);
    }

    const properties = await prisma.property.findMany();

    if (properties.length === 0) {
        console.log("Not enough properties to seed complaints.");
        return;
    }

    const complaints = [
        {
            tenantId: tenant.id,
            propertyId: properties[0].id,
            title: "Leaking bathroom tap",
            description: "The tap in the common bathroom is continuously dripping and wasting water.",
            category: "Plumbing",
            status: "OPEN",
            priority: "MEDIUM"
        },
        {
            tenantId: tenant.id,
            propertyId: properties[0].id,
            title: "AC not cooling in Room 102",
            description: "The AC in my room is running but not cooling the air properly. Needs servicing.",
            category: "Electrical",
            status: "IN_PROGRESS",
            priority: "HIGH"
        },
        {
            tenantId: tenant.id,
            propertyId: properties[1]?.id || properties[0].id,
            title: "Wifi speed issue",
            description: "The internet speed in the kitchen area is very low. Broadband router might need a restart.",
            category: "Others",
            status: "OPEN",
            priority: "LOW"
        }
    ];

    for (const c of complaints) {
        await prisma.complaint.create({ data: c });
    }

    console.log("Seeded 3 sample complaints.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
