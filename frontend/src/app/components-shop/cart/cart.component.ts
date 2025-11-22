import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  imports: [CommonModule, FormsModule]
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];

  constructor(private cartService: CartService,private router: Router) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartItems = this.cartService.getCart();
  }

  updateQuantity(item: any, quantity: number) {
    item.quantity = Number(quantity);
    this.cartService.saveCart(this.cartItems);
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.cartService.saveCart(this.cartItems);
  }

  get total(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
  goToPayment() {
  this.router.navigate(['/payment']);
}
}
