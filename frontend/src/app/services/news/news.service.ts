import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  url = `/v1`;

constructor(private httpClient: HttpClient) { }

  getAll() {
    return this.httpClient.get(`${this.url}/news`);
  }

  delete(id: string) {
    return this.httpClient.delete(`${this.url}/news/${id}`);
  }

  addnews(body: any) {
    return this.httpClient.post(`${this.url}/news`, body);
  }

  getnewsDetail(_id: string) {
    return this.httpClient.get(`${this.url}/news/${_id}`);
  }

  updatenews(id: string, body: any) {
    return this.httpClient.put(`${this.url}/news/${id}`, body);
  }

}
