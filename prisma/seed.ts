import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@roomefy.com' },
    update: {},
    create: {
      email: 'admin@roomefy.com',
      name: 'System Admin',
      password: hashedPassword,
      phone: '9876543210',
      role: 'ADMIN'
    }
  })

  // Create Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@roomefy.com' },
    update: {},
    create: {
      email: 'owner@roomefy.com',
      name: 'Property Owner',
      password: hashedPassword,
      phone: '9876543211',
      role: 'OWNER'
    }
  })

  // Create Properties and Rooms
  const p1 = await prisma.property.create({
    data: {
      title: 'Avenue Park Luxury Flats',
      city: 'Noida',
      area: 'Sector 16C',
      address: '123 Avenue Park, Sector 16C, Noida',
      ownerId: owner.id,
      rooms: {
        create: [
          {
            type: '1BHK',
            rent: 14000,
            deposit: 28000,
            amenities: JSON.stringify(['Fully Furnished Rooms', 'Swimming Pool', 'Clubhouse Access', 'Free Gym Access', 'Parking Space']),
            images: JSON.stringify([
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3', 
              'https://images.unsplash.com/photo-1502672260266-1c1de242409f?ixlib=rb-4.0.3'
            ]),
            status: 'AVAILABLE'
          },
          {
            type: 'Shared Room',
            rent: 8000,
            deposit: 16000,
            amenities: JSON.stringify(['Fully Furnished Rooms', 'Park & Garden Area', '24/7 Security']),
            images: JSON.stringify([
              'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3',
              'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3'
            ]),
            status: 'AVAILABLE'
          }
        ]
      }
    }
  })

  const p2 = await prisma.property.create({
    data: {
      title: 'Green Valley Residences',
      city: 'Gurgaon',
      area: 'Sector 56',
      address: 'Plot 45, Green Valley, Sector 56, Gurgaon',
      ownerId: owner.id,
      rooms: {
        create: [
          {
            type: 'Single Room',
            rent: 22000,
            deposit: 44000,
            amenities: JSON.stringify(['Fully Furnished Rooms', 'Free Gym Access', 'Clubhouse Access', 'Parking Space', '24/7 Security']),
            images: JSON.stringify([
              'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3',
              'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3'
            ]),
            status: 'AVAILABLE'
          }
        ]
      }
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
