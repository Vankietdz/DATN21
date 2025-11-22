import { Component, OnInit } from '@angular/core';
import { New } from '../../../models/news';
import { NewsService } from '../../../services/news/news.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-news-list',
  standalone:true,
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css'],
   imports: [CommonModule, RouterLink, NgxPaginationModule, FormsModule],
})
export class NewsListComponent implements OnInit {
 news: New[] = [];
  filterednews: New[] = [];
  p: number = 1;
  keyword: string = '';

  constructor(
    private newsService: NewsService,
    private router: Router // ✅ Inject router
  ) {}

  ngOnInit() {
    this.newsService.getAll().subscribe({
      next: (data) => {
        this.news = data as New[];
        this.filterednews = this.news;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh mục:', err);
      }
    });
  }

  onSearch() {
    if (this.keyword.trim() === '') {
      this.filterednews = this.news;
    } else {
      this.filterednews = this.news.filter(c =>
        c.name.toLowerCase().includes(this.keyword.toLowerCase())
      );
    }
    this.p = 1;
  }

  onDelete(id: string) {
    const result = confirm('Bạn có chắc muốn xóa danh mục này không?');
    if (result) {
      this.newsService.delete(id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          // ✅ Không reload trang, chỉ gọi lại danh sách
          this.filterednews = this.filterednews.filter(c => c._id !== id);
        },
        error: (err) => {
          console.error('Lỗi khi xóa danh mục:', err);
          alert('Không thể xóa danh mục, vui lòng thử lại.');
        }
      });
    }
  }
}
