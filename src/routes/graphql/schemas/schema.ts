import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { userQueries }  from './user/queries.js';
import { profileQueries }  from './profile/queries.js';
import { postQueries }  from './post/queries.js';
import { memberTypeQueries }  from './memberType/queries.js';
import { postMutations } from './post/mutation.js';
import { profileMutations } from './profile/mutation.js';
import { userMutations } from './user/mutation.js';

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

export default schema;