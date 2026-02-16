import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty } from '@/generated/prisma/enums';
import { CreateIngredientDto } from './create-ingredient.dto';
import { CreateStepDto } from './create-step.dto';

export class CreateRecipeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsInt()
  prepTime?: number;

  @IsOptional()
  @IsInt()
  cookingTime?: number;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsInt()
  servings?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIngredientDto)
  ingredients: CreateIngredientDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepDto)
  steps: CreateStepDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // tag names
}
