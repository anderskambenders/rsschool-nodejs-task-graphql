import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList, GraphQLResolveInfo, Kind } from 'graphql';
import { UUIDType } from '../../types/uuid.js';
import { ProfileSchema, profileType } from '../profile/queries.js';
import { PostSchema, postType } from '../post/queries.js';
import { PrismaClient } from '@prisma/client';
import AppDataLoader from '../../dataLoader.js';

export type UserSchema = {
  id: string;
  name: string;
  balance: number;
  profile?: ProfileSchema;
  posts?: PostSchema[];
  userSubscribedTo?: Array<{
    subscriberId: string;
    authorId: string;
  }>;
  subscribedToUser?: Array<{
    subscriberId: string;
    authorId: string;
  }>;
};

export const userType: GraphQLObjectType<UserSchema, {prismaClient: PrismaClient, dataLoader: AppDataLoader}> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: profileType,
      resolve: async (parent, _args: unknown, context) => {
        const userProfile = await context.dataLoader.userProfile.load(parent.id);
        return userProfile;
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (parent, _args: unknown, context) => {
        const userPosts = await context.dataLoader.userPosts.load(parent.id);
        return userPosts;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (parent, _args: unknown, context) => {
        const parentValue = parent['userSubscribedTo'];
        return parentValue
          ? context.dataLoader.user.loadMany(parentValue.map(s => s.subscriberId))
          : context.dataLoader.subscribed.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (parent, _args: unknown, context) => {
        const parentValue = parent['subscribedToUser'];
        return parentValue
          ? context.dataLoader.user.loadMany(parentValue.map(s => s.authorId))
          : context.dataLoader.subscribers.load(parent.id);
      },
    },
  }),
});

export const userQueries = {
  users: {
    type: new GraphQLList(userType),
    resolve: async (_parent: unknown, _args: unknown, context: {prismaClient: PrismaClient, dataLoader: AppDataLoader}, resolveInfo: GraphQLResolveInfo) => {
      const include = {};
      resolveInfo.fieldNodes.forEach((field) => {
        field.selectionSet?.selections.forEach((selection) => {
          if (
            selection.kind == Kind.FIELD &&
            ['userSubscribedTo', 'subscribedToUser'].includes(selection.name.value)
          ) {
            include[selection.name.value] = true;
          }
        });
      });
      const users = context.prismaClient.user.findMany({ include });
      users
        .then((users) => {
          users.map((u) => {
            context.dataLoader.user.prime(u.id, u);
          });
        })
        .catch(() => {});
      return users;
    },
  },
  user: {
    type: userType,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: {prismaClient: PrismaClient, dataLoader: AppDataLoader}) => {
      return context.dataLoader.user.load(args.id);
    },
  },
};
