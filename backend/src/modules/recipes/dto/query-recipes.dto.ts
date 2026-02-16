import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class QueryRecipesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
