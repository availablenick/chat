import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from "./user";

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private user: User | null = null;
  private httpOptions: Object = {
    withCredentials: true,
  };

  constructor(private http: HttpClient) { }

  requestData(): Observable<any> {
    return this.http.get("http://localhost:5000/api/v1/user-data", {
      ...this.httpOptions,
      observe: "response",
    });
  }

  getUser(): User | null {
    return this.user;
  }

  setUser(user: User | null): void {
    this.user = user;
  }

  hasUser(): boolean {
    return this.getUser() !== null;
  }

  clear(): Observable<any> {
    this.setUser(null);
    return this.http.post("http://localhost:5000/api/v1/logout", {}, this.httpOptions);
  }

  attemptLogin(username: string): Observable<any> {
    return this.http.post(
      "http://localhost:5000/api/v1/select-username",
      { username },
      this.httpOptions,
    );
  };
}
