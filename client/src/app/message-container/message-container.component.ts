import { Component } from '@angular/core';

interface Message {
  author: string,
  content: string,
}

@Component({
  selector: 'app-message-container',
  templateUrl: './message-container.component.html',
  styleUrls: ['./message-container.component.scss']
})
export class MessageContainerComponent {
  messages: Message[] = [];

  constructor() { }
}
