import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  imports: [CommonModule, RouterModule, FormsModule]
})
export class ProductDetailComponent implements OnInit {
  product!: Product;
  relatedProducts: Product[] = [];
  currentImageIndex = 0;
  selectedSize: { name: string; stock: number } | null = null;
  selectedQuantity: number = 1;
  productImages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductDetail(id).subscribe((data: any) => {
        this.product = data;
        this.productImages = [this.product.imagesProduct[0]];

      });
    }
  }

  loadRelatedProducts(category: string) {
    this.productService.getProductByQuery({ category }).subscribe((data: any) => {
      this.relatedProducts = data.filter((p: Product) => p._id !== this.product._id);
    });
  }

  // Slider ảnh
  prevImage() {
    if (!this.productImages.length) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.productImages.length) % this.productImages.length;
  }

  nextImage() {
    if (!this.productImages.length) return;
    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.productImages.length;
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
  }

  // Chọn size
  selectSize(size: { name: string; stock: number }) {
    this.selectedSize = size;
    this.selectedQuantity = 1;
  }

  get availableQuantities(): number[] {
    if (!this.selectedSize) return [];
    return Array.from({ length: this.selectedSize.stock }, (_, i) => i + 1);
  }

  // Modal
  openModal() {
    const modal = document.getElementById('sizeModal');
    if (modal) modal.style.display = 'block';
  }

  closeModal() {
    const modal = document.getElementById('sizeModal');
    if (modal) modal.style.display = 'none';
  }

  // Thêm vào giỏ hàng
  addToCart() {
    if (!this.selectedSize) {
      alert("⚠️ Vui lòng chọn size trước khi thêm vào giỏ hàng!");
      return;
    }
    const cartItem = {
      _id: this.product._id,
      name: this.product.nameProduct,
      price: this.product.priceProduct,
      image: this.product.imagesProduct[0],
      size: this.selectedSize.name,
      quantity: this.selectedQuantity
    };
    this.cartService.addToCart(cartItem);
    alert("🛒 Đã thêm vào giỏ hàng!");
  }
}
