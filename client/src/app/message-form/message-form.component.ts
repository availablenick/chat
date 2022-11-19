import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-message-form',
  templateUrl: './message-form.component.html',
  styleUrls: ['./message-form.component.scss']
})
export class MessageFormComponent {

  constructor(private http: HttpClient) { }

  textFormOnSubmit(event: Event): void {
    event.preventDefault();
    const input = (<any>event.target).querySelector("input[name=content]");
    const content = input.value;
    input.value = "";
    this.http
      .post("http://localhost:5000/api/v1/messages", { content, type: "0" }, { withCredentials: true })
      .subscribe(() => { });
  }

  imageFormOnSubmit(event: Event): void {
    event.preventDefault();
    const input = (<any>event.target).querySelector("input[type=file]");
    const formData: FormData = new FormData();
    formData.append("content", input.files[0]);
    formData.append("type", "1");
    input.value = "";
    this.http
      .post("http://localhost:5000/api/v1/messages", formData, { withCredentials: true })
      .subscribe(() => { });
  }
}
