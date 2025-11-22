import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category/category.service';
import { TypeService } from '../../../services/type/type.service';
import { RiderService } from '../../../services/rider/rider.service';

@Component({
  selector: 'app-product-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.css']
})
export class ProductAddComponent implements OnInit {
  productForm!: FormGroup;
  categories: any[] = [];
  types: any[] = [];
  riders: any[] = [];
  hasSize: boolean = false; // Checkbox để bật/tắt size
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isLoading = false;

  // Size options for dropdown
  sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private typeService: TypeService,
    private riderService: RiderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      nameProduct: ['', [Validators.required, Validators.minLength(4)]],
      priceProduct: [0, [Validators.required, Validators.min(10)]],
      discountProduct: [0, [Validators.required, Validators.min(0)]],
      stockProduct: [0, [Validators.required, Validators.min(0)]],
      descriptionProduct: ['', [Validators.required, Validators.minLength(10)]],
      categoryProduct: ['', [Validators.required]],
      typeProduct: [''],
      riderProduct: [''], // optional
      hasSize: [false], // Checkbox
      sizes: this.fb.array([]) // FormArray - chỉ dùng khi hasSize = true
    });

    this.loadCategories();
    this.loadTypes();
    this.loadRiders();

    // Watch hasSize checkbox
    this.productForm.get('hasSize')?.valueChanges.subscribe(hasSize => {
      this.hasSize = hasSize;
      if (hasSize) {
        // Nếu bật size, thêm ít nhất 1 size
        if (this.sizes.length === 0) {
          this.addSize();
        }
      } else {
        // Nếu tắt size, xóa tất cả sizes
        while (this.sizes.length > 0) {
          this.sizes.removeAt(0);
        }
      }
    });
  }

  createSizeGroup(): FormGroup {
    // keep control name 'name' so metadata structure remains { name, stock }
    return this.fb.group({
      name: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]]
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

  // Compute total stock from sizes (used in template)
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
      // Clear previous files
      this.selectedFiles = [];
      this.imagePreviews = [];

      // Process all selected files
      Array.from(files).forEach((file: any, i: number) => {
        this.selectedFiles.push(file);

        // Preview image
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string);
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

  onSubmit() {
    if (this.productForm.invalid) {
      alert('Dữ liệu không hợp lệ');
      return;
    }

    if (this.selectedFiles.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh sản phẩm');
      return;
    }

    // Additional validation when hasSize = true
    if (this.hasSize) {
      if (this.sizes.length === 0) {
        alert('Vui lòng thêm ít nhất 1 size');
        return;
      }
      // ensure each size has a selected name
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

    // If hasSize, compute total stock from sizes; otherwise use entered stockProduct
    let stockToAppend = formValue.stockProduct;
    if (this.hasSize && this.sizes.length > 0) {
      stockToAppend = this.totalStock;
    }
    formData.append('stockProduct', stockToAppend.toString());

    formData.append('descriptionProduct', formValue.descriptionProduct);
    formData.append('categoryProduct', formValue.categoryProduct);

    if (formValue.typeProduct) {
      formData.append('typeProduct', formValue.typeProduct);
    }

    // riderProduct is optional; only append if provided
    if (formValue.riderProduct) {
      formData.append('riderProduct', formValue.riderProduct);
    }

    // Append images
    this.selectedFiles.forEach((file, index) => {
      if (file) {
        formData.append('imagesProduct', file);
      }
    });

    // Prepare metadata - chỉ thêm size nếu hasSize = true
    const metadata: any = {};
    if (this.hasSize && this.sizes.length > 0) {
      metadata.size = this.sizes.value; // each item has { name, stock }
    }
    formData.append('metadata', JSON.stringify(metadata));

    this.productService.addProduct(formData).subscribe({
      next: (res: any) => {
        console.log('Product created successfully:', res);
        alert('Thêm sản phẩm thành công!');
        this.router.navigate(['/admin/product-list']);
        this.isLoading = false;
        this.productForm.enable();
      },
      error: (err) => {
        console.error('Lỗi khi thêm sản phẩm:', err);
        console.error('Error details:', err.error);
        const errorMessage = err?.error?.message || 'Không thể thêm sản phẩm, vui lòng thử lại.';
        alert(errorMessage);
        this.isLoading = false;
        this.productForm.enable();
      },
    });
  }
}
