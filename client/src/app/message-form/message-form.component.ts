import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-message-form',
  templateUrl: './message-form.component.html',
  styleUrls: ['./message-form.component.scss']
})
export class MessageFormComponent {

  constructor(private http: HttpClient) { }

  onSubmit(event: Event): void {
    event.preventDefault();
    const content = (<any>event.target).querySelector("textarea[name=content]").value;
    this.http
      .post("http://localhost:5000/api/v1/messages", { content }, { withCredentials: true })
      .subscribe(() => { });
  }
}
