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
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

interface AuthRequest extends ExpressRequest {
  user: { userId: string; email: string; accessToken: string };
}

@Controller('projects')
@UseGuards(SupabaseAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: AuthRequest,
  ) {
    return this.projectsService.create(
      createProjectDto,
      req.user.userId,
      req.user.accessToken,
    );
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.projectsService.findAll(req.user.userId, req.user.accessToken);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.projectsService.findOne(
      id,
      req.user.userId,
      req.user.accessToken,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: AuthRequest,
  ) {
    return this.projectsService.update(
      id,
      updateProjectDto,
      req.user.userId,
      req.user.accessToken,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.projectsService.remove(
      id,
      req.user.userId,
      req.user.accessToken,
    );
  }
}
