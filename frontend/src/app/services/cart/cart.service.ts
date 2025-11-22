import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private CART_KEY = 'cartItems';

  getCart(): any[] {
    return JSON.parse(localStorage.getItem(this.CART_KEY) || '[]');
  }

  saveCart(cart: any[]) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  }

  addToCart(product: any) {
    const cart = this.getCart();
    const existing = cart.find(
      (item: any) => item._id === product._id && item.size === product.size
    );
    if (existing) {
      existing.quantity += product.quantity;
    } else {
      cart.push(product);
    }
    this.saveCart(cart);
  }

  clearCart() {
    localStorage.removeItem(this.CART_KEY);
  }
}
