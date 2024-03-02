import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { UserQueries }  from './user/queries.js';
import { ProfileQueries }  from './profile/queries.js';
import { PostQueries }  from './post/queries.js';
import { MemberTypeQueries }  from './memberType/queries.js';
import { PostMutations } from './post/mutation.js';

const queryFields = () => ({
  ...UserQueries,
  ...ProfileQueries,
  ...PostQueries,
  ...MemberTypeQueries,
})

const mutationFields = () => ({
  ...PostMutations
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