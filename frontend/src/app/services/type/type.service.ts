import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TypeService {
  // Use absolute URL like CategoryService
  private baseUrl = 'http://localhost:8000';
  url = `${this.baseUrl}/api/type`;

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
  // Note: Don't set Content-Type header for FormData - browser will set it automatically with boundary
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

  delete(id: string) {
    return this.httpClient.delete(`${this.url}/delete/${id}`, this.getHttpOptions()).pipe(
      map((res: any) => res?.metadata || res)
    );
  }

  addType(formData: FormData) {
    return this.httpClient.post(`${this.url}/create`, formData, this.getHttpOptionsForFileUpload()).pipe(
      map((res: any) => res?.metadata || res)
    );
  }

  // Backend doesn't have a route to get single type by ID
  // Use getAll and filter, or add route to backend
  getTypeDetail(_id: string) {
    return this.getAll().pipe(
      map((types: any[]) => types.find(t => t._id === _id) || null)
    );
  }

  updateType(id: string, formData: FormData) {
    return this.httpClient.put(`${this.url}/update/${id}`, formData, this.getHttpOptionsForFileUpload()).pipe(
      map((res: any) => res?.metadata || res)
    );
  }
}
