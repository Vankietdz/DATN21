import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // ✅ Thêm Router
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Type } from '../../../models/type';
import { TypeService } from '../../../services/type/type.service';

@Component({
  selector: 'app-type-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxPaginationModule, FormsModule],
  templateUrl: './type-list.component.html',
  styleUrls: ['./type-list.component.css'],
})
export class TypeListComponent implements OnInit {
  categories: Type[] = [];
  filteredCategories: Type[] = [];
  p: number = 1;
  keyword: string = '';

  constructor(
    private typeService: TypeService,
    private router: Router // ✅ Inject router
  ) {}

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    this.typeService.getAll().subscribe({
      next: (data: any) => {
        this.categories = Array.isArray(data) ? data : [];
        this.filteredCategories = this.categories;
        console.log('Types loaded:', this.categories);
      },
      error: (err) => {
        console.error('Lỗi khi tải loại:', err);
        alert('Không thể tải danh sách loại. Vui lòng thử lại.');
      }
    });
  }

  onSearch() {
    if (this.keyword.trim() === '') {
      this.filteredCategories = this.categories;
    } else {
      this.filteredCategories = this.categories.filter(c =>
        (c.nameType || '').toLowerCase().includes(this.keyword.toLowerCase())
      );
    }
    this.p = 1;
  }

  onDelete(id: string) {
    const result = confirm('Bạn có chắc muốn xóa loại này không?');
    if (result) {
      this.typeService.delete(id).subscribe({
        next: (res: any) => {
          alert('Xóa thành công!');
          this.loadTypes(); // Reload after delete
        },
        error: (err) => {
          console.error('Lỗi khi xóa loại:', err);
          alert('Không thể xóa loại, vui lòng thử lại.');
        }
      });
    }
  }
}
