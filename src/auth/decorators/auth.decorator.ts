import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

export const Auth = () => UseGuards(JwtAuthGuard);
