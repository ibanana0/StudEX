import 'dotenv/config';
import bcrypt = require('bcrypt');
import { Role } from '@prisma/client';
import prisma from '../config/prisma';

const SALT_ROUNDS = 12;

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase() || 'admin@studex.local';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD?.trim() || 'Admin12345!';
const ADMIN_USERNAME = process.env.ADMIN_SEED_USERNAME?.trim() || 'studexadmin';
const ADMIN_NAME = process.env.ADMIN_SEED_NAME?.trim() || 'StudEx Admin';
const ADMIN_PHONE = process.env.ADMIN_SEED_PHONE?.trim() || '+620000000000';
const ADMIN_FAKULTAS = process.env.ADMIN_SEED_FAKULTAS?.trim() || 'Administrasi';
const ADMIN_JURUSAN = process.env.ADMIN_SEED_JURUSAN?.trim() || 'Sistem';
const ADMIN_UNIVERSITAS = process.env.ADMIN_SEED_UNIVERSITAS?.trim() || 'StudEx Internal';

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      username: ADMIN_USERNAME,
      name: ADMIN_NAME,
      password: hashedPassword,
      phoneNumber: ADMIN_PHONE,
      fakultas: ADMIN_FAKULTAS,
      jurusan: ADMIN_JURUSAN,
      universitas: ADMIN_UNIVERSITAS,
      role: Role.ADMIN,
      isDriverVerified: false,
    },
    create: {
      username: ADMIN_USERNAME,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      phoneNumber: ADMIN_PHONE,
      fakultas: ADMIN_FAKULTAS,
      jurusan: ADMIN_JURUSAN,
      universitas: ADMIN_UNIVERSITAS,
      role: Role.ADMIN,
      isDriverVerified: false,
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  });

  console.log('Admin seed completed.');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`Role: ${admin.role}`);
}

seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
