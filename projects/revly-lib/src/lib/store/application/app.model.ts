export type ApplicationModel = {
	isAuthenticated: boolean;
	lastTimeAuthenticated: Date | null;
	isStaff: boolean;
	isAppAdmin: boolean;
	isAppMod: boolean;
};
