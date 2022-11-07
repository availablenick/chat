import { Component } from '@angular/core';

@Component({
  selector: 'app-username-selector',
  templateUrl: './username-selector.component.html',
  styleUrls: ['./username-selector.component.scss']
})
export class UsernameSelectorComponent {
  username: string = '';

  constructor() { }

  onSubmit(event: Event): void {
    event.preventDefault();
  }
}
