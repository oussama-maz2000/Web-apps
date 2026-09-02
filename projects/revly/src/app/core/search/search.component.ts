import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	DestroyRef,
	inject,
	linkedSignal,
	OnInit,
	signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AvatarComponent } from '@revlib/components/shared/avatar/avatar.component';
import { PriceRangeEnum } from '@revlib/models';
import { ApplicationActions, AppState } from '@revlib/store';
import { getFirstErrorMessage } from '@revlib/utils';
import { catchError, EMPTY, filter, finalize, map, Observable, of, tap } from 'rxjs';
import { GRAPHQL_QUERIES } from '../../../../../revly-lib/src/lib/graphql/apis/graphql-queries';
import { BusinessResponseGql } from '../../../../../revly-lib/src/lib/graphql/models/businessGql.model';
import {
	GRAPHQL_FILTER_OPERATORS,
	GraphQLEdge,
	GraphQLFieldFilter,
	GraphQLOrder,
	GraphQLPagination,
	GraphQLQueryInput,
	PageInfo
} from '../../../../../revly-lib/src/lib/graphql/models/graphql.models';
import { GraphQLClientService } from '../../../../../revly-lib/src/lib/graphql/service/graphqlClient.service';
import { Business } from '../../../../../revly-lib/src/lib/models/responses/business.model';
import { StateEnum } from '../../../../../revly-lib/src/lib/shared-constants/wilays-constants';
import { buildImageUrl } from '../../../../../revly-lib/src/lib/utils/image-helpers.utils';
import { COMMON_IMPORTS } from '../../../app.shared.imports';
import { BusinessCategory } from '../../models/biz-category.model';
import { BusinessCategoryService } from '../../services/business-category.service';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	standalone: true,
	imports: [COMMON_IMPORTS, ReactiveFormsModule, AvatarComponent],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
	protected businesses = signal<GraphQLEdge<Business>[] | null>(null);
	protected businessList = linkedSignal<Business[]>(() => this.businesses()?.map((bzs) => bzs.node) ?? []);
	protected pagination = signal<PageInfo>({} as PageInfo);
	protected isLoading = signal(false);
	protected readonly buildImageUrl = buildImageUrl;
	protected readonly Math = Math;
	private cdr = inject(ChangeDetectorRef);
	private fb: FormBuilder = inject(FormBuilder);
	private graphQLClientService = inject(GraphQLClientService);
	private router = inject(Router);
	protected wilays = Object.values(StateEnum).filter((v) => typeof v === 'string');
	protected priceRange = Object.keys(PriceRangeEnum).filter((k) => isNaN(Number(k)));
	readonly #store = inject(Store<AppState>);
	readonly #destroyRef = inject(DestroyRef);
	private initialFormState!: ReturnType<typeof this.form.getRawValue>;

	readonly #categoryService = inject(BusinessCategoryService);
	categories = signal<BusinessCategory[]>([]);
	readonly itemsPerPage = 10;
	protected form: FormGroup = this.fb.group({
		filter: this.fb.group({
			displayName: this.fb.group({
				key: ['displayName'],
				value: [history.state.displayName, [Validators.minLength(3)]],
				operator: [GRAPHQL_FILTER_OPERATORS.contains]
			}),
			categoryValue: this.fb.group({
				key: ['categoryValue'],
				value: [],
				operator: [GRAPHQL_FILTER_OPERATORS.eq]
			}),
			isClaimed: this.fb.group({
				key: ['isClaimed'],
				value: [],
				operator: [GRAPHQL_FILTER_OPERATORS.eq]
			}),

			stateCode: this.fb.group({
				key: ['stateCode'],
				value: [],
				operator: [GRAPHQL_FILTER_OPERATORS.eq]
			}),
			averageRating: this.fb.group({
				key: ['rating.averageRating'],
				value: [0],
				operator: [GRAPHQL_FILTER_OPERATORS.gte]
			}),
			priceRange: this.fb.group({
				key: ['rating.priceRange'],
				value: [],
				operator: [GRAPHQL_FILTER_OPERATORS.eq]
			})
		}),
		order: this.fb.group({
			displayName: this.fb.group({
				key: ['displayName'],
				orderOperator: []
			}),
			isClaimed: this.fb.group({
				key: ['isClaimed'],
				orderOperator: []
			}),
			averageRating: this.fb.group({
				key: ['rating.averageRating'],
				orderOperator: []
			}),
			totalReviewsCount: this.fb.group({
				key: ['rating.totalReviewsCount'],
				orderOperator: []
			}),
			id: this.fb.group({
				key: ['id'],
				orderOperator: ['DESC']
			})
		}),
		pagination: this.fb.group({
			first: [this.itemsPerPage],
			after: [null],
			before: [null]
		})
	});

	constructor() {
		this.executeQueryObservable(this.buildFilters()).subscribe();
	}
	ngOnInit(): void {
		this.initialFormState = this.form.getRawValue();
		this.loadCategories();
	}

	get displayNameValue() {
		return this.form.get('filter.displayName.value') as FormControl;
	}

	get hasNextPage(): boolean {
		return this.pagination().hasNextPage ?? false;
	}

	get hasPreviousPage(): boolean {
		return this.pagination().hasPreviousPage ?? false;
	}

	protected getStarArray(rating: number): number[] {
		return Array(Math.floor(rating)).fill(0);
	}

	protected nextPage(): void {
		if (!this.hasNextPage || this.isLoading()) {
			return;
		}

		const input = this.buildFilters();
		input.pagination = {
			first: this.itemsPerPage,
			after: this.pagination().endCursor ?? undefined
		};

		this.executeQueryObservable(input).subscribe();
	}

	protected previousPage(): void {
		if (!this.hasPreviousPage || this.isLoading()) {
			return;
		}

		const input = this.buildFilters();
		input.pagination = {
			last: this.itemsPerPage,
			before: this.pagination().startCursor ?? undefined
		};

		this.executeQueryObservable(input).subscribe();
	}

	protected callApi(): void {
		this.executeQueryObservable(this.buildFilters()).subscribe();
	}

	resetFormExceptIdAndPagination() {
		const pagination = this.form.get('pagination')!.value;
		const idOrderValue = this.form.get('order.id.orderOperator')!.value;
		const resetState = {
			...this.initialFormState,
			filter: {
				...this.initialFormState.filter,
				displayName: {
					...this.initialFormState.filter.displayName,
					value: null
				}
			}
		};
		this.form.patchValue(resetState);

		this.form.patchValue({
			order: {
				id: {
					orderOperator: idOrderValue
				}
			},
			pagination
		});

		this.form.markAsPristine();
		this.form.markAsUntouched();
		this.executeQueryObservable(this.buildFilters()).subscribe();
	}

	private executeQueryObservable(input: GraphQLQueryInput): Observable<BusinessResponseGql | null> {
		this.isLoading.set(true);
		return this.graphQLClientService
			.query<BusinessResponseGql>(
				{
					queryId: GRAPHQL_QUERIES.SearchBusinesses.queryId,
					isPaginated: GRAPHQL_QUERIES.SearchBusinesses.isPaginated
				},
				{
					pagination: input.pagination ?? { first: this.itemsPerPage },
					fields: input.fields,
					order: input.order
				}
			)
			.pipe(
				tap((res: BusinessResponseGql) => {
					this.pagination.set(res.data.businesses.pageInfo!);
					this.businesses.set(res.data.businesses.edges);
				}),
				map((res: BusinessResponseGql) => {
					if (!res.data.businesses) {
						throw new Error('Une erreur est survenue. Veuillez réessayer plus tard.');
					}
					return res;
				}),
				catchError((error) => {
					const firstErrorMessage = getFirstErrorMessage(error);
					this.#store.dispatch(
						ApplicationActions.showErrorSnackbar({
							message: firstErrorMessage || 'Une erreur est survenue. Veuillez réessayer plus tard.'
						})
					);

					return of(null);
				}),
				finalize(() => {
					this.cdr.markForCheck();
					this.isLoading.set(false);
				}),
				takeUntilDestroyed(this.#destroyRef)
			);
	}

	private buildFilters(): GraphQLQueryInput {
		const raw = this.form.getRawValue();
		const fields: GraphQLFieldFilter[] = (Object.values(raw.filter) satisfies GraphQLFieldFilter[])
			.filter(
				(f: GraphQLFieldFilter) =>
					f.value !== null && f.value !== '' && f.key !== null && f.key !== undefined && f.key !== ''
			)
			.map((f: GraphQLFieldFilter) => {
				const filter: GraphQLFieldFilter = {
					key: f.key,
					value: f.value,
					operator: f.operator
				};
				return filter;
			});

		const sort: GraphQLOrder[] = (Object.values(raw.order) as GraphQLOrder[])
			.filter((f) => f.orderOperator !== null && f.key !== null && f.key !== undefined)
			.map((f: GraphQLOrder) => {
				const order: GraphQLOrder = {
					key: f.key,
					orderOperator: f.orderOperator
				};
				return order;
			});

		return {
			fields: fields.length ? fields : undefined,
			order: sort,
			pagination: raw.pagination as GraphQLPagination
		};
	}

	protected goToDetails(categoryNameFr: string, id: string, nameSlug: string) {
		this.router.navigate(['/biz', categoryNameFr, id, nameSlug]);
	}

	loadCategories(): void {
		this.#categoryService
			.loadCategories()
			.pipe(
				takeUntilDestroyed(this.#destroyRef),
				filter((res) => !!res?.isSucceeded && !!res?.value),
				tap((res) => this.categories.set(res.value!)),
				catchError((err) => {
					const message =
						getFirstErrorMessage(err) || 'Une erreur est survenue. Veuillez réessayer plus tard.';

					this.#store.dispatch(ApplicationActions.showErrorSnackbar({ message }));
					return EMPTY;
				})
			)
			.subscribe();
	}
}
