import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { UserQueries }  from './user/queries.js';
import { ProfileQueries }  from './profile/queries.js';
import { PostQueries }  from './post/queries.js';
import { MemberTypeQueries }  from './memberType/queries.js';

const fields = () => ({
  ...UserQueries,
  ...ProfileQueries,
  ...PostQueries,
  ...MemberTypeQueries,
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields
  }),
});

export default schema;