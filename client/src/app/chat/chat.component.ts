import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { EventService } from "../event.service";
import { MessageService } from "../message.service";
import { SessionService } from "../session.service";
import { Message } from "../message";
import { Room } from "../room";
import { User } from "../user";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  roomIsVisible: boolean = false;
  selectedRoom: Room | null = null;
  messages: Message[] = [];
  styles: any = {
    message: {
      padding: "0.1rem 0.25rem",
    },
    media: {
      marginLeft: "0.25rem",
      width: "18rem",
    },
  };

  constructor(
    private router: Router,
    private eventHandler: EventService,
    private messageHandler: MessageService,
    private session: SessionService,
  ) { }

  ngOnInit(): void {
    if (this.session.hasUser()) {
      this.isLoading = false;
      this.eventHandler.connect();
      this.eventHandler.sendUserJoinedEvent(this.session.getUser()!.username);
    } else {
      this.session.requestData().subscribe({
        next: (response: any) => {
          this.session.setUser({ username: response.body.user.username });
          this.eventHandler.connect();
          this.eventHandler.sendUserJoinedEvent(response.body.user.username);
          this.isLoading = false;
          this.setUpListeners();
        },
        error: () => {
          this.router.navigate(["/enter"]);
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.eventHandler.removeListeners();
  }

  showRoom(room: Room): void {
    this.roomIsVisible = true;
    this.selectedRoom = room;
  }

  hideRoom(): void {
    this.roomIsVisible = false;
    this.selectedRoom = null;
  }

  textFormOnSubmit(event: Event): void {
    event.preventDefault();
    const input = (<any>event.target).querySelector("input[name=content]");
    const content = input.value;
    input.value = "";
    if (content !== "") {
      this.messageHandler.sendMessage({ content, type: "0" }).subscribe();
    }
  }

  mediaFormOnSubmit(event: Event): void {
    event.preventDefault();
    const input = (<any>event.target).querySelector("input[type=file]");
    if (input.files.length === 0) {
      return;
    }

    const formData: FormData = new FormData();
    formData.append("content", input.files[0]);
    if (input.files[0].type.startsWith("image/")) {
      formData.append("type", "1");
    } else if (input.files[0].type.startsWith("video/")) {
      formData.append("type", "2");
    } else {
      return;
    }

    input.value = "";
    this.messageHandler.sendMessage(formData).subscribe();
  }

  private setUpListeners(): void {
    this.eventHandler.addListener("message-sent", (message: Message) => {
      this.messages = [...this.messages, message];
    });

    this.eventHandler.addListener("user-joined", (username: string) => {
      this.messages = [...this.messages, {
        author: username,
        content: `${username} joined the chat`,
        type: "text",
      }];
    });

    this.eventHandler.addListener("user-left", (username: string) => {
      this.messages = [...this.messages, {
        author: username,
        content: `${username} left the chat`,
        type: "text",
      }];
    });
  }
}
