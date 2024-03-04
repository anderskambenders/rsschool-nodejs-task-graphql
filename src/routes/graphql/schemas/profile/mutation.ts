import { GraphQLInputObjectType, GraphQLNonNull, GraphQLBoolean, GraphQLInt } from 'graphql';
import { UUIDType } from '../../types/uuid.js';
import { memberTypeId } from '../memberType/queries.js';
import { profileType } from './queries.js';
import { PrismaClient } from '@prisma/client';

export const profileMutations = {
  createProfile: {
    type: profileType,
    args: { dto: { type: new GraphQLInputObjectType({
      name: 'CreateProfileInput',
      fields: () => ({
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        userId: { type: new GraphQLNonNull(UUIDType) },
        memberTypeId: { type: new GraphQLNonNull(memberTypeId) },
      }),
    }) } },
    resolve: async (
      _parent: unknown,
      args: { dto: {
        isMale: boolean;
        yearOfBirth: number;
        userId: string;
        memberTypeId: string;
      } },
      context: {
        prismaClient: PrismaClient;
      },
    ) => {
      return await context.prismaClient.profile.create({ data: args.dto });
    },
  },
  deleteProfile: {
    type: GraphQLBoolean,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: {
      prismaClient: PrismaClient;
    }) => {
      try {
        await context.prismaClient.profile.delete({ where: { id: args.id } });
        return true;
      } catch (err) {
        return false;
      }
    },
  },
  changeProfile: {
    type: profileType,
    args: { id: { type: UUIDType }, dto: { type: new GraphQLInputObjectType({
      name: 'ChangeProfileInput',
      fields: () => ({
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
        memberTypeId: { type: memberTypeId },
      }),
    }) } },
    resolve: async (
      _parent: unknown,
      args: { id: string; dto: {
        isMale: boolean;
        yearOfBirth: number;
        userId: string;
        memberTypeId: string;
      } },
      context: {
        prismaClient: PrismaClient;
      },
    ) => {
      return await context.prismaClient.profile.update({
        where: { id: args.id },
        data: args.dto,
      });
    },
  },
};
