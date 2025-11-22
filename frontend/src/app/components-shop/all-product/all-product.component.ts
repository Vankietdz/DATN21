import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-all-product',
  standalone:true,
  templateUrl: './all-product.component.html',
  styleUrls: ['./all-product.component.css'],
   imports: [RouterModule, CommonModule, FormsModule]
})
export class AllProductComponent implements OnInit {

 products: Product[] = []; // khởi tạo rỗng luôn

  constructor(private productService: ProductService, private route:ActivatedRoute) { }

  ngOnInit() {
  this.route.queryParams.subscribe(params =>{
    this.productService.getProductByQuery(params).subscribe(data => {
      this.products = data as Product[];
    })
  })

}

}
