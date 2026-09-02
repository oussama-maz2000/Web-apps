import { HttpClient } from '@angular/common/http';
import { afterNextRender, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NAVIGATOR } from '@revlib/core';
import { BehaviorSubject, fromEvent, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, map, switchMap, take, timeout } from 'rxjs/operators';
import { API_COMMON_ENDPOINTS } from '../api/api-common-endpoints';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
	readonly #destroyRef = inject(DestroyRef);
	readonly #navigator = inject(NAVIGATOR, { optional: true });

	readonly #NORMAL_PING_INTERVAL = 5000; //every 5 seconds check if the backend is online
	readonly #FAST_PING_INTERVAL = 1000;
	readonly #PING_TIMEOUT = 1000; //every 1 second timeout the ping
	readonly #FAILURE_THRESHOLD = 2; //2 consecutive failures to consider the backend offline, aka max 6sec detection
	readonly #FAST_MODE_DURATION = 20000; // 20 seconds

	#intervalSubject = new BehaviorSubject<number>(this.#NORMAL_PING_INTERVAL);

	// Guard navigator access: Default to true on server (SSR) so UI isn't blocked or actual browser state if available
	#isOnline = signal(this.#navigator?.onLine ?? true);
	#consecutiveFailures = signal(0);
	#fastModeSubscription?: Subscription;

	readonly isOnline = this.#isOnline.asReadonly();
	readonly consecutiveFailures = this.#consecutiveFailures.asReadonly();

	constructor(private http: HttpClient) {
		// Only initialize logic if we are in the browser
		// 2. Run outside Angular zone so the timer doesn't block hydration
		// ONLY runs in the browser, AFTER hydration completes
		afterNextRender(() => {
			this.#isOnline.set(navigator.onLine); // Sync with actual browser state after hydration
			this.initializeConnectivityChecks();
		});
	}

	private initializeConnectivityChecks(): void {
		// Browser events with proper operators to avoid nested subscriptions
		fromEvent(window, 'online')
			.pipe(
				switchMap(() => {
					// Reset failure count
					this.#consecutiveFailures.set(0);
					// Use the pingBackend directly with switchMap to avoid nested subscription
					return this.pingBackend();
				}),
				takeUntilDestroyed(this.#destroyRef)
			)
			.subscribe((success) => this.handlePingResult(success));

		fromEvent(window, 'offline')
			.pipe(takeUntilDestroyed(this.#destroyRef))
			.subscribe(() => this.handleOfflineEvent());

		this.startPeriodicPing();
	}

	private startPeriodicPing(): void {
		this.#intervalSubject
			.pipe(
				switchMap((interval) => timer(0, interval)),
				switchMap(() => this.pingBackend()),
				catchError(() => of(false)),
				takeUntilDestroyed(this.#destroyRef)
			)
			.subscribe((success) => this.handlePingResult(success));
	}

	private pingBackend(): Observable<boolean> {
		return this.http.get(API_COMMON_ENDPOINTS.HEALTH_CHECK, { responseType: 'text' }).pipe(
			timeout(this.#PING_TIMEOUT),
			map(() => true),
			catchError(() => of(false))
		);
	}

	private handlePingResult(success: boolean): void {
		if (success) {
			this.#consecutiveFailures.set(0);
			this.#isOnline.set(true);
			this.#switchToNormalMode();
			return;
		}

		// Cap at FAILURE_THRESHOLD + 1 to avoid unnecessary increments
		const currentFailures = this.#consecutiveFailures();
		if (currentFailures < this.#FAILURE_THRESHOLD + 1) this.#consecutiveFailures.set(currentFailures + 1);

		// Switch to fast mode on first failure
		if (currentFailures === 0) this.#switchToFastMode();

		if (currentFailures + 1 >= this.#FAILURE_THRESHOLD) this.#isOnline.set(false);
	}

	#switchToFastMode(): void {
		// Clear any existing subscription
		if (this.#fastModeSubscription) {
			this.#fastModeSubscription.unsubscribe();
		}

		this.#intervalSubject.next(this.#FAST_PING_INTERVAL);

		// Auto-revert to normal mode after duration using RxJS
		this.#fastModeSubscription = timer(this.#FAST_MODE_DURATION)
			.pipe(take(1))
			.subscribe(() => {
				this.#switchToNormalMode();
			});
	}

	#switchToNormalMode(): void {
		if (this.#fastModeSubscription) {
			this.#fastModeSubscription.unsubscribe();
			this.#fastModeSubscription = undefined;
		}

		// Only switch if currently in fast mode to avoid unnecessary emissions
		if (this.#intervalSubject.value === this.#FAST_PING_INTERVAL) {
			this.#intervalSubject.next(this.#NORMAL_PING_INTERVAL);
		}
	}

	private handleOfflineEvent(): void {
		this.#isOnline.set(false);
		this.#consecutiveFailures.set(this.#FAILURE_THRESHOLD);
		this.#switchToFastMode();
	}
}
