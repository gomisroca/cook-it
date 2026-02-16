import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateStepDto {
  @IsNumber()
  order: number;

  @IsString()
  instruction: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
