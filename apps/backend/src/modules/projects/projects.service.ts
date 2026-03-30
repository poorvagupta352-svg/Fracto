import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, Task, SingleResult, ListResult } from '../../common/types';

@Injectable()
export class ProjectsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId: string, accessToken: string): Promise<Project[]> {
    const client = this.supabaseService.getUserClient(accessToken);
    const { data, error } = (await client
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {
        ascending: false,
      })) as unknown as ListResult<Project>;

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async findOne(
    id: string,
    userId: string,
    accessToken: string,
  ): Promise<Project & { tasks: Task[] }> {
    const client = this.supabaseService.getUserClient(accessToken);
    const { data, error } = (await client
      .from('projects')
      .select('*, tasks(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single()) as unknown as SingleResult<Project & { tasks: Task[] }>;

    if (error || !data) throw new NotFoundException('Project not found');
    return data;
  }

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
    accessToken: string,
  ): Promise<Project> {
    const client = this.supabaseService.getUserClient(accessToken);
    const { data, error } = (await client
      .from('projects')
      .insert({ ...createProjectDto, user_id: userId })
      .select()
      .single()) as unknown as SingleResult<Project>;

    if (error) throw new BadRequestException(error.message);
    if (!data) throw new BadRequestException('Failed to create project');
    return data;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
    accessToken: string,
  ): Promise<Project> {
    const client = this.supabaseService.getUserClient(accessToken);
    const { data, error } = (await client
      .from('projects')
      .update({ ...updateProjectDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()) as unknown as SingleResult<Project>;

    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Project not found');
    return data;
  }

  async remove(
    id: string,
    userId: string,
    accessToken: string,
  ): Promise<{ message: string }> {
    const client = this.supabaseService.getUserClient(accessToken);
    const { error } = (await client
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)) as unknown as {
      error: { message: string } | null;
    };

    if (error) throw new BadRequestException(error.message);
    return { message: 'Project deleted successfully' };
  }
}
