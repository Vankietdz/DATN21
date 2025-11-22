import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  url = `/v1`;

  constructor(private httpClient: HttpClient) {}

  // Tạo đơn hàng
  createOrder(order: any): Observable<any> {
    return this.httpClient.post(`${this.url}/order`, order);
  }

  // Lấy đơn theo user
  getOrdersByUser(userId: string) {
    return this.httpClient.get(`${this.url}/order/user/${userId}`);
  }

  // Lấy 1 đơn hàng
  getOrderById(id: string) {
    return this.httpClient.get(`${this.url}/order/${id}`);
  }

  // ✅ Lấy tất cả đơn hàng (Dành cho admin)
  getAllOrders(): Observable<any> {
    return this.httpClient.get(`${this.url}/order`);
  }

  // ✅ Cập nhật trạng thái đơn hàng
  updateStatus(id: string, status: string): Observable<any> {
    return this.httpClient.put(`${this.url}/order/${id}`, { status });
  }
}
