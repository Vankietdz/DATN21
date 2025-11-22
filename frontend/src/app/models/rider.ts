export class Rider {
  _id!: string;                // MongoDB ObjectId
  nameRider!: string;          // Tên tay đua (khớp với backend)
  imageRider!: string;          // URL ảnh tay đua
  createdAt?: string;           // timestamps (tự sinh bởi MongoDB)
  updatedAt?: string;           // timestamps (tự sinh bởi MongoDB)
}

