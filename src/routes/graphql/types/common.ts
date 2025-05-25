import { PrismaClient } from '@prisma/client';
import { GraphQLNonNull } from 'graphql';
import { UUIDType } from './uuid.js';
import { DataLoaders } from '../index.js';

export type Context = {
  db: PrismaClient;
  loaders: DataLoaders;
};

export const idField = {
  id: { type: new GraphQLNonNull(UUIDType) },
};
