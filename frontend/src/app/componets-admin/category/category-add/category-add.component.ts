import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CategoryService } from '../../../services/category/category.service';

@Component({
  selector: 'app-category-add',
  standalone: true,
  templateUrl: './category-add.component.html',
  styleUrls: ['./category-add.component.css'],
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
})
export class CategoryAddComponent implements OnInit {
  categoryForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.categoryForm = new FormGroup({
      nameCategory: new FormControl('', [Validators.required, Validators.minLength(6)]),
      imageCategory: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.categoryForm.patchValue({ imageCategory: file });
      this.categoryForm.get('imageCategory')?.updateValueAndValidity();

      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.categoryForm.invalid || !this.selectedFile) {
      alert('Vui lòng điền đầy đủ thông tin và chọn ảnh');
      return;
    }

    const formData = new FormData();
    formData.append('nameCategory', this.categoryForm.value.nameCategory);
    formData.append('imageCategory', this.selectedFile);

    console.log('Uploading category:', {
      nameCategory: this.categoryForm.value.nameCategory,
      file: this.selectedFile.name,
      fileSize: this.selectedFile.size
    });

    this.categoryService.addCategory(formData).subscribe({
      next: (res: any) => {
        console.log('Category created successfully:', res);
        if (res && res.imageCategory) {
          console.log('Image URL from server:', res.imageCategory);
        }
        alert('Thêm danh mục thành công!');
        this.router.navigate(['/admin/category-list']);
      },
      error: (err) => {
        console.error('Lỗi khi thêm danh mục:', err);
        console.error('Error details:', err.error);
        const errorMessage = err?.error?.message || 'Không thể thêm danh mục, vui lòng thử lại.';
        alert(errorMessage);
      },
    });
  }
}
