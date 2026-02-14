interface PaginateOptions<T extends { id: string }> {
  model: {
    findMany: (args: Record<string, unknown>) => Promise<T[]>;
    count?: (args: Record<string, unknown>) => Promise<number>;
  };
  query: { where?: Record<string, unknown> };
  take?: number;
  cursor?: string;
  includeTotal?: boolean;
}

export async function paginate<T extends { id: string }>({
  model,
  query,
  take = 20,
  cursor,
  includeTotal = false,
}: PaginateOptions<T>) {
  const items = await model.findMany({
    ...query,
    take: take + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { id: 'asc' },
  });

  let nextCursor: string | undefined;

  if (items.length > take) {
    const last = items.pop();
    nextCursor = last?.id;
  } else {
    nextCursor = undefined;
  }

  return {
    data: items,
    nextCursor,
    total:
      includeTotal && model.count
        ? await model.count({ where: query.where })
        : undefined,
  };
}
