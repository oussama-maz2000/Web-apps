export interface GraphqlQuery {
	queryId: string;
	isPaginated: boolean;
}

export interface PageInfo {
	endCursor: string | null;
	hasNextPage: boolean | null;
	hasPreviousPage: boolean | null;
	startCursor: string | null;
}

export type GraphQLOrderOperator = 'ASC' | 'DESC';
export interface GraphQLOrder {
	key: string;
	orderOperator: GraphQLOrderOperator;
}
export type GraphQLOrderObject = { [key: string]: GraphQLOrderObject } | GraphQLOrderOperator;
export interface GraphQLVariables {
	first?: number;
	last?: number;
	after?: string;
	before?: string;
	order?: GraphQLOrderObject[];
	where?: GraphQLFilterObject | { and: GraphQLFilterObject[] };
	[key: string]: unknown;
}

export type Primitive = string | number | boolean | string[] | null;
export type GraphQLFilterOperator = 'contains' | 'eq' | 'startsWith' | 'gte';

export enum GRAPHQL_FILTER_OPERATORS {
	contains = 'contains',
	eq = 'eq',
	startsWith = 'startsWith',
	gte = 'gte'
}
export type GraphQLSingleFilter = {
	[fieldKey: string]: {
		[operator: string]: Primitive | Primitive[];
	};
};

export interface GraphQLFieldFilter {
	key: string;
	value: Primitive;
	operator: GraphQLFilterOperator;
}

export type GraphQLFilterObject =
	| { [key: string]: GraphQLFilterObject }
	| { [K in GraphQLFilterOperator]?: Primitive | Primitive[] };

export interface GraphQLOptionalArgument {
	key: string;
	value: Primitive;
}

export interface GraphQLPagination {
	first?: number;
	last?: number;
	after?: string;
	before?: string;
}

export interface GraphQLQueryInput {
	pagination?: GraphQLPagination;
	optionalParam?: GraphQLOptionalArgument;
	fields?: GraphQLFieldFilter[];
	order?: GraphQLOrder[];
}

export interface FieldOption {
	key: string;
	label: string;
	isNested: boolean;
	parent?: string;
	child?: string;
	group?: string;
}
export type GraphQLResponse<K extends string, T> = {
	data: Record<K, T>;
	errors?: T;
};

export type GraphQLSingleResponse<K extends string, T> = {
	data: Record<K, T>;
	errors?: T;
};

export type GraphQLEdge<T> = {
	cursor: string;
	node: T;
};

export type GraphQLConnection<T> = {
	edges: GraphQLEdge<T>[];
	pageInfo: PageInfo;
};
