import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLFloat, GraphQLBoolean } from 'graphql';
import { userType } from './queries.js';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from '../../types/uuid.js';

export const userMutations = {
  createUser: {
    type: userType,
    args: { dto: { type: new GraphQLInputObjectType({
      name: 'CreateUserInput',
      fields: () => ({
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
      }),
    })}},
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
      return await context.prismaClient.user.create({ data: args.dto });
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
      } catch (error) {
        return false;
      }
    },
  },
  changeUser: {
    type: userType,
    args: { id: { type: UUIDType }, dto: { type: new GraphQLInputObjectType({
      name: 'ChangeUserInput',
      fields: () => ({
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
      }),
    }) } },
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
      return await context.prismaClient.user.update({
        where: { id: args.id },
        data: args.dto,
      });
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
      return context.prismaClient.user.findUnique({ where: { id: args.userId } });
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