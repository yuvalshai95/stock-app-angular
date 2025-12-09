import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'stocks',
    pathMatch: 'full',
  },
  {
    path: 'stocks',
    loadComponent: () =>
      import('./stocks-main/components/stocks-list/stocks-list.component').then(
        (m) => m.StocksListComponent
      ),
  },
  {
    path: 'stock/:id',
    loadComponent: () =>
      import('./stocks-main/components/stock-details/stock-details.component').then(
        (m) => m.StockDetailsComponent
      ),
  },
];
