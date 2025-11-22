import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category/category.service';
import { Category } from '../../models/category';

@Component({
  selector: 'app-header-shop',
  templateUrl: './header-shop.component.html',
  styleUrls: ['./header-shop.component.css'],
  imports: [RouterModule, CommonModule],
})
export class HeaderShopComponent implements OnInit {
  categories!: Category[];
  isADM:any
  isLogin:any

  constructor(private router: Router, private auth: AuthService, private categoryService:CategoryService) {
    this.isADM = auth.checkAdmin()
    this.isLogin =auth.checkLogin()
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(data =>{
      this.categories = data as Category[];
      console.log(this.categories)
    })
    }

  onLogout() {
    this.auth.logout().subscribe({
      next: () => {
        this.isLogin = false;
        this.isADM = false;
        this.router.navigate(['/store']);
      },
      error: (err) => {
        console.error("Logout error:", err);
        // Clear local data even if API call fails
        this.isLogin = false;
        this.isADM = false;
        localStorage.removeItem('user');
        this.router.navigate(['/store']);
      }
    });
  }
}
