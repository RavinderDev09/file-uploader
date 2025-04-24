import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'hello@1234', // same as used in sign()
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}

// jwt-payload.interface.ts
export interface JwtPayload {
    email: string;
    sub: string; // User ID (MongoDB ObjectId is a string)
  }
  