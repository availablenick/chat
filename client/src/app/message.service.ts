import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private httpOptions = {
    withCredentials: true,
  };

  constructor(private http: HttpClient) { }

  sendMessage(data: object): Observable<any> {
    return this.http.post("http://localhost:5000/api/v1/messages", data, this.httpOptions);
  }
}
