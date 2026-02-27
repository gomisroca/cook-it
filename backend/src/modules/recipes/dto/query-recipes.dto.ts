import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty } from '@/generated/prisma/enums';

export class QueryRecipesDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  ingredient?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxCookingTime?: number; // minutes

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxPrepTime?: number; // minutes
}
