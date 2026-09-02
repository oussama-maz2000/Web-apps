import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DEFAULT_API_CONFIG } from '@revlib/core';
import { Observable, throwError } from 'rxjs';
import { buildQueryParams } from '../../utils/query.utils';
import {
	GraphQLFieldFilter,
	GraphQLFilterObject,
	GraphQLFilterOperator,
	GraphQLOrder,
	GraphQLOrderObject,
	GraphQLOrderOperator,
	GraphqlQuery,
	GraphQLQueryInput,
	GraphQLVariables,
	Primitive
} from '../models/graphql.models';

@Injectable({
	providedIn: 'root'
})
export class GraphQLClientService {
	private readonly http = inject(HttpClient);

	/**
	 * Executes a GraphQL query.
	 *
	 * @typeParam T - Expected response type
	 * @param query - GraphQL query metadata (id + pagination flag)
	 * @param input - Optional structured input used to build query variables
	 * @returns Observable with typed GraphQL response
	 *
	 * @throws Error if no variables can be produced for the query
	 */
	query<T>(query: GraphqlQuery, input?: GraphQLQueryInput): Observable<T> {
		const variables = this.buildVariables(input, query.isPaginated);

		const queryParams =
			variables && Object.keys(variables).length > 0 ? { variables: JSON.stringify(variables) } : undefined;
		if (queryParams === undefined) return throwError(() => new Error('GraphQL query variables are missing'));

		const url = this.buildQueryUrl(query.queryId);
		return this.#getGraphQL<T>(url, queryParams);
	}

	//This one is used with the graphQL queries that does not have any parameter and acts as a REST endpoint,
	// benefit to add this is to keep the graphql queries call centrialized here instead of using an http client
	// at the same time we don't want to expose getGraphQL() to have the optimal control of how our graphql client api is being used in the code base
	queryWithNoParam<T>(query: GraphqlQuery): Observable<T> {
		const url = this.buildQueryUrl(query.queryId);
		return this.#getGraphQL<T>(url);
	}

	/**
	 * Builds GraphQL variables object from structured query input.
	 *
	 * Supported features:
	 *  - optional custom parameter (dynamic variable name)
	 *  - pagination variables (first, after, before)
	 *  - sorting (order)
	 *  - filtering (where / and)
	 *
	 * @param input - Structured query input from caller
	 * @param isPaginated - Whether pagination & ordering should be applied
	 * @returns GraphQL variables object ready for serialization
	 */
	private buildVariables(input?: GraphQLQueryInput, isPaginated: boolean = true): GraphQLVariables {
		if (!input) return {};

		const variables: GraphQLVariables = {};

		if (input.optionalParam) {
			variables[input.optionalParam.key] = input.optionalParam.value;
		}

		if (isPaginated) {
			if (input.pagination) {
				const { first, last, after, before } = input.pagination;
				const forward = first != null || after != null;
				const backward = last != null || before != null;

				if (forward === backward) {
					throw new Error(
						'Invalid pagination arguments: Should be specified either forward (first/after) or backward (last/before).'
					);
				}

				if (forward) {
					if (first) variables.first = first;
					if (after) variables.after = after;
				} else if (backward) {
					if (last) variables.last = last;
					if (before) variables.before = before;
				}
			}

			if (input.order) {
				input.order = input.order.filter((o: GraphQLOrder) => o.orderOperator != null);

				if (input.order.length > 0) {
					variables.order = input.order.map((o) => this.buildSingleOrder(o));
				}
			}
		}

		if (input.fields && input.fields.length > 0) {
			if (input.fields.length === 1) {
				variables.where = this.buildSingleFilter(input.fields[0]);
			} else {
				variables.where = {
					and: input.fields.map((f) => this.buildSingleFilter(f))
				};
			}
		}

		return variables;
	}

	/**
	 * Builds a GraphQL filter object from a single field filter definition.
	 *
	 * Supports nested fields using dot-notation (e.g. "user.profile.name").
	 *
	 * @param field - Field filter definition
	 * @returns Nested GraphQL filter object
	 */
	private buildSingleFilter(field: GraphQLFieldFilter): GraphQLFilterObject {
		const path = field.key.split('.');

		return this.buildNestedFilter(path, field.operator, field.value);
	}

	/**
	 * Recursively builds nested GraphQL filter objects.
	 *
	 * Example:
	 *  path: ['user', 'name']
	 *  operator: 'eq'
	 *  value: 'John'
	 *
	 * Result:
	 *  { user: { name: { eq: 'John' } } }
	 *
	 * @param path - Remaining object path segments
	 * @param operator - GraphQL filter operator
	 * @param value - Comparison value
	 */
	private buildNestedFilter(
		path: string[],
		operator: GraphQLFilterOperator,
		value: Primitive | Primitive[]
	): GraphQLFilterObject {
		if (path.length === 1) {
			return {
				[path[0]]: {
					[operator]: value
				}
			};
		}

		const [head, ...rest] = path;

		return {
			[head]: this.buildNestedFilter(rest, operator, value)
		};
	}

	/**
	 * Builds GraphQL order object from a single order definition.
	 *
	 * Supports nested sorting using dot-notation paths.
	 *
	 * @param order - Order definition (field + ASC/DESC)
	 * @returns Nested GraphQL order object
	 */
	private buildSingleOrder(order: GraphQLOrder): GraphQLOrderObject {
		const path = order.key.split('.');
		return this.buildNestedOrder(path, order.orderOperator);
	}

	/**
	 * Recursively builds nested GraphQL order objects.
	 *
	 * Example:
	 *  path: ['user', 'createdAt']
	 *  operator: 'DESC'
	 *
	 * Result:
	 *  { user: { createdAt: 'DESC' } }
	 *
	 * @param path - Remaining object path segments
	 * @param orderOperator - Sort direction
	 */
	private buildNestedOrder(path: string[], orderOperator: GraphQLOrderOperator): GraphQLOrderObject {
		if (path.length === 1) {
			return {
				[path[0]]: orderOperator
			};
		}
		const [head, ...rest] = path;
		return {
			[head]: this.buildNestedOrder(rest, orderOperator)
		};
	}

	/**
	 * Builds full GraphQL endpoint URL using configured base URL and query id.
	 *
	 * @param queryId - Server-side GraphQL query identifier
	 */
	private buildQueryUrl(queryId: string): string {
		const baseUrl = DEFAULT_API_CONFIG.graphqlApiUrl;
		const params = new HttpParams().set('id', queryId);

		return `${baseUrl}?${params.toString()}`;
	}

	/**
	 * Executes HTTP GET request to GraphQL endpoint with query parameters.
	 *
	 * @typeParam T - Expected response type
	 * @param url - Full GraphQL endpoint URL
	 * @param queryParams - Serialized GraphQL variables
	 */
	#getGraphQL<T>(url: string, queryParams?: Record<string, string | number | boolean>): Observable<T> {
		const params = buildQueryParams(queryParams);
		return this.http.get<T>(url, params ? { params } : undefined);
	}
}
