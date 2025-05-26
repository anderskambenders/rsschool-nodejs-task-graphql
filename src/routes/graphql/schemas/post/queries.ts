import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, } from 'graphql';
import { Static } from '@sinclair/typebox';
import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { postSchema } from '../../../posts/schemas.js';
import { UUIDType } from '../../types/uuid.js';
import { Context, idField } from '../../types/common.js';

export function initPostsLoader(db: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const map: Record<string, Post[]> = {};
    const rows = await db.post.findMany({
      where: { authorId: { in: [...ids] } },
    });

    rows.forEach((it) => {
      const key = it.authorId;

      if (map[key]) {
        map[key].push(it);
      } else {
        map[key] = [it];
      }
    });

    return ids.map((id) => map[id] || []);
  });
}

export type Post = Static<typeof postSchema>;

const postFields = {
  title: { type: new GraphQLNonNull(GraphQLString) },
  content: { type: new GraphQLNonNull(GraphQLString) },
  authorId: { type: new GraphQLNonNull(UUIDType) },
};

const postFieldsPartial = {
  title: { type: GraphQLString },
  content: { type: GraphQLString },
  authorId: { type: UUIDType },
};

export const PostType = new GraphQLObjectType({
  name: 'PostType',
  fields: () => ({
    ...idField,
    ...postFields,
  }),
});

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    ...postFields,
  },
});

export const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    ...postFieldsPartial,
  },
});

export const PostQueries = {
  post: {
    type: PostType,
    args: {
      ...idField,
    },
    resolve: async (_: unknown, { id }: { id: string }, { db }: Context) => {
      return await db.post.findUnique({ where: { id } });
    },
  },
  posts: {
    type: new GraphQLNonNull(new GraphQLList(PostType)),
    resolve: async (_: unknown, __: unknown, { db }: Context) => {
      return await db.post.findMany();
    },
  },
};

