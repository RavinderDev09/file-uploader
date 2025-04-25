import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// src/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET')||'hello',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub, // 👈 this MUST match what your controller expects
      username: payload.username,
      role: payload.role,
    };
  }
}

// jwt-payload.interface.ts
export interface JwtPayload {
    email: string;
    sub: string; // User ID (MongoDB ObjectId is a string)
  }
  