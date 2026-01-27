import { Component, OnInit } from '@angular/core';
import { Article, ArticleService } from '../../services/article';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './article-list.html',
  styleUrl: './article-list.css',
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  categories = ['Actualités', 'Sport', 'Divertissement', 'Technologie', 'Autre'];
  newArticle: Article = { title: '', content: '', category: this.categories[0] };

  constructor(private articleService: ArticleService) {}
  ngOnInit(): void {
    this.loadArticles();
  }
  loadArticles(): void {
    this.articleService.getArticles().subscribe((data) => (this.articles = data));
  }
  deleteArticle(id?: string): void {
    if (!id) {
      console.warn('Aucun identifiant article fourni pour la suppression.');
      return;
    }
    this.articleService.deleteArticle(id).subscribe(() => this.loadArticles());
  }
  addArticle(): void {
    if (this.newArticle.title && this.newArticle.content && this.newArticle.category) {
      this.articleService.addArticle(this.newArticle).subscribe(() => {
        this.loadArticles();
        this.newArticle = { title: '', content: '', category: this.categories[0] };
      });
    }
  }
  getCategoryClass(category: string): string {
    const normalized = category?.toLowerCase();
    if (normalized?.includes('sport')) return 'category-sport';
    if (normalized?.includes('divert')) return 'category-divertissement';
    if (normalized?.includes('tech')) return 'category-technologie';
    if (normalized?.includes('actu')) return 'category-actualites';
    return 'category-autre';
  }
}
