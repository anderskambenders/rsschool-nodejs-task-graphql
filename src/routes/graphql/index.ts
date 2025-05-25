import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { GraphQLObjectType, GraphQLSchema } from 'graphql/index.js';
import { initMemberTypesLoader, MemberTypesQueries } from './schemas/memberType/queries.js';
import { initPostsLoader, PostQueries } from './schemas/post/queries.js';
import { PrismaClient } from '@prisma/client';
import { PostMutations } from './schemas/post/mutation.js';
import { initProfilesLoader, ProfileQueries } from './schemas/profile/queries.js';
import { ProfileMutations } from './schemas/profile/mutation.js';

export function loaders(db: PrismaClient) {
  return {
    subscriptionsToUsersLoader: initSubscriptionsToUsersLoader(db),
    usersSubscriptionsLoader: initUsersSubscriptionsLoader(db),
    postsLoader: initPostsLoader(db),
    profilesLoader: initProfilesLoader(db),
    memberTypesLoader: initMemberTypesLoader(db),
  };
}

export type DataLoaders = ReturnType<typeof loaders>;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    handler: async function (request) {
      const { query, variables } = request.body;

      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            ...MemberTypesQueries,
            ...UserQueries,
            ...PostQueries,
            ...ProfileQueries,
          },
        }),
        mutation: new GraphQLObjectType({
          name: 'Mutation',
          fields: {
            ...UserMutations,
            ...PostMutations,
            ...ProfileMutations,
          },
        }),
      });

      const depthErrors = validate(schema, parse(String(query)), [depthLimit(5)]);

      if (depthErrors.length) {
        return {
          errors: depthErrors,
        };
      }

      return await graphql({
        schema,
        source: String(query),
        variableValues: variables,
        contextValue: { db: prisma, loaders: loaders(prisma) },
      });
    },
  });
};

export default plugin;
