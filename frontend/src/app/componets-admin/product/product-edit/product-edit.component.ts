import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category/category.service';
import { TypeService } from '../../../services/type/type.service';
import { RiderService } from '../../../services/rider/rider.service';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {
  productForm!: FormGroup;
  categories: any[] = [];
  types: any[] = [];
  riders: any[] = [];
  productId!: string;
  hasSize: boolean = false;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: string[] = []; // Ảnh hiện tại từ server
  isLoading = false;

  // Size options for dropdown
  sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  // Flag to ignore the initial form valueChanges while loading product
  private formInitialized = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private typeService: TypeService,
    private riderService: RiderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';

    this.productForm = this.fb.group({
      nameProduct: ['', [Validators.required, Validators.minLength(4)]],
      priceProduct: [0, [Validators.required, Validators.min(10)]],
      discountProduct: [0, [Validators.required, Validators.min(0)]],
      stockProduct: [0, [Validators.required, Validators.min(0)]],
      descriptionProduct: ['', [Validators.required, Validators.minLength(10)]],
      categoryProduct: ['', [Validators.required]],
      typeProduct: [''],
      riderProduct: [''],
      hasSize: [false],
      sizes: this.fb.array([])
    });

    this.loadCategories();
    this.loadTypes();
    this.loadRiders();

    // Watch hasSize checkbox — ignore initial emissions while loading product;
    // only react to user interactions after formInitialized = true
    this.productForm.get('hasSize')?.valueChanges.subscribe(hasSize => {
      if (!this.formInitialized) return; // ignore changes caused by initial patchValue/load
      this.hasSize = hasSize;
      if (hasSize) {
        if (this.sizes.length === 0) {
          this.addSize();
        }
      } else {
        while (this.sizes.length > 0) {
          this.sizes.removeAt(0);
        }
      }
    });

    // Now load product (will patchValue hasSize but subscription above will ignore it)
    this.loadProduct();
  }

  createSizeGroup(data?: any): FormGroup {
    return this.fb.group({
      name: [data?.name || '', Validators.required],
      stock: [data?.stock || 0, [Validators.required, Validators.min(0)]]
    });
  }

  get sizes(): FormArray {
    return this.productForm.get('sizes') as FormArray;
  }

  addSize(): void {
    this.sizes.push(this.createSizeGroup());
  }

  removeSize(index: number): void {
    if (this.sizes.length > 1) {
      this.sizes.removeAt(index);
    }
  }

  // Compute total stock from sizes (used in template and submit)
  get totalStock(): number {
    try {
      return this.sizes.value.reduce((acc: number, s: any) => acc + Number(s.stock || 0), 0);
    } catch {
      return 0;
    }
  }

  onFileSelected(event: any, index: number): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Clear previous new files
      this.selectedFiles = [];
      const newPreviews: string[] = [];

      Array.from(files).forEach((file: any) => {
        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push(reader.result as string);
          this.imagePreviews = [...this.existingImages, ...newPreviews];
        };
        reader.readAsDataURL(file);
      });
    }
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res: any) => this.categories = Array.isArray(res) ? res : [],
      error: err => console.error('Lỗi khi tải danh mục:', err)
    });
  }

  loadTypes(): void {
    this.typeService.getAll().subscribe({
      next: (res: any) => this.types = Array.isArray(res) ? res : [],
      error: err => console.error('Lỗi khi tải loại:', err)
    });
  }

  loadRiders(): void {
    this.riderService.getAll().subscribe({
      next: (res: any) => this.riders = Array.isArray(res) ? res : [],
      error: err => console.error('Lỗi khi tải tay đua:', err)
    });
  }

  loadProduct(): void {
    this.isLoading = true;
    // mark form as not yet initialized to ignore valueChanges while patching
    this.formInitialized = false;

    this.productService.getProductDetail(this.productId).subscribe({
      next: (res: any) => {
        console.log('Product data:', res);

        const hasSizeInMetadata = res.metadata && res.metadata.size && Array.isArray(res.metadata.size) && res.metadata.size.length > 0;

        this.productForm.patchValue({
          nameProduct: res.nameProduct || '',
          priceProduct: res.priceProduct || 0,
          discountProduct: res.discountProduct || 0,
          stockProduct: res.stockProduct || 0,
          descriptionProduct: res.descriptionProduct || '',
          categoryProduct: res.categoryProduct?._id || res.categoryProduct || '',
          typeProduct: res.typeProduct?._id || res.typeProduct || '',
          riderProduct: res.riderProduct?._id || res.riderProduct || '',
          hasSize: hasSizeInMetadata
        });

        // Load existing images
        if (res.imagesProduct && Array.isArray(res.imagesProduct)) {
          this.existingImages = res.imagesProduct;
          this.imagePreviews = [...this.existingImages];
        }

        // Load sizes from metadata if exists
        // Only populate sizes when metadata has size entries
        if (hasSizeInMetadata) {
          // clear any existing just in case
          while (this.sizes.length > 0) {
            this.sizes.removeAt(0);
          }
          res.metadata.size.forEach((s: any) => {
            this.sizes.push(this.createSizeGroup(s));
          });
          this.hasSize = true;
        } else {
          // ensure sizes FormArray empty and hasSize false
          while (this.sizes.length > 0) {
            this.sizes.removeAt(0);
          }
          this.hasSize = false;
        }

        this.isLoading = false;
        // now allow valueChanges subscription to react to user interactions
        this.formInitialized = true;
      },
      error: err => {
        console.error('Lỗi khi tải sản phẩm:', err);
        alert('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
        this.isLoading = false;
        // still set formInitialized true to allow user changes
        this.formInitialized = true;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      alert('Dữ liệu không hợp lệ');
      return;
    }

    // Additional validation when hasSize = true
    if (this.hasSize) {
      if (this.sizes.length === 0) {
        alert('Vui lòng thêm ít nhất 1 size');
        return;
      }
      const invalidSize = this.sizes.controls.some(g => !g.get('name')?.value);
      if (invalidSize) {
        alert('Vui lòng chọn size cho tất cả các mục size');
        return;
      }
    }

    this.isLoading = true;
    this.productForm.disable();

    const formData = new FormData();
    const formValue = this.productForm.value;

    // Append basic fields
    formData.append('nameProduct', formValue.nameProduct);
    formData.append('priceProduct', formValue.priceProduct.toString());
    formData.append('discountProduct', formValue.discountProduct.toString());

    // If product has sizes, compute total stock from sizes; otherwise use the entered stockProduct
    let stockToAppend = formValue.stockProduct;
    if (this.hasSize && this.sizes.length > 0) {
      stockToAppend = this.totalStock;
    }
    formData.append('stockProduct', stockToAppend.toString());

    formData.append('descriptionProduct', formValue.descriptionProduct);
    formData.append('categoryProduct', formValue.categoryProduct);

    if (formValue.typeProduct) {
      formData.append('typeProduct', formValue.typeProduct);
    } else {
      formData.append('typeProduct', '');
    }

    // riderProduct is optional; only append if provided
    if (formValue.riderProduct) {
      formData.append('riderProduct', formValue.riderProduct);
    }

    // Append old images (keep existing images)
    formData.append('oldImagesProduct', JSON.stringify(this.existingImages));

    // Append new images if any
    this.selectedFiles.forEach((file) => {
      if (file) {
        formData.append('imagesProduct', file);
      }
    });

    // Prepare metadata - only include sizes if hasSize = true
    const metadata: any = {};
    if (this.hasSize && this.sizes.length > 0) {
      metadata.size = this.sizes.value;
    }
    formData.append('metadata', JSON.stringify(metadata));

    this.productService.updateProduct(this.productId, formData).subscribe({
      next: (res: any) => {
        console.log('Product updated successfully:', res);
        alert('Cập nhật sản phẩm thành công!');
        this.router.navigate(['/admin/product-list']);
        this.isLoading = false;
        this.productForm.enable();
      },
      error: err => {
        console.error('Lỗi khi cập nhật sản phẩm:', err);
        console.error('Error details:', err.error);
        const errorMessage = err?.error?.message || 'Không thể cập nhật sản phẩm, vui lòng thử lại.';
        alert(errorMessage);
        this.isLoading = false;
        this.productForm.enable();
      }
    });
  }
}
