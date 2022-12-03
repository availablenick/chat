import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Room } from "../room";
import { MessageService } from "../message.service";
import { Message } from "../message";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {
  @Input() room!: Room;
  @Output() hideRoomEvent = new EventEmitter();

  styles: any = {
    message: {
      padding: "0 0.5rem",
      marginTop: "0.25rem",
    },
    media: {
      marginLeft: "0.25rem",
      width: "15rem",
    },
  };

  constructor(private messageHandler: MessageService) { }

  hideRoom(): void {
    this.hideRoomEvent.emit();
  }

  textFormOnSubmit(event: Event): void {
    event.preventDefault();
    const input = (<any>event.target).querySelector("input[name=content]");
    const content = input.value;
    input.value = "";
    if (content !== "") {
      const data = {
        content,
        type: "text",
        room: this.room.id,
      };

      this.messageHandler.sendPrivateMessage(data).subscribe();
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
    formData.append("room", this.room.id);
    if (input.files[0].type.startsWith("image/")) {
      formData.append("type", "image");
    } else if (input.files[0].type.startsWith("video/")) {
      formData.append("type", "video");
    } else {
      return;
    }

    input.value = "";
    this.messageHandler.sendPrivateMessage(formData).subscribe();
  }
}