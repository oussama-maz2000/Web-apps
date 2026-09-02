import { Business } from '../../models/responses/business.model';
import { GraphQLConnection, GraphQLResponse } from './graphql.models';

export type BusinessDetailsResponse = GraphQLResponse<'businessDetailsById', Business>;
export type BusinessResponseGql = GraphQLResponse<'businesses', GraphQLConnection<Business>>;
