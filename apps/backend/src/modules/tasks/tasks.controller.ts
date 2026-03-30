import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

interface AuthRequest extends ExpressRequest {
  user: { userId: string; email: string; accessToken: string };
}

@Controller('tasks')
@UseGuards(SupabaseAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: AuthRequest) {
    return this.tasksService.create(
      createTaskDto,
      req.user.userId,
      req.user.accessToken,
    );
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @Request() req: AuthRequest) {
    return this.tasksService.findByProject(
      projectId,
      req.user.userId,
      req.user.accessToken,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: AuthRequest,
  ) {
    return this.tasksService.update(
      id,
      updateTaskDto,
      req.user.userId,
      req.user.accessToken,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.tasksService.remove(id, req.user.userId, req.user.accessToken);
  }
}
