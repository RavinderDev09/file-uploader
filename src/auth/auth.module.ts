import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './stratitgy';
import { JwtAuthGuard } from './auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'hello',
      signOptions: { expiresIn: '1d' },
    }),
  
  ],
  providers: [JwtStrategy],
  exports: [],
})
export class AuthModule {}
