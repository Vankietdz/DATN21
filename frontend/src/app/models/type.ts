export class Type {
  _id!: string;                // MongoDB ObjectId
  nameType!: string;           // Tên loại (khớp với backend)
  imageType!: string;          // URL ảnh loại
  createdAt?: string;          // timestamps (tự sinh bởi MongoDB)
  updatedAt?: string;          // timestamps (tự sinh bởi MongoDB)
}
