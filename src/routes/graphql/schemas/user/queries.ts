import {
  parseResolveInfo,
  ResolveTree,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';
import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLString,
} from 'graphql';
import { Static } from '@sinclair/typebox';
import { userSchema } from '../../../users/schemas.js';
import { Context, idField } from '../../types/common.js';
import { PostType } from '../post/queries.js';
import { ProfileType } from '../profile/queries.js';

export type User = Static<typeof userSchema>;

type Subscription = {
  subscriberId: string;
  authorId: string;
};

export type UserSubscription = User & {
  userSubscribedTo: Subscription[];
};

export type SubscriptionToUser = User & {
  subscribedToUser: Subscription[];
};

const userFields = {
  name: { type: new GraphQLNonNull(GraphQLString) },
  balance: { type: new GraphQLNonNull(GraphQLFloat) },
};

const userFieldsPartial = {
  name: { type: GraphQLString },
  balance: { type: GraphQLFloat },
};

export const UserType: GraphQLObjectType = new GraphQLObjectType<User, Context>({
  name: 'UserType',
  fields: () => ({
    ...idField,
    ...userFields,
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }: User, _: unknown, { loaders }: Context) => {
        return loaders.subscriptionsToUsersLoader.load(id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }: User, _: unknown, { loaders }: Context) => {
        return loaders.usersSubscriptionsLoader.load(id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(PostType)),
      resolve: async ({ id }: User, _: unknown, { loaders }: Context) => {
        return loaders.postsLoader.load(id);
      },
    },
    profile: {
      type: ProfileType,
      resolve: async ({ id }: User, _: unknown, { loaders }: Context) => {
        return loaders.profilesLoader.load(id);
      },
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    ...userFields,
  },
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    ...userFieldsPartial,
  },
});


export function initSubscriptionsToUsersLoader(db: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const map: Record<string, UserSubscription[]> = {};
    const rows = await db.user.findMany({
      where: {
        userSubscribedTo: {
          some: {
            authorId: {
              in: [...ids],
            },
          },
        },
      },
      include: {
        userSubscribedTo: true,
      },
    });

    rows.forEach((it1) => {
      it1.userSubscribedTo.forEach((it2) => {
        const key = it2.authorId;

        if (map[key]) {
          map[key].push(it1);
        } else {
          map[key] = [it1];
        }
      });
    });

    return ids.map((id) => map[id] || []);
  });
}

export function initUsersSubscriptionsLoader(db: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const map: Record<string, SubscriptionToUser[]> = {};
    const rows = await db.user.findMany({
      where: {
        subscribedToUser: {
          some: {
            subscriberId: {
              in: [...ids],
            },
          },
        },
      },
      include: {
        subscribedToUser: true,
      },
    });

    rows.forEach((it1) => {
      it1.subscribedToUser.forEach((it2) => {
        const key = it2.subscriberId;

        if (map[key]) {
          map[key].push(it1);
        } else {
          map[key] = [it1];
        }
      });
    });

    return ids.map((id) => map[id] || []);
  });
}

export const UserQueries = {
  user: {
    type: UserType,
    args: {
      ...idField,
    },
    resolve: async (_: unknown, { id }: { id: string }, { db }: Context) => {
      return await db.user.findUnique({ where: { id } });
    },
  },
  users: {
    type: new GraphQLNonNull(new GraphQLList(UserType)),
    resolve: async (
      _: unknown,
      __: unknown,
      { db, loaders }: Context,
      info: GraphQLResolveInfo,
    ) => {
      const { fields } = simplifyParsedResolveInfoFragmentWithType(
        parseResolveInfo(info) as ResolveTree,
        UserType,
      );

      const subscribedToUser = 'subscribedToUser' in fields;
      const userSubscribedTo = 'userSubscribedTo' in fields;

      const users = await db.user.findMany({
        include: {
          subscribedToUser,
          userSubscribedTo,
        },
      });

      if (subscribedToUser || userSubscribedTo) {
        const { usersSubscriptionsLoader, subscriptionsToUsersLoader } = loaders;

        const map: Record<string, UserSubscription | SubscriptionToUser> = {};
        users.forEach((it) => {
          const key = it.id;
          map[key] = it;
        });

        users.forEach((user) => {
          if (subscribedToUser) {
            subscriptionsToUsersLoader.prime(
              user.id,
              user.subscribedToUser.map((it) => {
                const key = it.subscriberId;
                return map[key] as UserSubscription;
              }),
            );
          }

          if (userSubscribedTo) {
            usersSubscriptionsLoader.prime(
              user.id,
              user.userSubscribedTo.map((it) => {
                const key = it.authorId;
                return map[key] as SubscriptionToUser;
              }),
            );
          }
        });
      }

      return users;
    },
  },
};