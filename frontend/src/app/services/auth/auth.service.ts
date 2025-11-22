import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use absolute URL if proxy doesn't work, or relative URL if proxy is configured
  private baseUrl = 'http://localhost:8000'; // Backend URL
  url = `${this.baseUrl}/api/user`;
  private currentUser: any = null;

  constructor(private httpClient: HttpClient) {
    // Load user from localStorage on init
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

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

  login(body: { email: string; password: string }): Observable<any> {
    return this.httpClient.post(`${this.url}/login`, body, this.getHttpOptions());
  }

  register(body: { email: string; password: string; fullName: string }): Observable<any> {
    return this.httpClient.post(`${this.url}/register`, body, this.getHttpOptions());
  }

  logout(): Observable<any> {
    return this.httpClient.get(`${this.url}/logout`, this.getHttpOptions()).pipe(
      map(() => {
        this.currentUser = null;
        localStorage.removeItem('user');
        return true;
      })
    );
  }

  authUser(): Observable<any> {
    return this.httpClient.get(`${this.url}/auth`, this.getHttpOptions()).pipe(
      map((res: any) => {
        if (res && res.metadata) {
          this.currentUser = res.metadata;
          // Lưu cả hai key để tương thích các component cũ/new
          localStorage.setItem('user', JSON.stringify(res.metadata));
          localStorage.setItem('login', JSON.stringify(res.metadata));
          return res.metadata;
        }
        return null;
      }),
      catchError(() => {
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('login');
        return of(null);
      })
    );
  }

  checkAdmin() {
    if (this.currentUser) {
      return this.currentUser.isAdmin === true ? this.currentUser : false;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.isAdmin === true ? user : false;
    }
    return false;
  }

  checkLogin() {
    if (this.currentUser) {
      return this.currentUser;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      return this.currentUser;
    }
    return false;
  }

  isAdmin(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const user = this.checkLogin();
      if (user && user.isAdmin === true) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  // Refresh user data from server
  refreshUser(): Observable<any> {
    return this.authUser();
  }

  forgotPassword(email: string): Observable<any> {
    return this.httpClient.post(`${this.url}/forgot-password`, { email }, this.getHttpOptions());
  }

  verifyForgotPassword(otp: string, password: string): Observable<any> {
    return this.httpClient.post(`${this.url}/verify-forgot-password`, { otp, password }, this.getHttpOptions());
  }
}
