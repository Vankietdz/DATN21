export class Product {
  _id!: string;               // MongoDB ObjectId
  nameProduct!: string;       // Tên sản phẩm
  categoryProduct!: any;      // có thể là Object { _id, nameCategory } hoặc string id
  price!: number;             // Giá (fallback)
  descriptionProduct!: string;// Mô tả
  imagesProduct!: string[];
  priceProduct!: number;
  discountProduct!: number;
  stockProduct!: number;
  typeProduct!: any;          // có thể là Object { _id, nameType } hoặc string id
  riderProduct!: any;         // có thể là Object { _id, nameRider } hoặc string id
  metadata!: any;
}
