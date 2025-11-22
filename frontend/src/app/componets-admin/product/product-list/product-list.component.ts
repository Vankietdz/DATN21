import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../models/product';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category/category.service';
import { TypeService } from '../../../services/type/type.service';
import { RiderService } from '../../../services/rider/rider.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxPaginationModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  p: number = 1;
  keyword: string = '';

  // Filters
  categories: any[] = [];
  types: any[] = [];
  riders: any[] = [];

  categoryFilter: string = '';
  typeFilter: string = '';
  riderFilter: string = '';

  // Price filters
  minPrice?: number;
  maxPrice?: number;

  // Sort option: '', 'price_asc', 'price_desc', 'stock_asc', 'stock_desc'
  sortOption: string = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private typeService: TypeService,
    private riderService: RiderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadFilters();
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data as Product[];
        this.applyFilters(); // initialize filteredProducts
      },
      error: (err) => {
        console.error('Lỗi khi tải danh mục:', err);
      }
    });
  }

  loadFilters() {
    this.categoryService.getAll().subscribe({
      next: (res: any) => this.categories = Array.isArray(res) ? res : [],
      error: err => console.error('Lỗi khi tải danh mục:', err)
    });

    this.typeService.getAll().subscribe({
      next: (res: any) => this.types = Array.isArray(res) ? res : [],
      error: err => console.error('Lỗi khi tải loại:', err)
    });

    this.riderService.getAll().subscribe({
      next: (res: any) => this.riders = Array.isArray(res) ? res : [],
      error: err => console.error('Lỗi khi tải tay đua:', err)
    });
  }

  onSearch() {
    // reuse applyFilters which considers keyword as well
    this.applyFilters();
    this.p = 1;
  }

  onFilterChange() {
    this.applyFilters();
    this.p = 1;
  }

  resetFilters() {
    this.keyword = '';
    this.categoryFilter = '';
    this.typeFilter = '';
    this.riderFilter = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.sortOption = '';
    this.applyFilters();
  }

  private getProductCategoryId(product: any): string | undefined {
    return product?.categoryProduct?._id || product?.categoryProduct;
  }

  private getProductTypeId(product: any): string | undefined {
    return product?.typeProduct?._id || product?.typeProduct;
  }

  private getProductRiderId(product: any): string | undefined {
    return product?.riderProduct?._id || product?.riderProduct;
  }

  private getProductTypeName(product: any): string {
    if (!product) return '';
    if (product.typeProduct) {
      // if stored as object
      if (typeof product.typeProduct === 'object') {
        return product.typeProduct.nameType || '';
      }
      // if stored as id string, find in loaded types
      const found = this.types.find(t => t._id === product.typeProduct);
      return found ? found.nameType : product.typeProduct;
    }
    return '';
  }

  private getProductRiderName(product: any): string {
    if (!product) return '';
    if (product.riderProduct) {
      if (typeof product.riderProduct === 'object') {
        return product.riderProduct.nameRider || '';
      }
      const found = this.riders.find(r => r._id === product.riderProduct);
      return found ? found.nameRider : product.riderProduct;
    }
    return '';
  }

  applyFilters() {
    const kw = this.keyword?.trim().toLowerCase();
    this.filteredProducts = this.products.filter(p => {
      // keyword filter (by name)
      const matchesKeyword = !kw || (p.nameProduct || '').toLowerCase().includes(kw);

      // category filter
      const pidCat = this.getProductCategoryId(p) || '';
      const matchesCategory = !this.categoryFilter || pidCat === this.categoryFilter;

      // type filter
      const pidType = this.getProductTypeId(p) || '';
      const matchesType = !this.typeFilter || pidType === this.typeFilter;

      // rider filter
      const pidRider = this.getProductRiderId(p) || '';
      const matchesRider = !this.riderFilter || pidRider === this.riderFilter;

      // price filter
      const price = Number(p.priceProduct ?? p.price ?? 0);
      const matchesMinPrice = (this.minPrice === undefined || this.minPrice === null) ? true : price >= Number(this.minPrice);
      const matchesMaxPrice = (this.maxPrice === undefined || this.maxPrice === null) ? true : price <= Number(this.maxPrice);

      return matchesKeyword && matchesCategory && matchesType && matchesRider && matchesMinPrice && matchesMaxPrice;
    });

    // Apply sorting if any
    this.applySort();
  }

  applySort() {
    if (!this.sortOption) return;

    const option = this.sortOption;
    this.filteredProducts.sort((a, b) => {
      const aPrice = Number(a.priceProduct ?? a.price ?? 0);
      const bPrice = Number(b.priceProduct ?? b.price ?? 0);
      const aStock = Number(a.stockProduct ?? 0);
      const bStock = Number(b.stockProduct ?? 0);

      switch (option) {
        case 'price_asc': return aPrice - bPrice;
        case 'price_desc': return bPrice - aPrice;
        case 'stock_asc': return aStock - bStock;
        case 'stock_desc': return bStock - aStock;
        default: return 0;
      }
    });
  }

  // helper to get first N sizes for UI
  getFirstSizes(product: any, limit = 3) {
    const sizes = product?.metadata?.size;
    if (!Array.isArray(sizes)) return [];
    return sizes.slice(0, limit);
  }

  // returns how many more sizes beyond limit
  getRemainingSizeCount(product: any, limit = 3) {
    const sizes = product?.metadata?.size;
    if (!Array.isArray(sizes)) return 0;
    return Math.max(0, sizes.length - limit);
  }

  hasSizes(product: any): boolean {
    return Array.isArray(product?.metadata?.size) && product.metadata.size.length > 0;
  }

  onDelete(id: string) {
    const result = confirm('Bạn có chắc muốn xóa danh mục này không?');
    if (result) {
      this.productService.delete(id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          // remove from both lists to keep consistent
          this.filteredProducts = this.filteredProducts.filter(c => c._id !== id);
          this.products = this.products.filter(c => c._id !== id);
        },
        error: (err) => {
          console.error('Lỗi khi xóa danh mục:', err);
          alert('Không thể xóa danh mục, vui lòng thử lại.');
        }
      });
    }
  }

  // expose type/rider name for template
  productTypeName(product: any) {
    return this.getProductTypeName(product);
  }

  productRiderName(product: any) {
    return this.getProductRiderName(product);
  }
}
