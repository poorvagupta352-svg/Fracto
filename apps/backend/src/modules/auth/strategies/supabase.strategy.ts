import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';

type AnySupabaseClient = SupabaseClient<any, any, any>;

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private supabase: AnySupabaseClient;

  constructor(private configService: ConfigService) {
    super();

    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_KEY')!,
    );
  }

  async validate(
    req: Request,
  ): Promise<{ userId: string; email: string; accessToken: string }> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);

    const { data, error } = (await this.supabase.auth.getUser(token)) as {
      data: { user: { id: string; email?: string } | null };
      error: { message: string } | null;
    };

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      userId: data.user.id,
      email: data.user.email ?? '',
      accessToken: token,
    };
  }
}
