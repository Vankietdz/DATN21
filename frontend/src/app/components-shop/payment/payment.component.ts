
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../services/order/order.service';
import { CartService } from '../../services/cart/cart.service';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class PaymentComponent implements OnInit {

  paymentForm: FormGroup;
  cartItems: any[] = [];
  total: number = 0;
  user: any;

  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router,
    private http: HttpClient,

  ) {
    this.paymentForm = new FormGroup({
      fullname: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', Validators.required),
      province: new FormControl('', Validators.required),
      district: new FormControl('', Validators.required),
      ward: new FormControl('', Validators.required),
      paymentMethod: new FormControl('COD', Validators.required),
    });
  }

  ngOnInit() {
    this.cartItems = this.cartService.getCart();

    this.total = this.cartItems.reduce(
      (sum, item) => sum + item.price * Number(item.quantity),
      0
    );

    const userStorage = localStorage.getItem('login');
    if (!userStorage) {
      alert("⚠️ Bạn phải đăng nhập trước khi thanh toán!");
      this.router.navigate(['/login']);
      return;
    }

    this.user = JSON.parse(userStorage);

    this.paymentForm.patchValue({
      fullname: this.user.fullName || this.user.fullname,
      email: this.user.email,
    });

    this.loadProvinces();
  }

  loadProvinces() {
    this.http.get<any[]>('https://provinces.open-api.vn/api/?depth=1')
      .subscribe(res => this.provinces = res);
  }

  onProvinceChange(event: any) {
    const code = event.target.value;

    this.http.get<any>(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
      .subscribe(res => this.districts = res.districts);

    this.wards = [];
    this.paymentForm.patchValue({ district: '', ward: '' });
  }

  onDistrictChange(event: any) {
    const code = event.target.value;

    this.http.get<any>(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
      .subscribe(res => this.wards = res.wards);

    this.paymentForm.patchValue({ ward: '' });
  }

  onPayment() {
    if (this.paymentForm.invalid) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const items = this.cartItems.map(item => ({
      productId: item._id,
      name: item.name || "Sản phẩm",
      size: item.size || "M",
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image
    }));

    const fullAddress = `${this.paymentForm.value.ward}, ${this.paymentForm.value.district}, ${this.paymentForm.value.province}`;

    const orderData = {
      userId: this.user._id,
      fullname: this.paymentForm.value.fullname,
      email: this.paymentForm.value.email,
      phone: this.paymentForm.value.phone,
      address: fullAddress,
      paymentMethod: this.paymentForm.value.paymentMethod,
      items,
      totalPrice: this.total
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (orderRes: any) => {

        console.log("ORDER SEND TO SUCCESS PAGE:", orderRes);

        // ⭐ CHỈ GỬI DỮ LIỆU -> KHÔNG XÓA GIỎ
        this.router.navigate(['/order-success'], {
          state: {
            paymentMethod: orderData.paymentMethod,
            order: orderRes
          }
        });

      },
      error: err => {
        console.error(err);
        alert("❌ Lỗi thanh toán!");
      }
    });
  }
  onVNPay(){

  }
}
