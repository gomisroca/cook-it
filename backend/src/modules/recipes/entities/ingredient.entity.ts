import { Expose } from 'class-transformer';

export class IngredientEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  quantity?: number | null;

  @Expose()
  unit?: string | null;
}
