import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLFloat } from 'graphql';
import { userType } from './queries.js';
import { PrismaClient } from '@prisma/client';

export const createUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
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
};