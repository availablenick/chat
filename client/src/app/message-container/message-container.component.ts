import { Component, OnInit } from '@angular/core';
import { EventService } from "../event.service";
import { Message } from "../message";
import { User } from "../user";

@Component({
  selector: 'app-message-container',
  templateUrl: './message-container.component.html',
  styleUrls: ['./message-container.component.scss']
})
export class MessageContainerComponent implements OnInit {
  messages: string[] = [];

  constructor(private eventHandler: EventService) { }

  ngOnInit(): void {
    this.eventHandler.addListener("message-sent", (message: Message) => {
      this.messages.push(`${message.author}: ${message.content}`);
    });

    this.eventHandler.addListener("user-joined", (user: User) => {
      this.messages.push(`${user.name} joined the chat`);
    });

    this.eventHandler.addListener("user-left", (user: User) => {
      this.messages.push(`${user.name} left the chat`);
    });
  }
}
