import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8000';
  url = `${this.baseUrl}/api/product`;

  constructor(private httpClient: HttpClient) { }

  // Get HTTP options with credentials for cookie-based auth
  private getHttpOptions() {
    return {
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      observe: 'body' as const,
      responseType: 'json' as const
    };
  }

  // Get HTTP options for file upload
  private getHttpOptionsForFileUpload() {
    return {
      withCredentials: true,
      observe: 'body' as const,
      responseType: 'json' as const
      // Don't set Content-Type header - let browser set it with multipart/form-data boundary
    };
  }

  getAll() {
    return this.httpClient.get(`${this.url}/list`, this.getHttpOptions()).pipe(
      map((res: any) => res?.metadata || res || [])
    );
  }

  addProduct(formData: FormData) {
    return this.httpClient.post(`${this.url}/create`, formData, this.getHttpOptionsForFileUpload()).pipe(
      map((res: any) => res?.metadata || res)
    );
  }

  delete(id: string) {
    return this.httpClient.delete(`${this.url}/delete/${id}`, this.getHttpOptions()).pipe(
      map((res: any) => res?.metadata || res)
    );
  }

  // Fixed: use the correct backend route for product detail (/detail/:id)
  getProductDetail(id: string) {
    return this.httpClient.get(`${this.url}/detail/${id}`, this.getHttpOptions()).pipe(
      map((res: any) => res?.metadata || res)
    );
  }

  updateProduct(id: string, formData: FormData) {
    return this.httpClient.put(`${this.url}/update/${id}`, formData, this.getHttpOptionsForFileUpload()).pipe(
      map((res: any) => res?.metadata || res)
    );
  }

  getProductByQuery(params: any) {
    let query = '';
    if (params.category) {
      query = `category=${params.category}`;
    }
    return this.httpClient.get(`${this.url}/list?${query}`, this.getHttpOptions()).pipe(
      map((res: any) => res?.metadata || res || [])
    );
  }
}
