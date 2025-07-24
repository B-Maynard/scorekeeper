import { Routes } from '@angular/router';
import {Home} from './pages/home/home';
import { Cards } from './pages/cards/cards';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'cards', component: Cards}
];
