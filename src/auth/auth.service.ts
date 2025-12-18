import { VERIFY_EMAIL_URL } from '@/constants';
import { EmailService } from '@/email/email.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { omit } from 'lodash';
import { AuthDto } from './dto/auth.dto';
import { Role, User } from 'generated/prisma/client';
import { CartService } from '@/cart/cart.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private emailService: EmailService,
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  private readonly TOKEN_EXPIRATION_ACCESS = '1h';
  private readonly TOKEN_EXPIRATION_REFRESH = '7d';

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);
    return this.buildResponseObject(user);
  }

  async register({ cartItems, ...dto }: RegisterDto) {
    const userExists = await this.userService.getByEmail(dto.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    const user = await this.userService.create(dto);

    await this.emailService.sendVerification(
      user.email,
      `${VERIFY_EMAIL_URL}${user.verificationToken}`,
    );

    if (cartItems && cartItems.length > 0) {
      await this.cartService.syncCart(user.id, {
        items: cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
      });
    }

    return this.buildResponseObject(user);
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);
    if (!result) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userService.getById(result.id);
    return this.buildResponseObject(user);
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) throw new NotFoundException('Token not exists!');

    await this.userService.update(user.id, {
      verificationToken: null,
    });

    return 'Email verified!';
  }

  async buildResponseObject(user: User) {
    const tokens = await this.issueTokens(user.id, user.rights || []);
    return { user: this.omitPassword(user), ...tokens };
  }

  private async issueTokens(userId: string, rights: Role[]) {
    const payload = { id: userId, rights };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.TOKEN_EXPIRATION_ACCESS,
    });
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: this.TOKEN_EXPIRATION_REFRESH,
    });
    return { accessToken, refreshToken };
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.userService.getByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email or password invalid');
    }
    const isValid = await verify(user.password, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Email or password invalid');
    }
    return user;
  }

  private omitPassword(user: User) {
    return omit(user, ['password']);
  }
}
