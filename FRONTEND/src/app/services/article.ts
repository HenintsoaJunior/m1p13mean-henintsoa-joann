import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Article {
  _id?: string;
  title: string;
  content: string;
  category?: string;
}
@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private apiUrl = `${environment.apiUrl}/articles`;
  constructor(private http: HttpClient) {}
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }
  addArticle(article: Article): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, article);
  }
  updateArticle(id: string, article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, article);
  }
  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
