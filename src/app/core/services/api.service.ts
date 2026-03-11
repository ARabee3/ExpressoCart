import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroment';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  //private readonly baseUrl = environment.apiUrl;
  private readonly baseUrl = import.meta.env['NG_APP_API_URL'];
  // private readonly baseUrl = 'http://localhost:3000';

  get<T>(
    endpoint: string,
    params?:
      | HttpParams
      | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    headers?: HttpHeaders,
  ): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      params,
      headers,
      withCredentials: true,
    });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { withCredentials: true });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, { withCredentials: true });
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body, { withCredentials: true });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { withCredentials: true });
  }
}
