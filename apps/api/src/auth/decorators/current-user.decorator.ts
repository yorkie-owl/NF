import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { CurrentUser as CurrentUserType } from '@lin-shi/contracts';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUserType }>();
    if (!request.user) {
      throw new Error('CurrentUser decorator used without JwtAuthGuard');
    }
    return request.user;
  },
);
