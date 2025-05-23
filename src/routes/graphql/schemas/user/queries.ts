import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList } from 'graphql';
import { UUIDType } from '../../types/uuid.js';
import { profileType } from '../profile/queries.js';
import { postType } from '../post/queries.js';
import { PrismaClient } from '@prisma/client';

export const userType: GraphQLObjectType<{ id: string }, {prismaClient: PrismaClient}> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: profileType,
      resolve: async (parent, _args: unknown, context) => {
        const userProfile = await context.prismaClient.profile.findUnique({
          where: { userId: parent.id },
        });
        return userProfile;
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (parent, _args: unknown, context) => {
        const userPosts = await context.prismaClient.post.findMany({
          where: { authorId: parent.id },
        });
        return userPosts;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (parent, _args: unknown, context) => {
        const authors = await context.prismaClient.subscribersOnAuthors.findMany({
          where: { subscriberId: parent.id },
          select: { author: true },
        });
        return authors.map(({ author }) => author);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (parent, _args: unknown, context) => {
        const subscribers = await context.prismaClient.subscribersOnAuthors.findMany({
          where: { authorId: parent.id },
          select: { subscriber: true },
        });
        return subscribers.map(({ subscriber }) => subscriber);
      },
    },
  }),
});

export const userQueries = {
  users: {
    type: new GraphQLList(userType),
    resolve: async (_parent: unknown, _args: unknown, context: {prismaClient: PrismaClient}) => {
      const users = await context.prismaClient.user.findMany();
      return users;
    },
  },
  user: {
    type: userType,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: {prismaClient: PrismaClient}) => {
      const user = await context.prismaClient.user.findUnique({ where: { id: args.id } });
      return user;
    },
  },
};
