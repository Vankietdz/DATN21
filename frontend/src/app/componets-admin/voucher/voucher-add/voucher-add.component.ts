import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoucherService } from '../../../services/voucher/voucher.service';

@Component({
  selector: 'app-voucher-add',
  standalone: true,
  templateUrl: './voucher-add.component.html',
  styleUrls: ['./voucher-add.component.css'],
  imports: [CommonModule, FormsModule]
})
export class VoucherAddComponent {
  voucher = {
    code: '',
    discount_amount: 0,
    type: "percent",
    start_date: '',
    create_start_date: '',
    end_date: ''
  };
  errorMessage1: string = '';
  errorMessage2: string = '';

  constructor(
    private voucherService: VoucherService,
    private router: Router
  ) { }

  formatDate(date: string | Date): string {
    return new Date(date).toISOString().split('T')[0];
  }
  // validateDiscount() {

  //   const { type, discount_amount } = this.voucher;
  //   if (discount_amount < 0) {
  //     this.voucher.discount_amount = 0;
  //   }
  //   if (type === 'percent' && discount_amount > 70) {
  //     this.errorMessage = 'Giảm phần trăm không được vượt quá 70% tức là 70';
  //   } else if (type === 'fixed' && discount_amount > 2000000) {
  //     this.errorMessage = 'Giảm số tiền không được vượt quá 2 triệu VND';
  //   } else {
  //     this.errorMessage = '';
  //   }
  // }
  makeThemSame(value: string) {
    this.voucher.create_start_date = value;
    this.voucher.start_date = value;
    this.validateDate();
  }
  validateDiscount() {
    this.errorMessage1 = this.voucherService.validate(this.voucher);
  }
  validateDate() {
    this.errorMessage2 = this.voucherService.isDateValid(this.voucher, 'create');
  }

  goToVoucherList() {
    this.router.navigate(['/admin/voucher-list']);
  }
  addVoucher() {

    if (this.errorMessage1 == '' && this.errorMessage1 == '')
      this.voucher.start_date = this.voucher.create_start_date,
        this.voucherService.create(this.voucher).subscribe({
          next: () => {
            alert('Thêm voucher thành công!');
            this.router.navigate(['/admin/voucher-list']);
          },
          error: (err) => {
            // console.error(err);
            alert(err.message);
          }
        });
  }
}
