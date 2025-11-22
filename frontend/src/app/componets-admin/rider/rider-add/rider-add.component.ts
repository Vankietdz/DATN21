import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RiderService } from '../../../services/rider/rider.service';

@Component({
  selector: 'app-rider-add',
  standalone: true,
  templateUrl: './rider-add.component.html',
  styleUrls: ['./rider-add.component.css'],
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
})
export class RiderAddComponent implements OnInit {
  riderForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isLoading = false;

  constructor(
    private riderService: RiderService,
    private router: Router
  ) {
    this.riderForm = new FormGroup({
      nameRider: new FormControl('', [Validators.required, Validators.minLength(6)]),
      imageRider: new FormControl(null, Validators.required)
    });
  }

  ngOnInit() {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.riderForm.patchValue({ imageRider: file });

      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.riderForm.invalid) {
      alert('Dữ liệu không hợp lệ');
      return;
    }

    this.isLoading = true;
    this.riderForm.disable();

    const formData = new FormData();
    formData.append('nameRider', this.riderForm.value.nameRider);
    if (this.selectedFile) {
      formData.append('imageRider', this.selectedFile);
    }

    this.riderService.addRider(formData).subscribe({
      next: (res: any) => {
        console.log('Rider created successfully:', res);
        if (res && res.imageRider) {
          console.log('Image URL from server:', res.imageRider);
        }
        alert('Thêm tay đua thành công!');
        this.router.navigate(['/admin/rider-list']);
        this.isLoading = false;
        this.riderForm.enable();
      },
      error: (err) => {
        console.error('Lỗi khi thêm tay đua:', err);
        console.error('Error details:', err.error);
        const errorMessage = err?.error?.message || 'Không thể thêm tay đua, vui lòng thử lại.';
        alert(errorMessage);
        this.isLoading = false;
        this.riderForm.enable();
      },
    });
  }
}

