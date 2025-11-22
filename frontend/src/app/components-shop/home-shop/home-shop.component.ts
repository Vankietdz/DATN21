import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-shop',
  standalone: true,
  templateUrl: './home-shop.component.html',
  styleUrls: ['./home-shop.component.css'],
  imports: [RouterModule, CommonModule, FormsModule]
})
export class HomeShopComponent implements OnInit {
  title = "trang sản phẩm";
  products!: Product[] ; // khởi tạo rỗng luôn

  constructor(private productService: ProductService) { }

  ngOnInit() {
  this.productService.getAll().subscribe(data=>{
    this.products = data as Product[];
    console.log(this.products)
  })
}

}
