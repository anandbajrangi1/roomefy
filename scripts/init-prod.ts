import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@roomefy.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('❌ Set ADMIN_PASSWORD (and optionally ADMIN_EMAIL) before running this script.');
    process.exit(1);
  }

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
  } catch (err) {
    console.error('❌ Error during initialization:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
