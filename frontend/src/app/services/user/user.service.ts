import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 url = `/v1`;
  constructor(private httpClient: HttpClient) { }
 getAll() {
  return this.httpClient.get(`${this.url}/user/get`);
}
  delete(id: string) {
    return this.httpClient.delete(`${this.url}/user/delete/${id}`);
  }


}
