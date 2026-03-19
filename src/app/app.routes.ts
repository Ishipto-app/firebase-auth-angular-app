import {Routes} from '@angular/router';
import {authGuard} from './code/auth/guard/auth.guard';
import {noAuthGuard} from './code/auth/guard/noAuth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./module/auth/sign-in/sign-in').then(m => m.SignIn),
  },
  {
    path: 'sign-up',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./module/auth/sign-up/sign-up').then(m => m.SignUp),
  },
  {
    path: 'user-verify',
    loadComponent: () => import('./module/auth/user-verify/user-verify').then(m => m.UserVerify),
  },
  {
    path: 'home',
    loadComponent: () => import('./module/auth/home-page/home-page').then(m => m.HomePage),
  },
  {
    path: 'logout',
    loadComponent: () => import('./module/auth/sign-out/sign-out').then(m => m.SignOut),
  },
  {
    path: 'permission-denied',
    loadComponent: () => import('./module/auth/page-permission/page-permission').then(m => m.PagePermission),
  },
  {
    path: 'admin/workflow',
    canActivate: [authGuard],
    data: { roles: ['workflow'] }, // Example roles
    loadComponent: () => import('./module/admin/page/workflow/workflow').then(m => m.Workflow),
  },
  {
    path: 'admin/user-list',
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./module/auth/user-list/user-list').then(m => m.UserList),
  },
  {
    path: '404',
    loadComponent: () => import('./module/auth/error/error').then(m => m.ErrorComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
