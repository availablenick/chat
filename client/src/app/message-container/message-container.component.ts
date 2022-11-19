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
  messages: Message[] = [];

  constructor(private eventHandler: EventService) { }

  ngOnInit(): void {
    this.eventHandler.addListener("message-sent", (message: Message) => {
      switch (message.type) {
        case "text":
          this.messages.push({
            author: message.author,
            content: `${message.author}: ${message.content}`,
            type: message.type,
          });
          break;
        case "image":
          this.messages.push({
            author: message.author,
            content: message.content,
            type: message.type,
          });
      }
    });

    this.eventHandler.addListener("user-joined", (user: User) => {
      this.messages.push({
        author: user.name,
        content: `${user.name} joined the chat`,
        type: "text",
      });
    });

    this.eventHandler.addListener("user-left", (user: User) => {
      this.messages.push({
        author: user.name,
        content: `${user.name} left the chat`,
        type: "text",
      });
    });
  }
}
