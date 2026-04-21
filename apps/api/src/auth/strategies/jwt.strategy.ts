import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  CurrentUserSchema,
  JwtPayloadSchema,
  type CurrentUser,
  type JwtPayload,
} from '@lin-shi/contracts';
import type { Env } from '../../config/env.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * Passport puts whatever we return onto `req.user`. We parse the JWT payload
   * with zod to make sure downstream consumers always get a typed, validated
   * `CurrentUser`.
   */
  validate(payload: unknown): CurrentUser {
    const parsed: JwtPayload = JwtPayloadSchema.parse(payload);
    return CurrentUserSchema.parse({
      id: parsed.sub,
      email: parsed.email,
    });
  }
}
