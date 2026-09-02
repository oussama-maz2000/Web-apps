export type Role = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export const APP_ROLES = {
	Admin: 'Admin',
	Moderator: 'Moderator'
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export type RoleOperationsReqDto = {
	email: string;
	role: AppRole;
};
