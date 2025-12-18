import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Cart, User } from 'generated/prisma/client';

export type TUser = User & {
  cart: Cart;
};

export const CurrentUser = createParamDecorator(
  (data: keyof TUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    return data ? user[data] : user;
  },
);
