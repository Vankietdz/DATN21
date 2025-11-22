import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoucherService } from '../../../services/voucher/voucher.service';

@Component({
  selector: 'app-voucher-edit',
  standalone: true,
  templateUrl: './voucher-edit.component.html',
  styleUrls: ['./voucher-edit.component.css'],
  imports: [CommonModule, FormsModule]
})
export class VoucherEditComponent implements OnInit {
  voucherId!: string;
  voucher = {
    code: '',
    type: "percent",
    discount_amount: 0,
    create_start_date: '',
    start_date: '', //phải là yyyy-MM-dd
    end_date: ''
  };
  errorMessage1: string = '';
  errorMessage2: string = '';

  constructor(
    private route: ActivatedRoute,
    private voucherService: VoucherService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.voucherId = this.route.snapshot.params['id'];

    this.voucherService.getById(this.voucherId).subscribe({
      next: (res) => {
        // Nếu API trả về { voucher: {...} }, thì phải dùng res.voucher
        this.voucher = res.voucher || res; // tự động fallback nếu không có "voucher"
        this.voucher.start_date = this.formatDate(this.voucher.start_date);
        this.voucher.create_start_date = this.formatDate(this.voucher.start_date);
        this.voucher.end_date = this.formatDate(this.voucher.end_date);
      },
      error: (err) => {
        console.error(err);
        alert('Không tìm thấy voucher!');
      }
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  validateDiscount() {
    this.errorMessage1 = this.voucherService.validate(this.voucher);
  }
  validateDate() {
    this.errorMessage2 = this.voucherService.isDateValid(this.voucher,'update');
  }
  goToVoucherList() {
    this.router.navigate(['/admin/voucher-list']);
  }


  updateVoucher(): void {
    console.log(this.voucher.create_start_date)
    this.voucherService.update(this.voucherId, this.voucher).subscribe({
      next: () => {
        alert('Cập nhật voucher thành công!');
        this.router.navigate(['/admin/voucher-list']);
      },
      error: (err) => {
        console.error(err);
        alert('Lỗi khi cập nhật voucher!');
      }
    });
  }
}
