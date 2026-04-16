import { PrismaClient } from '@prisma/client';
async function main() {
  const prisma = new PrismaClient();
  const propStats = await prisma.property.groupBy({ by: ['status'], _count: { id: true } });
  const roomStats = await prisma.room.groupBy({ by: ['status'], _count: { id: true } });
  const totalProp = await prisma.property.count();
  const totalRoom = await prisma.room.count();
  const sample = await prisma.property.findMany({ select: { id: true, title: true, status: true }, take: 10 });
  console.log('PROPERTIES:', JSON.stringify(propStats));
  console.log('ROOMS:', JSON.stringify(roomStats));
  console.log('Total properties:', totalProp, '| Total rooms:', totalRoom);
  console.log('SAMPLE:', JSON.stringify(sample, null, 2));
  await prisma.$disconnect();
}
main().catch(console.error);
