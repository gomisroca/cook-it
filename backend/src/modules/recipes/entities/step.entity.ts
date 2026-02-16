import { Expose } from 'class-transformer';

export class StepEntity {
  @Expose()
  id: string;

  @Expose()
  order: number;

  @Expose()
  instruction: string;

  @Expose()
  duration?: number | null;

  @Expose()
  imageUrl?: string | null;

  @Expose()
  recipeId: string;
}
