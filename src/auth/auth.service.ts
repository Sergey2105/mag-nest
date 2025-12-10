// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { UserService } from '../user/user.service';
// import { PrismaService } from '../prisma.service';
// import { AuthDto } from './dto/auth.dto';
// import { Response } from 'express';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class AuthService {
//   EXPIRE_DAY_REFRESH_TOKEN = 1;
//   REFRESH_TOKEN_NAME = 'refreshToken';

//   constructor(
//     private jwt: JwtService,
//     private userService: UserService,
//     private prisma: PrismaService,
//     private configService: ConfigService,
//   ) {}

//   async login(dto: AuthDto) {
//     const user = await this.validateUser(dto);

//     const tokens = this.issueTokens(user.id);

//     return { user, ...tokens };
//   }
//   async register(dto: AuthDto) {
//     const oldUser = await this.userService.getByEmail(dto.email);

//     if (oldUser) throw new BadRequestException('Пользователь уже существует');

//     const user = await this.userService.create(dto);
//     const tokens = this.issueTokens(user.id);

//     return { user, ...tokens };
//   }

//   issueTokens(userId: string) {
//     const data = { id: userId };

//     const accessToken = this.jwt.sign(data, {
//       expiresIn: '1h',
//     });

//     const refreshToken = this.jwt.sign(data, {
//       expiresIn: '7d',
//     });
//     return { accessToken, refreshToken };
//   }

//   private async validateUser(dto: AuthDto) {
//     const user = await this.userService.getByEmail(dto.email);

//     if (!user) throw new NotFoundException('Пользователь не найден');

//     return user;
//   }

//   async validateOAuthLogin(req: any) {
//     let user = await this.userService.getByEmail(req.user.email);

//     if (!user) {
//       user = await this.prisma.user.create({
//         data: {
//           email: req.user.email,
//           name: req.user.name,
//           picture: req.user.picture,
//         },
//         include: {
//           favorites: true,
//           orders: true,
//         },
//       });
//     }
//     const tokens = this.issueTokens(user.id);
//     return { user, ...tokens };
//   }

//   addRefreshTokenToResponse(res: Response, refreshToken: string) {
//     const expiresIn = new Date();
//     expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

//     res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
//       httpOnly: true,
//       domain: this.configService.get('SERVER_DOMAIN'),
//       expires: expiresIn,
//       secure: true,
//       sameSite: 'none', // lax на проде
//     });
//   }

//   removeRefreshTokenFromResponse(res: Response) {
//     res.cookie(this.REFRESH_TOKEN_NAME, '', {
//       httpOnly: true,
//       domain: this.configService.get('SERVER_DOMAIN'),
//       expires: new Date(0),
//       secure: true,
//       sameSite: 'none', // lax на проде
//     });
//   }
// }

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { User } from '../../generated/prisma/client.js';
import { AuthDto } from './dto/auth.dto.js';
import { UserService } from '../user/user.service.js';
import { PrismaService } from '../prisma.service.js';
// import { verify } from 'argon2';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface OAuthUser {
  email: string;
  name: string;
  picture?: string;
  googleId?: string;
  yandexId?: string;
}

interface JwtPayload {
  id: string;
}

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 7;
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async login(dto: AuthDto): Promise<AuthResponse> {
    const user = await this.validateUser(dto);
    const tokens = this.issueTokens(user.id);

    return { user, ...tokens };
  }

  async register(dto: AuthDto): Promise<AuthResponse> {
    const oldUser = await this.userService.getByEmail(dto.email);

    if (oldUser) throw new BadRequestException('Пользователь уже существует');

    const user = await this.userService.create(dto);
    const tokens = this.issueTokens(user.id);

    return { user, ...tokens };
  }

  async validateOAuthLogin(oauthUser: OAuthUser): Promise<AuthResponse> {
    const user = await this.prisma.user.upsert({
      where: { email: oauthUser.email },
      create: {
        email: oauthUser.email,
        name: oauthUser.name,
        // picture: oauthUser.picture,
      },
      update: {
        name: oauthUser.name,
        // picture: oauthUser.picture,
      },
    });

    const tokens = this.issueTokens(user.id);

    return { user, ...tokens };
  }

  async getNewTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      const result = await this.jwt.verifyAsync<JwtPayload>(refreshToken);

      const user = await this.userService.getById(result.id);
      if (!user) throw new UnauthorizedException('Пользователь не найден');

      const tokens = this.issueTokens(user.id);

      return { user, ...tokens };
    } catch {
      throw new UnauthorizedException('Невалидный refresh token');
    }
  }

  private issueTokens(userId: string): Tokens {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: this.configService.get('JWT_EXPIRATION') || '1h',
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async validateUser(dto: AuthDto): Promise<User> {
    const user = await this.userService.getByEmail(dto.email);

    if (!user) throw new NotFoundException('Пользователь не найден');

    // Если используете пароли (не OAuth)
    // if (dto.password && user.password) {
    //   const isValid = await verify(user.password, dto.password);
    //   if (!isValid) throw new UnauthorizedException('Неверный пароль');
    // }

    return user;
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string): void {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: this.configService.get('SERVER_DOMAIN'),
      expires: expiresIn,
      secure: true,
      sameSite: 'none',
    });
  }

  removeRefreshTokenFromResponse(res: Response): void {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: this.configService.get('SERVER_DOMAIN'),
      expires: new Date(0),
      secure: true,
      sameSite: 'none',
    });
  }
}
