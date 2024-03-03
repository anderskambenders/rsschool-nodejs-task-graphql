import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate, GraphQLObjectType, GraphQLSchema } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { userQueries }  from './schemas/user/queries.js';
import { profileQueries }  from './schemas/profile/queries.js';
import { postQueries }  from './schemas/post/queries.js';
import { memberTypeQueries }  from './schemas/memberType/queries.js';
import { postMutations } from './schemas/post/mutation.js';
import { profileMutations } from './schemas/profile/mutation.js';
import { userMutations } from './schemas/user/mutation.js';

const queryFields = () => ({
  ...userQueries,
  ...profileQueries,
  ...postQueries,
  ...memberTypeQueries,
})

const mutationFields = () => ({
  ...postMutations,
  ...profileMutations,
  ...userMutations
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'QueryType',
    fields: queryFields
  }),
  mutation: new GraphQLObjectType({
    name: 'MutationType',
    fields: mutationFields
  }),
});


const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const validateErrors = validate(schema, parse(req.body.query), [
        depthLimit(5),
      ]);

      return validateErrors && validateErrors.length != 0 ? { data: '', errors: validateErrors } : await graphql({
        schema: schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: { prismaClient: fastify.prisma },
      })
    },
  });
};

export default plugin;
