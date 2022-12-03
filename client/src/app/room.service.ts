import { Injectable } from "@angular/core";
import { EventService } from "./event.service";
import { SessionService } from "./session.service";
import { Message } from "./message";
import { Room } from "./room";

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private rooms: { [id: string]: Room } = {};

  constructor(
    private session: SessionService,
    private eventHandler: EventService,
  ) {
    eventHandler.addListener("invite", (username: string, roomId: string) => {
      this.addRoom(roomId, username);
    });

    eventHandler.addListener("private-message-sent", (message: Message, roomId: string) => {
      this.addMessageToRoom(message, roomId);
    });

    eventHandler.addListener("user-left-room", (_: string, roomId: string) => {
      const message = {
        author: this.rooms[roomId].username,
        content: `${this.rooms[roomId].username} left`,
        type: "text",
      };

      this.addMessageToRoom(message, roomId);
      this.inactivateRoom(roomId);
    });

    const storageRooms = localStorage.getItem("rooms");
    if (storageRooms) {
      this.rooms = JSON.parse(storageRooms);
    }
  }

  getRoom(id: string): Room {
    return this.rooms[id];
  }

  getRooms(): Room[] {
    return Object.values(this.rooms);
  }

  inviteUser(username: string): void {
    if (!this.session.hasUser()) {
      return;
    }

    const userIsInvitingThemself = username === this.session.getUser()!.username;
    if (!userIsInvitingThemself) {
      this.eventHandler.sendInviteEvent(username, (roomId: string | null) => {
        if (roomId !== null) {
          this.addRoom(roomId, username);
        }
      });
    }
  }

  leaveRoom(roomId: string): void {
    if (!this.session.hasUser()) {
      return;
    }

    if (this.rooms[roomId].isActive) {
      this.eventHandler.sendUserLeftRoomEvent(this.session.getUser()!.username, roomId);
    }

    delete this.rooms[roomId];
  }

  private addRoom(id: string, username: string): void {
    this.rooms[id] = {
      id,
      username,
      isActive: true,
      messages: [],
    };
  }

  private inactivateRoom(id: string): void {
    this.rooms[id].isActive = false;
  }

  private addMessageToRoom(message: Message, roomId: string): void {
    this.rooms[roomId].messages = [...this.rooms[roomId].messages, message];
  }
}
