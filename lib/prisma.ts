// lib/prisma.ts
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const prisma = (globalThis as typeof globalThis & { prisma?: PrismaClient }).prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') (globalThis as typeof globalThis & { prisma?: PrismaClient }).prisma = prisma;

export default prisma;
