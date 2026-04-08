import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@roomefy.com';
  const password = 'Admin@Roomefy2024';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('--- Production Initializer ---');
  console.log('Connecting to Neon...');
  
  try {
    const admin = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: 'System Admin',
        email,
        password: hashedPassword,
        role: 'ADMIN',
        verificationStatus: 'VERIFIED'
      }
    });
    
    console.log('✅ Success: Production Admin Created');
    console.log('Email:', admin.email);
    console.log('Password:', password);
  } catch (err) {
    console.error('❌ Error during initialization:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
