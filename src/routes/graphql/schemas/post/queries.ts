import { GraphQLList } from 'graphql';
import { GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from '../../types/uuid.js';
import { userType } from '../user/queries.js';
import { PrismaClient } from '@prisma/client';

export type PostSchema = {
  id: string;
  title: string;
  content: string;
  authorId: string;
};

export const postType: GraphQLObjectType<PostSchema, {prismaClient: PrismaClient}> = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
    author: {
      type: userType,
      resolve: async (
        parent: { authorId: string },
        _args: unknown,
        context: {prismaClient: PrismaClient},
      ) => {
        return await context.prismaClient.user.findUnique({
          where: { id: parent.authorId },
        });
      },
    },
  }),
});

export const postQueries = {
  posts: {
    type: new GraphQLList(postType),
    resolve: async (_parent: unknown, _args: unknown, context: {prismaClient: PrismaClient}) => {
      return await context.prismaClient.post.findMany();
    },
  },
  post: {
    type: postType,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: {prismaClient: PrismaClient}) => {
      return await context.prismaClient.post.findUnique({ where: { id: args.id } });
    },
  },
};
