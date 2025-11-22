import { Component } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.css'],
  imports: [NgIf, NgFor, DecimalPipe, RouterLink]
})
export class OrderSuccessComponent {

  paymentMethod: string = '';
  order: any;
  cartItems: any[] = [];

  constructor(
    private router: Router,
    private cartService: CartService
  ) {
    // Lấy dữ liệu từ state khi navigate từ payment
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;

    // ưu tiên state → nếu không có thì lấy từ localStorage
    this.paymentMethod = state?.['paymentMethod'] || localStorage.getItem("lastPaymentMethod") || 'COD';
    this.order = state?.['order'] || JSON.parse(localStorage.getItem("orderSuccess") || "null");

    // Nếu không có order => quay về store
    if (!this.order) {
      this.router.navigate(['/store']);
      return;
    }

    // Lấy giỏ hàng từ localStorage để hiển thị chi tiết order
    this.cartItems = this.cartService.getCart();

    // Sau khi hiển thị xong → xoá giỏ hàng
    this.cartService.saveCart([]);

    // Lưu lại paymentMethod để dùng khi reload
    localStorage.setItem("lastPaymentMethod", this.paymentMethod);
  }
}
