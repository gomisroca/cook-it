import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
