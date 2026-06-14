import 'dotenv/config';
import bcrypt = require('bcrypt');
import { Role } from '@prisma/client';
import prisma from '../config/prisma';

const SALT_ROUNDS = 12;

const DRIVER_EMAIL = 'driver@studex.local';
const DRIVER_PASSWORD = 'Driver12345!';
const DRIVER_USERNAME = 'studexdriver';
const DRIVER_NAME = 'Budi Driver';
const DRIVER_PHONE = '+6281234567890';
const DRIVER_FAKULTAS = 'Teknik';
const DRIVER_JURUSAN = 'Informatika';
const DRIVER_UNIVERSITAS = 'Universitas StudEx';

async function seedDriver() {
  const hashedPassword = await bcrypt.hash(DRIVER_PASSWORD, SALT_ROUNDS);

  // Buat atau Update User
  const driverUser = await prisma.user.upsert({
    where: { email: DRIVER_EMAIL },
    update: {
      username: DRIVER_USERNAME,
      name: DRIVER_NAME,
      password: hashedPassword,
      phoneNumber: DRIVER_PHONE,
      fakultas: DRIVER_FAKULTAS,
      jurusan: DRIVER_JURUSAN,
      universitas: DRIVER_UNIVERSITAS,
      role: Role.DRIVER,
      isDriverVerified: true,
    },
    create: {
      username: DRIVER_USERNAME,
      name: DRIVER_NAME,
      email: DRIVER_EMAIL,
      password: hashedPassword,
      phoneNumber: DRIVER_PHONE,
      fakultas: DRIVER_FAKULTAS,
      jurusan: DRIVER_JURUSAN,
      universitas: DRIVER_UNIVERSITAS,
      role: Role.DRIVER,
      isDriverVerified: true,
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  });

  // Buat Profil Driver jika belum ada
  await prisma.driverProfile.upsert({
    where: { userId: driverUser.id },
    update: {
      ktmUrl: 'dummy-ktm.jpg',
      qrisUrl: 'dummy-qris.jpg',
      isActive: true,
    },
    create: {
      userId: driverUser.id,
      ktmUrl: 'dummy-ktm.jpg',
      qrisUrl: 'dummy-qris.jpg',
      isActive: true,
    },
  });

  console.log('Driver seed completed.');
  console.log(`Email: ${DRIVER_EMAIL}`);
  console.log(`Password: ${DRIVER_PASSWORD}`);
  console.log(`Role: ${driverUser.role}`);
}

seedDriver()
  .catch((error) => {
    console.error('Driver seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
