import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLFloat, GraphQLBoolean } from 'graphql';
import { userType } from './queries.js';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from '../../types/uuid.js';

export const createUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const changeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

export const userMutations = {
  createUser: {
    type: userType,
    args: { dto: { type: createUserInputType } },
    resolve: async (
      _parent: unknown,
      args: { dto: {
        name: string;
        balance: number;
      } },
      context: {
        prismaClient: PrismaClient;
      },
    ) => {
      const user = await context.prismaClient.user.create({ data: args.dto });
      return user;
    },
  },
  deleteUser: {
    type: GraphQLBoolean,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: {
      prismaClient: PrismaClient;
    }) => {
      try {
        await context.prismaClient.user.delete({ where: { id: args.id } });
        return true;
      } catch (err) {
        return false;
      }
    },
  },
  changeUser: {
    type: userType,
    args: { id: { type: UUIDType }, dto: { type: changeUserInputType } },
    resolve: async (
      _parent: unknown,
      args: { id: string; dto: {
        name: string;
        balance: number;
      } },
      context: {
        prismaClient: PrismaClient;
      },
    ) => {
      const user = await context.prismaClient.user.update({
        where: { id: args.id },
        data: args.dto,
      });
      return user;
    },
  },
  subscribeTo: {
    type: userType,
    args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
    resolve: async (
      _parent: unknown,
      args: { userId: string; authorId: string },
      context: {
        prismaClient: PrismaClient;
      },
    ) => {
      await context.prismaClient.subscribersOnAuthors.create({
        data: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      });
      const user = context.prismaClient.user.findUnique({ where: { id: args.userId } });
      return user;
    },
  },

  unsubscribeFrom: {
    type: GraphQLBoolean,
    args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
    resolve: async (
      _parent: unknown,
      args: { userId: string; authorId: string },
      context: {
        prismaClient: PrismaClient;
      },
    ) => {
      try {
        await context.prismaClient.subscribersOnAuthors.deleteMany({
          where: {
            subscriberId: args.userId,
            authorId: args.authorId,
          },
        });
        return true;
      } catch {
        return false;
      }
    },
  },
};