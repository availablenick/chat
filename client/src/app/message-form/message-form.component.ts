import { Component } from '@angular/core';

@Component({
  selector: 'app-message-form',
  templateUrl: './message-form.component.html',
  styleUrls: ['./message-form.component.scss']
})
export class MessageFormComponent {
  name: string = 'name0';

  constructor() { }

  onSubmit(event: Event): void {
    event.preventDefault();
  }
}
