import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TypeService } from '../../../services/type/type.service';
import { Type } from '../../../models/type';

@Component({
  selector: 'app-type-edit',
  standalone: true,
  templateUrl: './type-edit.component.html',
  styleUrls: ['./type-edit.component.css'],
  imports: [RouterModule, ReactiveFormsModule, CommonModule]
})
export class TypeEditComponent implements OnInit {
  id!: string;
  type!: Type;
  typeForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isLoading = false;

  constructor(
    private typeService: TypeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.id = route.snapshot.params['id'];
    this.typeForm = new FormGroup({
      nameType: new FormControl('', [Validators.required, Validators.minLength(6)]),
      imageType: new FormControl(null)
    });
  }

  ngOnInit() {
    this.loadType();
  }

  loadType() {
    this.isLoading = true;
    // Disable form while loading
    this.typeForm.disable();

    this.typeService.getTypeDetail(this.id).subscribe({
      next: (data: any) => {
        if (data) {
          this.type = data;
          this.typeForm.patchValue({
            nameType: this.type.nameType
          });
          this.imagePreview = this.type.imageType;
        } else {
          alert('Không tìm thấy loại!');
          this.router.navigate(['/admin/type-list']);
        }
        this.isLoading = false;
        // Re-enable form after loading
        this.typeForm.enable();
      },
      error: (err) => {
        console.error('Lỗi khi tải loại:', err);
        alert('Không thể tải thông tin loại. Vui lòng thử lại.');
        this.isLoading = false;
        this.typeForm.enable();
        this.router.navigate(['/admin/type-list']);
      }
    });
  }

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

    // Only append image if a new file is selected
    if (this.selectedFile) {
      formData.append('imageType', this.selectedFile);
      console.log('Uploading file:', this.selectedFile.name, 'Size:', this.selectedFile.size);
    } else {
      console.log('No new file selected, keeping existing image');
    }

    this.typeService.updateType(this.id, formData).subscribe({
      next: (res: any) => {
        console.log('Update response:', res);
        if (res && res.imageType) {
          console.log('New image URL:', res.imageType);
        }
        alert('Cập nhật loại thành công!');
        this.router.navigate(['/admin/type-list']);
        this.isLoading = false;
        this.typeForm.enable();
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật loại:', err);
        console.error('Error details:', err.error);
        const errorMessage = err?.error?.message || 'Không thể cập nhật loại, vui lòng thử lại.';
        alert(errorMessage);
        this.isLoading = false;
        this.typeForm.enable();
      }
    });
  }
}
