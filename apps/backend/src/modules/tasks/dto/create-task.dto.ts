import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['todo', 'in-progress', 'done'])
  @IsOptional()
  status?: string;

  @IsUUID()
  @IsNotEmpty()
  project_id!: string;
}
