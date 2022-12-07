import { Injectable } from "@angular/core";
import { CommunicationService } from "./communication.service";
import { SessionService } from "./session.service";
import { Message } from "../interfaces/message";
import { Room } from "../interfaces/room";

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private rooms: { [id: string]: Room } = {};

  constructor(
    private session: SessionService,
    private communicationHandler: CommunicationService,
  ) {
    communicationHandler.addListener("invite", (username: string, roomId: string) => {
      this.addRoom(roomId, username);
    });

    communicationHandler.addListener("private-message-sent", (message: Message, roomId: string) => {
      this.addMessageToRoom(message, roomId);
    });

    communicationHandler.addListener("user-left-room", (_: string, roomId: string) => {
      const message = {
        author: "",
        content: `${this.rooms[roomId].username} left`,
        type: "warning",
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
      this.communicationHandler.sendInvitation(username, (roomId: string | null) => {
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
      this.communicationHandler.sendUserLeftRoomNotification(this.session.getUser()!.username, roomId);
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
