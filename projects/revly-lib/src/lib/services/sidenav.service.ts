import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class SidenavService {
	private _isOpen = signal<boolean>(false);
	public readonly isOpen = this._isOpen.asReadonly();

	public toggle(): void {
		this._isOpen.update((value) => !value);
	}

	public open(): void {
		this._isOpen.set(true);
	}

	public close(): void {
		this._isOpen.set(false);
	}
}
