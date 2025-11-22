import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Rider } from '../../../models/rider';
import { RiderService } from '../../../services/rider/rider.service';

@Component({
  selector: 'app-rider-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxPaginationModule, FormsModule],
  templateUrl: './rider-list.component.html',
  styleUrls: ['./rider-list.component.css'],
})
export class RiderListComponent implements OnInit {
  riders: Rider[] = [];
  filteredRiders: Rider[] = [];
  p: number = 1;
  keyword: string = '';

  constructor(
    private riderService: RiderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRiders();
  }

  loadRiders() {
    this.riderService.getAll().subscribe({
      next: (data: any) => {
        this.riders = Array.isArray(data) ? data : [];
        this.filteredRiders = this.riders;
        console.log('Riders loaded:', this.riders);
      },
      error: (err) => {
        console.error('Lỗi khi tải tay đua:', err);
        alert('Không thể tải danh sách tay đua. Vui lòng thử lại.');
      }
    });
  }

  onSearch() {
    if (this.keyword.trim() === '') {
      this.filteredRiders = this.riders;
    } else {
      this.filteredRiders = this.riders.filter(r =>
        (r.nameRider || '').toLowerCase().includes(this.keyword.toLowerCase())
      );
    }
    this.p = 1;
  }

  onDelete(id: string) {
    const result = confirm('Bạn có chắc muốn xóa tay đua này không?');
    if (result) {
      this.riderService.delete(id).subscribe({
        next: (res: any) => {
          alert('Xóa thành công!');
          this.loadRiders(); // Reload after delete
        },
        error: (err) => {
          console.error('Lỗi khi xóa tay đua:', err);
          alert('Không thể xóa tay đua, vui lòng thử lại.');
        }
      });
    }
  }
}

