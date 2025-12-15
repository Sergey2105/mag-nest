import { AuthDto } from '@/auth/dto/auth.dto';
import { TUserSocial } from '@/auth/social-media/social-media-auth.types';
import { EmailService } from '@/email/email.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  // async findOrCreateSocialUser(profile: TUserSocial) {
  //   const email = profile.email;
  //   let user: User | null = null;

  //   if (email) {
  //     user = await this.getByEmail(email);
  //   }

  //   if (!user) {
  //     user = await this._createSocialUser(profile);
  //   }

  //   return user;
  // }

  async findOrCreateSocialUser(profile: TUserSocial) {
    const email = profile.email;
    let user: User | null = null;

    // Сначала ищем по telegramId
    if (profile.telegramId) {
      user = await this.prisma.user.findUnique({
        where: { telegramId: profile.telegramId },
      });

      if (user) {
        // Если нашли пользователя по telegramId
        if (email && !user.email) {
          // Проверяем, не занят ли этот email другим пользователем
          const emailTaken = await this.prisma.user.findUnique({
            where: { email },
          });

          if (emailTaken && emailTaken.id !== user.id) {
            throw new BadRequestException(
              'Этот email уже используется другим пользователем',
            );
          }

          // Email свободен, обновляем
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { email },
          });
        }
        return user;
      }
    }

    // Если не нашли по telegramId, ищем по email
    if (email) {
      user = await this.getByEmail(email);

      if (user) {
        // Проверяем, не занят ли этот telegramId другим пользователем
        if (profile.telegramId) {
          const telegramTaken = await this.prisma.user.findUnique({
            where: { telegramId: profile.telegramId },
          });

          if (telegramTaken && telegramTaken.id !== user.id) {
            throw new BadRequestException(
              'Этот Telegram аккаунт уже привязан к другому пользователю',
            );
          }

          // telegramId свободен, привязываем к существующему аккаунту
          if (!user.telegramId) {
            user = await this.prisma.user.update({
              where: { id: user.id },
              data: {
                telegramId: profile.telegramId,
                name: profile.name || user.name,
                avatarPath: profile.avatarPath || user.avatarPath,
              },
            });
          }
        }
        return user;
      }
    }

    // Создаем нового пользователя
    user = await this._createSocialUser(profile);
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

  // async update(id: string, data: Partial<User>) {
  //   const user = await this.prisma.user.update({
  //     where: {
  //       id,
  //     },
  //     data,
  //   });

  //   await this.emailService.sendVerification(
  //     user.email,
  //     `${VERIFY_EMAIL_URL}${user.verificationToken}`,
  //   );

  //   return user;
  // }
  async update(id: string, data: Partial<User>) {
    // Проверяем email если он обновляется
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Этот email уже используется');
      }
    }

    // Проверяем telegramId если он обновляется
    if (data.telegramId) {
      const existingUser = await this.prisma.user.findUnique({
        where: { telegramId: data.telegramId },
      });

      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException(
          'Этот Telegram уже привязан к другому аккаунту',
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
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
