import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { Static } from '@fastify/type-provider-typebox';
import { MemberTypeId, memberTypeSchema } from '../../../member-types/schemas.js';
import { Context } from '../../types/common.js';

export type Member = Static<typeof memberTypeSchema>;
export const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: MemberTypeId.BASIC },
    BUSINESS: { value: MemberTypeId.BUSINESS },
  },
});

export const memberTypesIdField = {
  id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
};

const memberTypesFields = {
  discount: { type: new GraphQLNonNull(GraphQLFloat) },
  postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
};

export const MemberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    ...memberTypesIdField,
    ...memberTypesFields,
  }),
});


export function initMemberTypesLoader(db: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const map: Record<string, Member> = {};
    const rows = await db.memberType.findMany({
      where: { id: { in: [...ids] } },
    });

    rows.forEach((it) => {
      const key = it.id;
      map[key] = it;
    });

    return ids.map((id) => map[id] || null);
  });
}


export const MemberTypesQueries = {
  memberType: {
    type: MemberTypeType,
    args: {
      ...memberTypesIdField,
    },
    resolve: async (parent: unknown, { id }: { id: MemberTypeId }, { db }: Context) => {
      return await db.memberType.findUnique({ where: { id } });
    },
  },
  memberTypes: {
    type: new GraphQLNonNull(new GraphQLList(MemberTypeType)),
    resolve: async (parent: unknown, args: unknown, { db }: Context) => {
      return await db.memberType.findMany();
    },
  },
};
