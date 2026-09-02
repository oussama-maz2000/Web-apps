export interface StaffUserDto {
	email: string;
	emailConfirmed: boolean;
	phoneNumber: string | null;
	phoneNumberConfirmed: boolean;
	roles: string[] | null;
}
