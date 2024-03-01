import {
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { ProfileType } from '../profile/queries.js';
import { PrismaClient } from '@prisma/client';

export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

export const MemberType: GraphQLObjectType<{ id: string }, {prismaClient: PrismaClient}> =
  new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
      id: { type: new GraphQLNonNull(MemberTypeId) },
      discount: { type: GraphQLFloat },
      postsLimitPerMonth: { type: GraphQLInt },
      profiles: {
        type: new GraphQLList(ProfileType),
        resolve: async (parent: { id: string }, _args: unknown, context: {prismaClient: PrismaClient}) => {
          const profiles = await context.prismaClient.profile.findMany({
            where: { memberTypeId: parent.id },
          });
          return profiles;
        },
      },
    }),
  });

export const MemberTypeQueries = {
  memberTypes: {
    type: new GraphQLList(MemberType),
    resolve: async (_parent: unknown, _args: unknown, context: {prismaClient: PrismaClient}) => {
      const memberTypes = await context.prismaClient.memberType.findMany();
      return memberTypes;
    },
  },
  memberType: {
    type: MemberType,
    args: { id: { type: MemberTypeId } },
    resolve: async (_parent: unknown, args: { id: string }, context: {prismaClient: PrismaClient}) => {
      const memberType = await context.prismaClient.memberType.findUnique({
        where: { id: args.id },
      });
      return memberType;
    },
  },
};
