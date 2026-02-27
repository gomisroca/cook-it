import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Difficulty } from '@/generated/prisma/enums';

export class QueryRecipesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(
    ({ value }) => (Array.isArray(value) ? value : [value]) as string[],
  )
  ingredients?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(
    ({ value }) => (Array.isArray(value) ? value : [value]) as string[],
  )
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxCookingTime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxPrepTime?: number;
}
