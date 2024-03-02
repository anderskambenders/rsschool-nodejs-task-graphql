import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { UUIDType } from '../../types/uuid.js';
import { PostType } from './queries.js';
import { PrismaClient } from '@prisma/client';

export const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  }),
});

export const PostMutations = {
  createPost: {
    type: PostType,
    args: { dto: { type: CreatePostInputType } },
    resolve: async (
      _parent: unknown,
      args: { dto: {
        authorId: string;
        content: string;
        title: string;
      } },
      context: {
        prismaClient: PrismaClient;
      },
    ) => {
      const post = await context.prismaClient.post.create({ data: args.dto });
      return post;
    },
  },
};
