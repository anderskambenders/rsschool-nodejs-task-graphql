import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { Static } from '@sinclair/typebox';
import { profileSchema } from '../../../profiles/schemas.js';
import { UUIDType } from '../../types/uuid.js';
import { MemberTypeIdEnum, MemberTypeType } from '../memberType/queries.js';
import { Context, idField } from '../../types/common.js';

export type Profile = Static<typeof profileSchema>;

const profileFields = {
  isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
  yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
  userId: { type: new GraphQLNonNull(UUIDType) },
  memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
};

const profileFieldsPartial = {
  isMale: { type: GraphQLBoolean },
  yearOfBirth: { type: GraphQLInt },
  memberTypeId: { type: MemberTypeIdEnum },
};

export const ProfileType: GraphQLObjectType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    ...idField,
    ...profileFields,
    memberType: {
      type: MemberTypeType,
      resolve: async ({ memberTypeId }: Profile, _: unknown, { loaders }: Context) => {
        return loaders.memberTypesLoader.load(memberTypeId);
      },
    },
  }),
});

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    ...profileFields,
  },
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    ...profileFieldsPartial,
  },
});


export function initProfilesLoader(db: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const map: Record<string, Profile> = {};
    const profiles = await db.profile.findMany({
      where: { userId: { in: [...ids] } },
    });

    profiles.forEach((it) => {
      const key = it.userId;
      map[key] = it;
    });

    return ids.map((id) => map[id] || null);
  });
}


export const ProfileQueries = {
  profile: {
    type: ProfileType,
    args: {
      ...idField,
    },
    resolve: async (_: unknown, { id }: { id: string }, { db }: Context) => {
      return await db.profile.findUnique({ where: { id } });
    },
  },
  profiles: {
    type: new GraphQLNonNull(new GraphQLList(ProfileType)),
    resolve: async (_: unknown, __: unknown, { db }: Context) => {
      return await db.profile.findMany();
    },
  },
};
