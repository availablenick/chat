import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { CommunicationService } from "../communication.service";
import { SessionService } from "../session.service";
import { Message } from "../message";
import { Room } from "../room";

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
  usernames: string[] = [];
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
    private communicationHandler: CommunicationService,
    private session: SessionService,
  ) { }

  ngOnInit(): void {
    if (this.session.hasUser()) {
      this.isLoading = false;
      this.communicationHandler.connect();
      this.communicationHandler.sendUserJoinedNotification(
        this.session.getUser()!.username,
        (usernames: string[]) => {
          this.usernames = usernames;
        }
      );

      this.setUpListeners();
    } else {
      this.session.requestData().subscribe({
        next: (response: any) => {
          this.session.setUser({ username: response.body.user.username });
          this.communicationHandler.connect();
          this.communicationHandler.sendUserJoinedNotification(
            response.body.user.username,
            (usernames: string[]) => {
              this.usernames = usernames;
            }
          );

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
    this.communicationHandler.removeListeners();
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
      this.communicationHandler.sendMessage({ content, type: "text" }).subscribe();
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
      formData.append("type", "image");
    } else if (input.files[0].type.startsWith("video/")) {
      formData.append("type", "video");
    } else {
      return;
    }

    input.value = "";
    this.communicationHandler.sendMessage(formData).subscribe();
  }

  private setUpListeners(): void {
    this.communicationHandler.addListener("message-sent", (message: Message) => {
      this.messages = [...this.messages, message];
    });

    this.communicationHandler.addListener("user-joined", (username: string) => {
      this.messages = [...this.messages, {
        author: "",
        content: `${username} joined the chat`,
        type: "warning",
      }];
    });

    this.communicationHandler.addListener("user-left", (username: string) => {
      this.messages = [...this.messages, {
        author: "",
        content: `${username} left the chat`,
        type: "warning",
      }];
    });
  }
}
