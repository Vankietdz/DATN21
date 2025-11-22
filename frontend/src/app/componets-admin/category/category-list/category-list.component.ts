import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // ✅ Thêm Router
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category/category.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxPaginationModule, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  p: number = 1;
  keyword: string = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router // ✅ Inject router
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data: any) => {
        this.categories = Array.isArray(data) ? data : [];
        this.filteredCategories = this.categories;
        // Log để debug
        console.log('Categories loaded:', this.categories);
        this.categories.forEach((cat: any) => {
          if (!cat.imageCategory || cat.imageCategory === '') {
            console.warn('Category missing image:', cat.nameCategory, cat);
          }
        });
      },
      error: (err) => {
        console.error('Lỗi khi tải danh mục:', err);
        alert('Không thể tải danh sách danh mục. Vui lòng thử lại.');
      }
    });
  }

  onSearch() {
    if (this.keyword.trim() === '') {
      this.filteredCategories = this.categories;
    } else {
      this.filteredCategories = this.categories.filter(c =>
        (c.nameCategory || '').toLowerCase().includes(this.keyword.toLowerCase())
      );
    }
    this.p = 1;
  }

  onDelete(id: string) {
    const result = confirm('Bạn có chắc muốn xóa danh mục này không?');
    if (result) {
      this.categoryService.delete(id).subscribe({
        next: (res: any) => {
          alert('Xóa thành công!');
          // Reload danh sách để đảm bảo đồng bộ
          this.loadCategories();
        },
        error: (err) => {
          console.error('Lỗi khi xóa danh mục:', err);
          const errorMessage = err?.error?.message || 'Không thể xóa danh mục, vui lòng thử lại.';
          alert(errorMessage);
        }
      });
    }
  }

  // Get default placeholder image (data URI)
  getDefaultImage(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  // Handle image error
  onImageError(event: any) {
    event.target.src = this.getDefaultImage();
  }
}
