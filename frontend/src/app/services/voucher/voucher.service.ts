import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private apiUrl = '/v1/voucher';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  update(id: string, data: any): Observable<any> {
    const voucher = {
      code: data.code,
      type: data.type,
      discount_amount: data.discount_amount,
      start_date: data.create_start_date,
      end_date: data.end_date
    };
    return this.http.put(`${this.apiUrl}/update/${id}`, voucher);
  }

  deleteVoucher(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`); // <-- đúng path
  }
  makeType() {
    return this.http.put(`${this.apiUrl}/all`, {});
  }
  validate(voucher: { type: string; discount_amount: number }): string {
    if (voucher.discount_amount < 0) {
      voucher.discount_amount = 0;
    }

    if (voucher.type === 'percent' && voucher.discount_amount > 70) {
      return 'Giảm phần trăm không được vượt quá 70%';
    }

    if (voucher.type === 'fixed' && voucher.discount_amount > 2000000) {
      return 'Giảm số tiền không được vượt quá 2 triệu VND';
    }

    return '';
  }

  isDateValid(voucher: { create_start_date: string, start_date: string; end_date: string },mode: 'create' | 'update'): string {
    if (!voucher.start_date || !voucher.end_date) return "";
    const startDate = new Date(voucher.start_date);
    const createStartDate = new Date(voucher.create_start_date);
    const endDate = new Date(voucher.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // bỏ giờ để so sánh chính xác theo ngày

    if (endDate <= startDate) {
      return 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    if ((createStartDate < today) && (startDate.getTime() != createStartDate.getTime())) {
      return 'Ngày bắt đầu không được thay đổi về quá khứ';
    }



    return '';
  }



}
