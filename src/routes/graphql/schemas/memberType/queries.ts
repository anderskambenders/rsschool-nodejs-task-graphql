import {
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { profileType } from '../profile/queries.js';
import { PrismaClient } from '@prisma/client';

export const memberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

export const memberType: GraphQLObjectType<{ id: string }, {prismaClient: PrismaClient}> =
  new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
      id: { type: new GraphQLNonNull(memberTypeId) },
      discount: { type: GraphQLFloat },
      postsLimitPerMonth: { type: GraphQLInt },
      profiles: {
        type: new GraphQLList(profileType),
        resolve: async (parent: { id: string }, _args: unknown, context: {prismaClient: PrismaClient}) => {
          const profiles = await context.prismaClient.profile.findMany({
            where: { memberTypeId: parent.id },
          });
          return profiles;
        },
      },
    }),
  });

export const memberTypeQueries = {
  memberTypes: {
    type: new GraphQLList(memberType),
    resolve: async (_parent: unknown, _args: unknown, context: {prismaClient: PrismaClient}) => {
      const memberTypes = await context.prismaClient.memberType.findMany();
      return memberTypes;
    },
  },
  memberType: {
    type: memberType,
    args: { id: { type: memberTypeId } },
    resolve: async (_parent: unknown, args: { id: string }, context: {prismaClient: PrismaClient}) => {
      const memberType = await context.prismaClient.memberType.findUnique({
        where: { id: args.id },
      });
      return memberType;
    },
  },
};
