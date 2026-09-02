import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessOpeningHoursDto, DayOfWeek } from '@revlib/models';
import { buildImageUrl } from '@revlib/utils';
import { catchError, of, tap } from 'rxjs';
import { GRAPHQL_QUERIES } from '../../../../../../revly-lib/src/lib/graphql/apis/graphql-queries';
import {
	GraphQLFieldFilter,
	GraphQLPagination,
	GraphQLQueryInput
} from '../../../../../../revly-lib/src/lib/graphql/models/graphql.models';
import { GraphQLClientService } from '../../../../../../revly-lib/src/lib/graphql/service/graphqlClient.service';
import { StateEnum } from '../../../../../../revly-lib/src/lib/shared-constants/wilays-constants';
import { OpenStatus, STATUS_LABELS, TopBusinessCardDto } from '../business.model';

@Component({
	selector: 'app-top-businesses',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './top-businesses.component.html'
})
export class TopBusinessesComponent implements OnInit {
	businesses = signal<TopBusinessCardDto[]>([]);
	private fb = inject(FormBuilder);
	private graphClientService = inject(GraphQLClientService);
	private router = inject(Router);
	protected readonly buildImageUrl = buildImageUrl;
	protected wilays = Object.keys(StateEnum);
	private destroy = inject(DestroyRef);
	protected filterForm = this.fb.group({
		filter: this.fb.group({
			displayName: this.fb.group({
				key: ['displayName'],
				value: ['', [Validators.minLength(3)]],
				operator: ['contains']
			})
		}),
		pagination: this.fb.group({
			first: [10]
		})
	});

	toUpper(value: string | StateEnum): string {
		return String(value).toUpperCase();
	}
	ngOnInit() {
		this.loadBusinesses();
	}

	private buildFilters(): GraphQLQueryInput {
		const raw = this.filterForm.getRawValue();

		const fields: GraphQLFieldFilter[] = (Object.values(raw.filter) as GraphQLFieldFilter[]).filter(
			(f): f is GraphQLFieldFilter => !!f && f.value !== null && f.value !== ''
		);

		return {
			fields: fields.length ? fields : undefined,
			pagination: raw.pagination as GraphQLPagination
		};
	}

	private loadBusinesses(): void {
		const filters = this.buildFilters();
		const queryConfig = {
			queryId: GRAPHQL_QUERIES.GetTop10BizByCatState.queryId,
			isPaginated: GRAPHQL_QUERIES.GetTop10BizByCatState.isPaginated
		};

		this.graphClientService
			.query(queryConfig, filters)
			.pipe(
				tap((res: any) => {
					const nodes = res.data?.businesses?.nodes || [];
					this.businesses.set(nodes);
				}),
				catchError(() => {
					return of(null);
				}),
				takeUntilDestroyed(this.destroy)
			)
			.subscribe();
	}

	readonly DayOfWeek = DayOfWeek;

	getOpeningHoursLabel(hours: BusinessOpeningHoursDto | null | undefined): string {
		if (!hours) {
			return 'Horaires non disponibles';
		}
		return `${hours.openingTime} – ${hours.closingTime}`;
	}

	getStatusLabel(status: OpenStatus | null | undefined): string {
		if (status && status in STATUS_LABELS) {
			return STATUS_LABELS[status];
		}
		return 'Statut inconnu';
	}
	getStatusClass(status: string | null | undefined): string {
		if (status === 'OPEN') return 'bg-green-500 text-white';
		if (status === 'CLOSED') return 'bg-red-500 text-white';
		return 'bg-gray-500 text-white';
	}

	navigateToBusiness(categoryNameFr: string, id: string, nameSlug: string): void {
		this.router.navigate(['biz', categoryNameFr, id, nameSlug]);
	}
}
