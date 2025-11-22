import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../services/category/category.service';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-category-edit',
  standalone: true,
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.css'],
  imports: [RouterModule, ReactiveFormsModule, CommonModule]
})
export class CategoryEditComponent implements OnInit {
  id!: string;
  category!: Category;
  categoryForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isLoading = false;

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.id = route.snapshot.params['id'];
    this.categoryForm = new FormGroup({
      nameCategory: new FormControl('', [Validators.required, Validators.minLength(6)]),
      imageCategory: new FormControl(null)
    });
  }

  ngOnInit() {
    this.loadCategory();
  }

  loadCategory() {
    this.isLoading = true;
    // Disable form while loading
    this.categoryForm.disable();

    this.categoryService.getCategoryDetail(this.id).subscribe({
      next: (data: any) => {
        if (data) {
          this.category = data;
          this.categoryForm.patchValue({
            nameCategory: this.category.nameCategory
          });
          this.imagePreview = this.category.imageCategory;
        } else {
          alert('Không tìm thấy danh mục!');
          this.router.navigate(['/admin/category-list']);
        }
        this.isLoading = false;
        // Re-enable form after loading
        this.categoryForm.enable();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh mục:', err);
        alert('Không thể tải thông tin danh mục. Vui lòng thử lại.');
        this.isLoading = false;
        this.categoryForm.enable();
        this.router.navigate(['/admin/category-list']);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.categoryForm.patchValue({ imageCategory: file });

      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      alert('Dữ liệu không hợp lệ');
      return;
    }

    this.isLoading = true;
    this.categoryForm.disable();

    const formData = new FormData();
    formData.append('nameCategory', this.categoryForm.value.nameCategory);

    // Only append image if a new file is selected
    if (this.selectedFile) {
      formData.append('imageCategory', this.selectedFile);
      console.log('Uploading file:', this.selectedFile.name, 'Size:', this.selectedFile.size);
    } else {
      console.log('No new file selected, keeping existing image');
    }

    this.categoryService.updateCategory(this.id, formData).subscribe({
      next: (res: any) => {
        console.log('Update response:', res);
        if (res && res.imageCategory) {
          console.log('New image URL:', res.imageCategory);
        }
        alert('Cập nhật danh mục thành công!');
        this.router.navigate(['/admin/category-list']);
        this.isLoading = false;
        this.categoryForm.enable();
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật danh mục:', err);
        console.error('Error details:', err.error);
        const errorMessage = err?.error?.message || 'Không thể cập nhật danh mục, vui lòng thử lại.';
        alert(errorMessage);
        this.isLoading = false;
        this.categoryForm.enable();
      }
    });
  }
}
