import { Expose } from 'class-transformer';

export class TagEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;

  constructor(partial: Partial<TagEntity>) {
    Object.assign(this, partial);
  }
}
