import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'
import type { UserRole } from '@/lib/auth'

export type UserWithoutPassword = Omit<User, 'password'>;

export interface UserQueryOptions {
  email?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
}

export class UserRepository {
  static async findById(id: string): Promise<UserWithoutPassword | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async findMany(options: UserQueryOptions = {}): Promise<{
    users: UserWithoutPassword[];
    total: number;
  }> {
    const {
      email,
      role,
      page = 1,
      limit = 10,
    } = options;

    const where = {
      ...(email && { email: { contains: email } }),
      ...(role && { role }),
    };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  static async create(data: {
    email: string;
    name?: string;
    role?: UserRole;
  }): Promise<UserWithoutPassword> {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async updateRole(userId: string, role: UserRole): Promise<UserWithoutPassword> {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }
} 