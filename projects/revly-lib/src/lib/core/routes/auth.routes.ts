import { Routes } from '@angular/router';
import { denyAuthenticated } from '../../guards/auth.guard';

export const AUTH_PATHS = {
	SIGNUP: 'auth/signup',
	LOGIN: 'auth/login',
	FORGOT_PASSWORD: 'auth/recovery/forgot-password',
	RESET_PASSWORD: 'auth/recovery/reset-password',
	EMAIL_CONFIRM: 'auth/email-confirm',
	EMAIL_CONFIRM_CHANGE: 'auth/email-confirm-change',
	PHONE_VERIFY: 'auth/phone-verify'
};

/**
 * Auth routes
 * These routes are used to authenticate the user
 */
export const AUTH_ROUTES: Routes = [
	{
		path: AUTH_PATHS.LOGIN,
		pathMatch: 'full',
		title: 'Login',
		loadComponent: () => import('@revlib/components/auth/login/login.component').then((m) => m.LoginComponent),
		canActivate: [denyAuthenticated]
	},
	{
		path: AUTH_PATHS.SIGNUP,
		pathMatch: 'full',
		title: 'Signup',
		loadComponent: () =>
			import('@revlib/components/auth/signup/signup.component').then((m) => m.SignupComponent),
		canActivate: [denyAuthenticated]
	},
	{
		path: AUTH_PATHS.FORGOT_PASSWORD,
		pathMatch: 'full',
		title: 'Forgot Password',
		loadComponent: () =>
			import('@revlib/components/auth/password/forgot-password.component').then(
				(m) => m.ForgotPasswordComponent
			)
	},
	{
		path: AUTH_PATHS.RESET_PASSWORD,
		pathMatch: 'full',
		title: 'Reset Password',
		loadComponent: () =>
			import('@revlib/components/auth/password/reset-password.component').then(
				(m) => m.ResetPasswordComponent
			)
	},
	{
		path: AUTH_PATHS.EMAIL_CONFIRM,
		pathMatch: 'full',
		title: 'Verify Email',
		loadComponent: () =>
			import('@revlib/components/auth/email/email-verify.component').then((m) => m.EmailVerifyComponent)
	},
	{
		path: AUTH_PATHS.EMAIL_CONFIRM_CHANGE,
		pathMatch: 'full',
		title: 'Verify Email Change',
		loadComponent: () =>
			import('@revlib/components/auth/email/email-confirm-change.component').then(
				(m) => m.EmailConfirmChangeComponent
			)
	},
	{
		path: AUTH_PATHS.PHONE_VERIFY,
		pathMatch: 'full',
		title: 'Verify Phone',
		loadComponent: () =>
			import('@revlib/components/auth/phone/phone-management.component').then(
				(m) => m.PhoneManagementComponent
			),
		canActivate: [denyAuthenticated]
	}
];
