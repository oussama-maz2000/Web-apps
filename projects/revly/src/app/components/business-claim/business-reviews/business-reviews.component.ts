import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	inject,
	input,
	linkedSignal,
	signal,
	WritableSignal
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReviewDto } from '@revlib/models';

import { GRAPHQL_QUERIES } from '../../../../../../revly-lib/src/lib/graphql/apis/graphql-queries';
import { ReviewsOfBusinessResponse } from '../../../../../../revly-lib/src/lib/graphql/models/reviewGql.model';
import { GraphQLClientService } from '../../../../../../revly-lib/src/lib/graphql/service/graphqlClient.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { ReviewDisplayComponent } from '@revlib/components/reviews/review-display/review-display.component';
import { ApplicationActions, AppState } from '@revlib/store';
import { getFirstErrorMessage } from '@revlib/utils';
import { Observable, of, tap } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
	GRAPHQL_FILTER_OPERATORS,
	GraphQLEdge,
	GraphQLFieldFilter,
	GraphQLOrder,
	GraphQLPagination,
	GraphQLQueryInput,
	PageInfo
} from '../../../../../../revly-lib/src/lib/graphql/models/graphql.models';

@Component({
	selector: 'app-business-reviews',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, ReviewDisplayComponent],
	templateUrl: './business-reviews.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewsComponent {
	pageInfo = input.required<PageInfo>();
	businessId = input.required<string>();
	businessName = input.required<string>();
	isBusinessOwner = input.required<boolean>();
	showDelete = input(false);
	isLoading = signal(false);
	reviews = input.required<GraphQLEdge<ReviewDto>[]>();
	total = input.required<number>();

	reviewsList: WritableSignal<GraphQLEdge<ReviewDto>[]> = linkedSignal(() => this.reviews());
	pagination: WritableSignal<PageInfo> = linkedSignal(() => this.pageInfo());

	currentPage = signal<number>(1);
	totalPages = computed(() => {
		const total = this.total();
		return total ? Math.ceil(total / this.itemsPerPage) : 1;
	});
	private graphqlClient = inject(GraphQLClientService);

	private fb = inject(FormBuilder);
	readonly #destroyRef = inject(DestroyRef);
	readonly #store = inject(Store<AppState>);
	queryForm: FormGroup = this.fb.group({
		filter: this.fb.group({
			isPinned: this.fb.group({
				key: ['isPinned'],
				value: [],
				operator: [GRAPHQL_FILTER_OPERATORS.eq]
			}),
			rating: this.fb.group({
				key: ['rating'],
				value: [],
				operator: [GRAPHQL_FILTER_OPERATORS.gte]
			}),
			hasBusinessReply: this.fb.group({
				key: ['hasBusinessReply'],
				value: [],
				operator: [GRAPHQL_FILTER_OPERATORS.eq]
			})
		}),
		order: this.fb.group({
			isPinned: this.fb.group({
				key: ['isPinned'],
				orderOperator: []
			}),
			rating: this.fb.group({
				key: ['rating'],
				orderOperator: []
			}),
			createdAt: this.fb.group({
				key: ['createdAt'],
				orderOperator: []
			}),
			helpfulCount: this.fb.group({
				key: ['helpfulCount'],
				orderOperator: []
			}),
			notHelpfulCount: this.fb.group({
				key: ['notHelpfulCount'],
				orderOperator: []
			}),
			id: this.fb.group({
				key: ['id'],
				orderOperator: ['DESC']
			})
		}),
		pagination: this.fb.group({
			first: [10],
			after: [],
			before: []
		})
	});

	readonly itemsPerPage = 10;

	nextPage(): void {
		if (!this.hasNextPage || this.isLoading()) {
			return;
		}

		const input = this.buildFilters();
		input.pagination = {
			first: this.itemsPerPage,
			after: this.pagination().endCursor ?? undefined
		};

		this.executeQueryWithPageUpdate(input, 'next').subscribe();
	}

	previousPage(): void {
		if (!this.hasPreviousPage || this.isLoading()) {
			return;
		}

		const input = this.buildFilters();
		input.pagination = {
			last: this.itemsPerPage,
			before: this.pagination().startCursor ?? undefined
		};

		this.executeQueryWithPageUpdate(input, 'previous').subscribe();
	}

	private executeQueryObservable(input: GraphQLQueryInput): Observable<ReviewsOfBusinessResponse | null> {
		this.isLoading.set(true);
		return this.graphqlClient
			.query<ReviewsOfBusinessResponse>(
				{
					queryId: GRAPHQL_QUERIES['BizReviews'].queryId,
					isPaginated: GRAPHQL_QUERIES['BizReviews'].isPaginated
				},
				{
					pagination: input.pagination ?? { first: this.itemsPerPage },
					fields: input.fields,
					order: input.order,
					optionalParam: { key: 'bizId', value: this.businessId() }
				}
			)
			.pipe(
				tap((res) => {
					this.reviewsList.set(res.data.reviewsOfBusiness.edges);
					this.pagination.set(res.data.reviewsOfBusiness.pageInfo!);
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
				finalize(() => this.isLoading.set(false)),
				takeUntilDestroyed(this.#destroyRef)
			);
	}

	get hasNextPage(): boolean {
		return this.pagination().hasNextPage ?? false;
	}

	get hasPreviousPage(): boolean {
		return this.pagination().hasPreviousPage ?? false;
	}

	callApi(): void {
		this.executeQueryObservable(this.buildFilters()).subscribe();
	}

	resetFilter() {
		const pagination = this.queryForm.get('pagination')!.value;
		const idOrder = this.queryForm.get('order.id')!.value;
		const filterControls = this.queryForm.get('filter') as FormGroup;
		if (filterControls) {
			Object.keys(filterControls.controls).forEach((key) => {
				const control = filterControls.get(key);
				if (control) {
					control.patchValue({
						value: null
					});
				}
			});
		}
		const orderControls = this.queryForm.get('order') as FormGroup;
		if (orderControls) {
			Object.keys(orderControls.controls).forEach((key) => {
				if (key !== 'id') {
					const control = orderControls.get(key) as FormGroup;
					if (control) {
						control.patchValue({
							orderOperator: null
						});
					}
				}
			});
		}
		this.queryForm.patchValue({
			order: {
				id: idOrder
			},
			pagination
		});

		this.queryForm.markAsPristine();
		this.queryForm.markAsUntouched();
		this.callApi();
	}

	private executeQueryWithPageUpdate(
		input: GraphQLQueryInput,
		direction: 'next' | 'previous'
	): Observable<ReviewsOfBusinessResponse | null> {
		return this.executeQueryObservable(input).pipe(
			tap((res) => {
				if (res) {
					// Update current page only on successful response
					if (direction === 'next') {
						this.currentPage.update((page) => page + 1);
					} else if (direction === 'previous') {
						this.currentPage.update((page) => Math.max(1, page - 1));
					}
				}
			})
		);
	}

	private buildFilters(): GraphQLQueryInput {
		const raw = this.queryForm.getRawValue();

		const fields: GraphQLFieldFilter[] = (Object.values(raw.filter) as GraphQLFieldFilter[]).filter(
			(f) => f.value !== null && f.value !== ''
		);

		const order: GraphQLOrder[] = (Object.values(raw.order) as GraphQLOrder[]).filter(
			(o) => o.orderOperator !== null
		);

		return {
			fields: fields.length ? fields : undefined,
			order: order.length ? order : undefined,
			pagination: raw.pagination as GraphQLPagination
		};
	}
}
