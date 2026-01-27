import { Routes } from '@angular/router';
import { ArticleListComponent } from './components/article-list/article-list';
export const routes: Routes = [
  { path: 'articles', component: ArticleListComponent },
  { path: '', redirectTo: 'articles', pathMatch: 'full' },
];
