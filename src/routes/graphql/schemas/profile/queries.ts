import { GraphQLList } from 'graphql';
import { UUIDType } from '../../types/uuid.js';
import { GraphQLObjectType, GraphQLBoolean, GraphQLInt } from 'graphql';
import { memberTypeId, memberType } from '../memberType/queries.js';
import { userType } from '../user/queries.js';
import { PrismaClient } from '@prisma/client';

export const profileType: GraphQLObjectType<{
  userId: string;
  memberTypeId: string;
}, {prismaClient: PrismaClient}> =
  new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
      id: { type: UUIDType },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      userId: { type: UUIDType },
      memberTypeId: { type: memberTypeId },

      user: {
        type: userType,
        resolve: async (parent, _args: unknown, context) => {
          const profileUser = await context.prismaClient.user.findUnique({
            where: { id: parent.userId },
          });
          return profileUser;
        },
      },
      memberType: {
        type: memberType,
        resolve: async (parent, _args: unknown, context) => {
          const userMemberType = await context.prismaClient.memberType.findUnique({
            where: { id: parent.memberTypeId },
          });
          return userMemberType;
        },
      },
    }),
  });

export const profileQueries = {
  profiles: {
    type: new GraphQLList(profileType),
    resolve: async (_parent: unknown, _args: unknown, context: {prismaClient: PrismaClient}) => {
      const profiles = await context.prismaClient.profile.findMany();
      return profiles;
    },
  },
  profile: {
    type: profileType,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: {prismaClient: PrismaClient}) => {
      const profile = await context.prismaClient.profile.findUnique({
        where: { id: args.id },
      });
      return profile;
    },
  },
};
