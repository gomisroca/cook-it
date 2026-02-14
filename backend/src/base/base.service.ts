export interface PrismaDelegate<
  Model extends { id: string },
  FindManyArgs,
  WhereUniqueInput,
  CreateInput,
  UpdateArgs,
> {
  findUnique(args: { where: WhereUniqueInput }): Promise<Model | null>;
  findUniqueOrThrow(args: { where: WhereUniqueInput }): Promise<Model>;
  findMany(args: FindManyArgs): Promise<Model[]>;
  create(args: { data: CreateInput }): Promise<Model>;
  update(args: UpdateArgs): Promise<Model>;
  delete(args: { where: WhereUniqueInput }): Promise<Model>;
  count(args?: any): Promise<number>;
}

import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { paginate } from 'src/utils/pagination/paginate';

export abstract class BaseService<
  Model extends { id: string },
  FindManyArgs extends Record<string, unknown>,
  WhereUniqueInput,
  CreateInput,
  UpdateArgs,
> {
  constructor(
    protected readonly model: PrismaDelegate<
      Model,
      FindManyArgs,
      WhereUniqueInput,
      CreateInput,
      UpdateArgs
    >,
  ) {}

  async findOne(where: WhereUniqueInput): Promise<Model> {
    return this.model.findUniqueOrThrow({
      where,
    });
  }

  async findAll(params: {
    query: FindManyArgs;
    take?: number;
    cursor?: any;
    includeTotal?: boolean;
  }) {
    return await this.model.findMany(params.query);
  }

  async findPaginated(params: {
    query: FindManyArgs;
    take?: number;
    cursor?: any;
    includeTotal?: boolean;
  }) {
    return paginate({
      model: this.model,
      ...params,
    });
  }

  async create(data: CreateInput): Promise<Model> {
    try {
      return await this.model.create({
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Record already exists');
      }
      throw error;
    }
  }

  async update(args: UpdateArgs): Promise<Model> {
    try {
      return await this.model.update(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Record not found');
      }
      throw error;
    }
  }

  async remove(where: WhereUniqueInput): Promise<void> {
    try {
      await this.model.delete({
        where,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Record not found');
      }
      throw error;
    }
  }
}
