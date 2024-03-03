import { GraphQLBoolean, GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { UUIDType } from '../../types/uuid.js';
import { postType } from './queries.js';
import { PrismaClient } from '@prisma/client';

export const createPostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  }),
});

export const changePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  }),
});

export const postMutations = {
  createPost: {
    type: postType,
    args: { dto: { type: createPostInputType } },
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
  deletePost: {
    type: GraphQLBoolean,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: {
      prismaClient: PrismaClient;
    }) => {
      try {
        await context.prismaClient.post.delete({ where: { id: args.id } });
        return true;
      } catch (err) {
        return false;
      }
    },
  },
  changePost: {
    type: postType,
    args: { id: { type: UUIDType }, dto: { type: changePostInputType } },
    resolve: async (
      _parent: unknown,
      args: { id: string; dto: {
        authorId: string;
        content: string;
        title: string;
      } },
      context: {
        prismaClient: PrismaClient;
      },
    ) => {
      const post = await context.prismaClient.post.update({
        where: { id: args.id },
        data: args.dto,
      });
      return post;
    },
  },
};
