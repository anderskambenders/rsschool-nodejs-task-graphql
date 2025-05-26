import { GraphQLNonNull } from 'graphql';
import { Static } from '@sinclair/typebox';
import { ChangeUserInput, CreateUserInput, UserType } from './queries.js';
import { createUserSchema } from '../../../users/schemas.js';
import { Context, idField } from '../../types/common.js';
import { UUIDType } from '../../types/uuid.js';

export const UserMutations = {
  createUser: {
    type: new GraphQLNonNull(UserType),
    args: { dto: { type: CreateUserInput } },
    resolve: async (
      _: unknown,
      { dto: data }: { dto: Static<(typeof createUserSchema)['body']> },
      { db }: Context,
    ) => {
      return await db.user.create({ data });
    },
  },
  changeUser: {
    type: new GraphQLNonNull(UserType),
    args: { ...idField, dto: { type: ChangeUserInput } },
    resolve: async (
      _: unknown,
      { id, dto: data }: { id: string; dto: Static<(typeof createUserSchema)['body']> },
      { db }: Context,
    ) => {
      return await db.user.update({ where: { id }, data });
    },
  },
  deleteUser: {
    type: UUIDType,
    args: { ...idField },
    resolve: async (_: unknown, { id }: { id: string }, { db }: Context) => {
      await db.user.delete({ where: { id: id } });
      return id;
    },
  },
  subscribeTo: {
    type: UUIDType,
    args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
    resolve: async (
      _: unknown,
      { userId, authorId }: { userId: string; authorId: string },
      { db }: Context,
    ) => {
       await db.subscribersOnAuthors.create({
        data: {
          subscriberId: userId,
          authorId: authorId,
        },
      });
    },
  },
  unsubscribeFrom: {
    type: UUIDType,
    args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
    resolve: async (
      _: unknown,
      { userId, authorId }: { userId: string; authorId: string },
      { db }: Context,
    ) => {
      await db.subscribersOnAuthors.delete({
        where: {
          subscriberId_authorId: {
            subscriberId: userId,
            authorId,
          },
        },
      });

      return authorId;
    },
  },
};
