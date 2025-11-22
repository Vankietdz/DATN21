import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { VoucherService } from '../../../services/voucher/voucher.service';
@Component({
  selector: 'app-voucher-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule],
  templateUrl: './voucher-list.component.html',
  styleUrls: ['./voucher-list.component.css']
})
export class VoucherListComponent implements OnInit {
  vouchers: any[] = [];
  p: number = 1;
  isLoading: boolean = false;
  errorMessage: string = '';


  constructor(private voucherService: VoucherService) {}

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.isLoading = true;
    this.voucherService.getAll().subscribe({
      next: (res) => {
        this.vouchers = res.vouchers;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải danh sách voucher.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  deleteVoucher(id: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      this.voucherService.deleteVoucher(id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.loadVouchers();
        },
        error: (err) => {
          alert('Đã xảy ra lỗi khi xóa voucher.');
          console.error(err);
        }
      });
    }
  }
}
