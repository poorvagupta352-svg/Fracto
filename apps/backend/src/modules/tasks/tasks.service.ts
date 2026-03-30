import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, SingleResult, ListResult } from '../../common/types';

interface ProjectRow {
  id: string;
}

@Injectable()
export class TasksService {
  constructor(private supabaseService: SupabaseService) {}

  async findByProject(
    projectId: string,
    userId: string,
    accessToken: string,
  ): Promise<Task[]> {
    const client = this.supabaseService.getUserClient(accessToken);

    const { data: project, error: pError } = (await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()) as unknown as SingleResult<ProjectRow>;

    if (pError || !project) throw new NotFoundException('Project not found');

    const { data, error } = (await client
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })) as unknown as ListResult<Task>;

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async create(
    createTaskDto: CreateTaskDto,
    userId: string,
    accessToken: string,
  ): Promise<Task> {
    const client = this.supabaseService.getUserClient(accessToken);

    const { data: project, error: pError } = (await client
      .from('projects')
      .select('id')
      .eq('id', createTaskDto.project_id)
      .eq('user_id', userId)
      .single()) as unknown as SingleResult<ProjectRow>;

    if (pError || !project) throw new NotFoundException('Project not found');

    const { data, error } = (await client
      .from('tasks')
      .insert(createTaskDto)
      .select()
      .single()) as unknown as SingleResult<Task>;

    if (error) throw new BadRequestException(error.message);
    if (!data) throw new BadRequestException('Failed to create task');
    return data;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
    accessToken: string,
  ): Promise<Task> {
    const client = this.supabaseService.getUserClient(accessToken);

    const { data: task, error: tError } = (await client
      .from('tasks')
      .select('id, projects!inner(user_id)')
      .eq('id', id)
      .eq('projects.user_id', userId)
      .single()) as unknown as SingleResult<{ id: string }>;

    if (tError || !task) throw new NotFoundException('Task not found');

    const { data, error } = (await client
      .from('tasks')
      .update({ ...updateTaskDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()) as unknown as SingleResult<Task>;

    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Task not found');
    return data;
  }

  async remove(
    id: string,
    userId: string,
    accessToken: string,
  ): Promise<{ message: string }> {
    const client = this.supabaseService.getUserClient(accessToken);

    const { data: task, error: tError } = (await client
      .from('tasks')
      .select('id, projects!inner(user_id)')
      .eq('id', id)
      .eq('projects.user_id', userId)
      .single()) as unknown as SingleResult<{ id: string }>;

    if (tError || !task) throw new NotFoundException('Task not found');

    const { error } = (await client
      .from('tasks')
      .delete()
      .eq('id', id)) as unknown as { error: { message: string } | null };

    if (error) throw new BadRequestException(error.message);
    return { message: 'Task deleted successfully' };
  }
}
