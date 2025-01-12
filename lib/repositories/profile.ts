import { prisma } from '@/lib/prisma'
import type { Profile, User } from '@prisma/client'

export type ProfileWithUser = Profile & {
  user: {
    email: string;
    name: string | null;
    role: string;
  };
};

export class ProfileRepository {
  static async findByUserId(userId: string): Promise<ProfileWithUser | null> {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  static async upsert(userId: string, data: {
    name?: string;
    bio?: string;
    specialty?: string;
    occupation?: string;
    website?: string;
    avatarUrl?: string;
  }): Promise<ProfileWithUser> {
    return prisma.profile.upsert({
      where: { userId },
      create: {
        ...data,
        userId,
      },
      update: data,
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  static async updateAvatar(userId: string, avatarUrl: string): Promise<Profile> {
    return prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        avatarUrl,
      },
      update: {
        avatarUrl,
      },
    });
  }
} 