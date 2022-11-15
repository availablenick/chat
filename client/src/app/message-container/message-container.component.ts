import { Component, OnInit } from '@angular/core';
import { EventService } from "../event.service";
import { Message } from "../message";

@Component({
  selector: 'app-message-container',
  templateUrl: './message-container.component.html',
  styleUrls: ['./message-container.component.scss']
})
export class MessageContainerComponent implements OnInit {
  messages: Message[] = [];

  constructor(private eventHandler: EventService) { }

  ngOnInit(): void {
    this.eventHandler.addListener("message-sent", (message: Message) => {
      this.messages.push(message);
    });
  }
}
