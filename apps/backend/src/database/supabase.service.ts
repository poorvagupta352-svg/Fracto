import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type AnySupabaseClient = SupabaseClient<any, any, any>;

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  private supabase: AnySupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    this.supabaseKey = this.configService.get<string>('SUPABASE_KEY') || '';

    if (!this.supabaseUrl || !this.supabaseKey) {
      this.logger.error('Supabase URL or Key is missing');
    }

    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  getClient(): AnySupabaseClient {
    return this.supabase;
  }

  // Returns a client authenticated as the user — required for RLS to work
  getUserClient(accessToken: string): AnySupabaseClient {
    const client = createClient(this.supabaseUrl, this.supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    });
    return client;
  }
}
