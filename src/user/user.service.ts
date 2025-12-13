import { AuthDto } from '@/auth/dto/auth.dto';
import { TUserSocial } from '@/auth/social-media/social-media-auth.types';
import { EmailService } from '@/email/email.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { hash } from 'argon2';
import { VERIFY_EMAIL_URL } from '@/constants';

type UserWithFavorites = Prisma.UserGetPayload<{
  include: { favorites: true };
}>;

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        name: true,
        email: true,
        id: true,
        password: false,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      // добавил include
      // include: {
      //   favorites: true,
      // },
    });
  }

  async getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findOrCreateSocialUser(profile: TUserSocial) {
    const email = profile.email;
    let user: User | null = null;

    if (email) {
      user = await this.getByEmail(email);
    }

    if (!user) {
      user = await this._createSocialUser(profile);
    }

    return user;
  }

  private async _createSocialUser(profile: TUserSocial): Promise<User> {
    const verificationToken = profile.email
      ? {
          verificationToken: null,
        }
      : {};

    return this.prisma.user.create({
      data: {
        email: profile.email || '',
        name: profile.name || '',
        password: '',
        ...verificationToken,
        avatarPath: profile.avatarPath || null,
      },
    });
  }

  async create(dto: AuthDto) {
    return this.prisma.user.create({
      data: {
        ...dto,
        password: await hash(dto.password),
      },
    });
  }

  async update(id: string, data: Partial<User>) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data,
    });

    await this.emailService.sendVerification(
      user.email,
      `${VERIFY_EMAIL_URL}${user.verificationToken}`,
    );

    return user;
  }
  async toggleFavorites(productId: string, userId: string) {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
      include: { favorites: true },
    })) as UserWithFavorites;

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isExists = user.favorites.some((fav) => fav.productId === productId);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        favorites: {
          [isExists ? 'disconnect' : 'connect']: {
            productId,
          },
        },
      },
    });

    return { success: true, isFavorite: !isExists };
  }
}
