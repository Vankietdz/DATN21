import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Thêm withCredentials cho tất cả requests để gửi cookies
  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Nếu lỗi 401 (Unauthorized) hoặc 403 (Forbidden) → chuyển về login
      if (err.status === 401 || err.status === 403) {
        // Chỉ redirect nếu không phải đang ở trang login/register
        if (!req.url.includes('/login') && !req.url.includes('/register')) {
          localStorage.removeItem('user');
          location.assign('/login');
        }
        return throwError(() => err);
      }

      // Nếu lỗi khác → trả về
      return throwError(() => err);
    })
  );
};
