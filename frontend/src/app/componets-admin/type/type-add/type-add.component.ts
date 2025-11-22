import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TypeService } from '../../../services/type/type.service';

@Component({
  selector: 'app-type-add',
  standalone: true,
  templateUrl: './type-add.component.html',
  styleUrls: ['./type-add.component.css'],
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
})
export class TypeAddComponent implements OnInit {
  typeForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isLoading = false;

  constructor(
    private typeService: TypeService,
    private router: Router
  ) {
    this.typeForm = new FormGroup({
      nameType: new FormControl('', [Validators.required, Validators.minLength(6)]),
      imageType: new FormControl(null, Validators.required)
    });
  }

  ngOnInit() {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.typeForm.patchValue({ imageType: file });

      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.typeForm.invalid) {
      alert('Dữ liệu không hợp lệ');
      return;
    }

    this.isLoading = true;
    this.typeForm.disable();

    const formData = new FormData();
    formData.append('nameType', this.typeForm.value.nameType);
    if (this.selectedFile) {
      formData.append('imageType', this.selectedFile);
    }

    this.typeService.addType(formData).subscribe({
      next: (res: any) => {
        console.log('Type created successfully:', res);
        if (res && res.imageType) {
          console.log('Image URL from server:', res.imageType);
        }
        alert('Thêm loại thành công!');
        this.router.navigate(['/admin/type-list']);
        this.isLoading = false;
        this.typeForm.enable();
      },
      error: (err) => {
        console.error('Lỗi khi thêm loại:', err);
        console.error('Error details:', err.error);
        const errorMessage = err?.error?.message || 'Không thể thêm loại, vui lòng thử lại.';
        alert(errorMessage);
        this.isLoading = false;
        this.typeForm.enable();
      },
    });
  }
}
