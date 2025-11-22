import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { HomeShopComponent } from './components-shop/home-shop/home-shop.component';
import { AllProductComponent } from './components-shop/all-product/all-product.component';
import { LoginComponent } from './components-shop/login/login.component';
import { RegisterComponent } from './components-shop/register/register.component';
import { ForgotPasswordComponent } from './components-shop/forgot-password/forgot-password';
import { CartComponent } from './components-shop/cart/cart.component';
import { PaymentComponent } from './components-shop/payment/payment.component';
import { ProductDetailComponent } from './components-shop/product-detail/product-detail.component';
import { CategoryEditComponent } from './componets-admin/category/category-edit/category-edit.component';
import { CategoryAddComponent } from './componets-admin/category/category-add/category-add.component';
import { CategoryListComponent } from './componets-admin/category/category-list/category-list.component';
import { DashboardComponent } from './componets-admin/dashboard/dashboard.component';
import { TypeListComponent } from './componets-admin/type/type-list/type-list.component';
import { TypeAddComponent } from './componets-admin/type/type-add/type-add.component';
import { TypeEditComponent } from './componets-admin/type/type-edit/type-edit.component';
import { RiderListComponent } from './componets-admin/rider/rider-list/rider-list.component';
import { RiderAddComponent } from './componets-admin/rider/rider-add/rider-add.component';
import { RiderEditComponent } from './componets-admin/rider/rider-edit/rider-edit.component';
import { ProductEditComponent } from './componets-admin/product/product-edit/product-edit.component';
import { ProductAddComponent } from './componets-admin/product/product-add/product-add.component';
import { ProductListComponent } from './componets-admin/product/product-list/product-list.component';
import { UserListComponent } from './componets-admin/user-list/user-list.component';
import { AdminGuard } from './services/auth/admin-guard';
import { AuthGuard } from './services/auth/auth-guard';

import { VoucherListComponent } from './componets-admin/voucher/voucher-list/voucher-list.component';
import { VoucherAddComponent } from './componets-admin/voucher/voucher-add/voucher-add.component';
import { VoucherEditComponent } from './componets-admin/voucher/voucher-edit/voucher-edit.component';
import { NewsAddComponent } from './componets-admin/news/news-add/news-add.component';
import { NewsListComponent } from './componets-admin/news/news-list/news-list.component';
import { NewsEditComponent } from './componets-admin/news/news-edit/news-edit.component';
import { OrderSuccessComponent } from './components-shop/order-success/order-success.component';

export const routes: Routes = [
  { path: 'news', component: HomeComponent },
  { path: 'store', component: HomeShopComponent },
  { path: 'allproduct', component: AllProductComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'cart',
    loadComponent: () =>
      import('./components-shop/cart/cart.component').then((m) => m.CartComponent),
  },
  { path: 'payment', component: PaymentComponent,  },
  { path: 'order-success', component: OrderSuccessComponent,  },
  { path: 'product-detail/:id', component: ProductDetailComponent },

  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [AdminGuard],
    children: [
      // danh mục
      { path: 'category-list', component: CategoryListComponent },
      { path: 'category-add', component: CategoryAddComponent },
      { path: 'category-edit/:id', component: CategoryEditComponent },
      //loại
      { path: 'type-list', component: TypeListComponent },
      { path: 'type-add', component: TypeAddComponent },
      { path: 'type-edit/:id', component: TypeEditComponent },
      //tay đua
      { path: 'rider-list', component: RiderListComponent },
      { path: 'rider-add', component: RiderAddComponent },
      { path: 'rider-edit/:id', component: RiderEditComponent },
      //sản phẩm
      { path: 'product-list', component: ProductListComponent },
      { path: 'product-add', component: ProductAddComponent },
      { path: 'product-edit/:id', component: ProductEditComponent },
      // user
      { path: 'user-list', component: UserListComponent },
      //order

      //voucher
      { path: 'voucher-list', component: VoucherListComponent },
      { path: 'voucher-add', component: VoucherAddComponent },
      { path: 'voucher-edit', component: VoucherEditComponent },
      //news
      { path: 'news-add', component: NewsAddComponent },
      { path: 'news-list', component: NewsListComponent },
      { path: 'news-edit', component: NewsEditComponent },
    ],
  },

  { path: '', redirectTo: '/store', pathMatch: 'full' },
  { path: '**', redirectTo: '/store' },
];
