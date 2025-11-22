export class Category {
  _id!: string;                // MongoDB ObjectId
  nameCategory!: string;       // Tên danh mục (khớp với backend)
  imageCategory!: string;      // URL ảnh danh mục
  createdAt?: string;          // timestamps (tự sinh bởi MongoDB)
  updatedAt?: string;          // timestamps (tự sinh bởi MongoDB)
}
