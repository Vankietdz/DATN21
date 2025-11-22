import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';
import { CommonModule, NgFor } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgxPaginationModule,
    FormsModule,

  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {


  users: User[] = [];
  filteredusers: User[] = [];
  p: number = 1;
  keyword: string = '';

  constructor(
    private userService: UserService ,
    private router: Router // ✅ Inject router
  ) {}

  ngOnInit() {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data as User[];
        this.filteredusers = this.users;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh mục:', err);
      }
    });
  }

  onSearch() {
    if (this.keyword.trim() === '') {
      this.filteredusers = this.users;
    } else {
      this.filteredusers = this.users.filter(c =>
        c.fullName.toLowerCase().includes(this.keyword.toLowerCase())
      );
    }
    this.p = 1;
  }

  onDelete(id: string) {
    const result = confirm('Bạn có chắc muốn xóa danh mục này không?');
    if (result) {
      this.userService.delete(id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          // ✅ Không reload trang, chỉ gọi lại danh sách
          this.filteredusers = this.filteredusers.filter(c => c._id !== id);
        },
        error: (err) => {
          console.error('Lỗi khi xóa danh mục:', err);
          alert('Không thể xóa danh mục, vui lòng thử lại.');
        }
      });
    }
  }

}
