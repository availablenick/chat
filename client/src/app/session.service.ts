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

  getUser(): User | null {
    if (this.user === null) {
      const username = localStorage.getItem("username");
      if (username !== null) {
        return { name: username };
      }
    }

    return null;
  }

  hasUser(): boolean {
    return localStorage.getItem("username") !== null;
  }

  clear(): void {
    localStorage.removeItem("username");
  }

  attemptLogin(username: string): Observable<any> {
    return this.http.post(
      "http://localhost:5000/api/v1/select-username",
      { username },
      this.httpOptions,
    );
  };

  attemptLogout(): Observable<any> {
    return this.http.post("http://localhost:5000/api/v1/logout", {}, this.httpOptions);
  }
}
