import { GraphQLList } from 'graphql';
import { UUIDType } from '../../types/uuid.js';
import { GraphQLObjectType, GraphQLBoolean, GraphQLInt } from 'graphql';
import { memberTypeId, memberType } from '../memberType/queries.js';
import { userType } from '../user/queries.js';
import { PrismaClient } from '@prisma/client';
import AppDataLoader from '../../dataLoader.js';

export type ProfileSchema = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
};

export const profileType: GraphQLObjectType<ProfileSchema, {prismaClient: PrismaClient, dataLoader: AppDataLoader}> =
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
          return context.dataLoader.member.load(parent.memberTypeId)
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
