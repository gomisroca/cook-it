import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CursorDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumber()
  take?: number;
}
