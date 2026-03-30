import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'supabase' }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [SupabaseStrategy, SupabaseAuthGuard, AuthService],
  exports: [SupabaseAuthGuard, PassportModule],
})
export class AuthModule {}
