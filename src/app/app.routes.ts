import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./features/security/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'device',
        canActivate: [AuthGuard],
        loadChildren: () => import('./features/device/device.routes').then(m => m.DEVICE_ROUTES)
    },
    {
        path: 'not-found',
        loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
    },
    {
        path: '**',
        redirectTo: 'not-found'
    }       
];

