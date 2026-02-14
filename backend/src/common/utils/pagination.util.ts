/* eslint-disable @typescript-eslint/no-unsafe-assignment */
interface PaginateOptions<T extends { id: string }> {
  model: {
    findMany: (args?: any) => Promise<T[]>;
    count?: (args?: any) => Promise<number>;
  };

  query?: {
    where?: any;
    include?: any;
    select?: any;
  };

  take?: number;
  cursor?: string;
  orderBy?: any;
  includeTotal?: boolean;
}

async function paginate<T extends { id: string }>({
  model,
  query = {},
  take = 20,
  cursor,
  orderBy = { id: 'asc' },
  includeTotal = false,
}: PaginateOptions<T>) {
  const items = await model.findMany({
    ...query,
    take: take + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy,
  });

  let nextCursor: string | undefined;

  if (items.length > take) {
    const last = items.pop();
    nextCursor = last?.id;
  }

  const total =
    includeTotal && model.count
      ? await model.count({ where: query.where })
      : undefined;

  return {
    data: items,
    nextCursor,
    total,
  };
}

export async function paginateEntities<T extends { id: string }, E>(
  options: PaginateOptions<T>,
  Entity: new (data: Partial<T>) => E,
) {
  const result = await paginate(options);

  return {
    ...result,
    data: result.data.map((item) => new Entity(item)),
  };
}
