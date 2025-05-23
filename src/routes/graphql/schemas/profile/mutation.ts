import { GraphQLInputObjectType, GraphQLNonNull, GraphQLBoolean, GraphQLInt } from 'graphql';
import { UUIDType } from '../../types/uuid.js';
import { memberTypeId } from '../memberType/queries.js';
import { profileType } from './queries.js';
import { PrismaClient } from '@prisma/client';

export const createProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(memberTypeId) },
  }),
});

export const profileMutations = {
  createProfile: {
    type: profileType,
    args: { dto: { type: createProfileInputType } },
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
      const profile = await context.prismaClient.profile.create({ data: args.dto });
      return profile;
    },
  },
};
