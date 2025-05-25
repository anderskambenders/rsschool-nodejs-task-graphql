import { GraphQLNonNull } from 'graphql';
import { Static } from '@sinclair/typebox';
import { ChangeProfileInput, CreateProfileInput, ProfileType } from './queries.js';
import { createProfileSchema } from '../../../profiles/schemas.js';
import { Context, idField } from '../../types/common.js';
import { UUIDType } from '../../types/uuid.js';

export const ProfileMutations = {
  createProfile: {
    type: new GraphQLNonNull(ProfileType),
    args: { dto: { type: CreateProfileInput } },
    resolve: async (
      _: unknown,
      { dto: data }: { dto: Static<(typeof createProfileSchema)['body']> },
      { db }: Context,
    ) => {
      return await db.profile.create({ data });
    },
  },
  changeProfile: {
    type: new GraphQLNonNull(ProfileType),
    args: { ...idField, dto: { type: ChangeProfileInput } },
    resolve: async (
      _: unknown,
      {
        id,
        dto: data,
      }: { id: string; dto: Static<(typeof createProfileSchema)['body']> },
      { db }: Context,
    ) => {
      return await db.profile.update({ where: { id }, data });
    },
  },
  deleteProfile: {
    type: UUIDType,
    args: { ...idField },
    resolve: async (_: unknown, { id }: { id: string }, { db }: Context) => {
      await db.profile.delete({ where: { id } });
      return id;
    },
  },
};