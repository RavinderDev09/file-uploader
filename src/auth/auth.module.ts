import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './stratitgy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'hello@1234',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [JwtStrategy],
  exports: [],
})
export class AuthModule {}
