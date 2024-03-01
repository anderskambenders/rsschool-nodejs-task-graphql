import { GraphQLList } from 'graphql';
import { UUIDType } from '../../types/uuid.js';
import { GraphQLObjectType, GraphQLBoolean, GraphQLInt } from 'graphql';
import { MemberTypeId, MemberType } from '../memberType/queries.js';
import { UserType } from '../user/queries.js';
import { PrismaClient } from '@prisma/client';

export const ProfileType: GraphQLObjectType<{
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
      memberTypeId: { type: MemberTypeId },

      user: {
        type: UserType,
        resolve: async (parent, _args: unknown, context) => {
          const profileUser = await context.prismaClient.user.findUnique({
            where: { id: parent.userId },
          });
          return profileUser;
        },
      },
      memberType: {
        type: MemberType,
        resolve: async (parent, _args: unknown, context) => {
          const userMemberType = await context.prismaClient.memberType.findUnique({
            where: { id: parent.memberTypeId },
          });
          return userMemberType;
        },
      },
    }),
  });

export const ProfileQueries = {
  profiles: {
    type: new GraphQLList(ProfileType),
    resolve: async (_parent: unknown, _args: unknown, context: {prismaClient: PrismaClient}) => {
      const profiles = await context.prismaClient.profile.findMany();
      return profiles;
    },
  },
  profile: {
    type: ProfileType,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: {prismaClient: PrismaClient}) => {
      const profile = await context.prismaClient.profile.findUnique({
        where: { id: args.id },
      });
      return profile;
    },
  },
};
