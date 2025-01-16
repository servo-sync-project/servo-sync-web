import { Routes } from '@angular/router';
import { ConnectionComponent } from './components/connection/connection.component';
import { ConfigComponent } from './components/config/config.component';
import { ControlComponent } from './components/control/control.component';
import { OverviewComponent } from './components/overview/overview.component';

export const DEVICE_ROUTES: Routes = [
    { path: '', redirectTo: 'connection', pathMatch: 'full'},
    { path: 'connection', component: ConnectionComponent },
    { path: 'config', component: ConfigComponent },
    { path: 'control', component: ControlComponent },
    { path: 'overview', component: OverviewComponent }
];
