export interface User {
  _id: string;          // MongoDB ObjectId
  fullName: string;     // tên đầy đủ
  email: string;        // email unique
  password?: string;    // optional vì không được trả về khi GET
  isAdmin: boolean;     // quyền admin
  createdAt?: string;   // timestamps (tự sinh bởi MongoDB)
  updatedAt?: string;   // timestamps (tự sinh bởi MongoDB)
}
