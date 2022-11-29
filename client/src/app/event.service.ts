import { Injectable } from '@angular/core';
import { io, Socket } from "socket.io-client";
import { Message } from "./message";
import { User } from "./user";

interface ListenersByEvent {
  [event: string]: Function[],
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private socket: Socket;
  private listeners: ListenersByEvent = {
    "invite": [],
    "message-sent": [],
    "private-message-sent": [],
    "user-joined": [],
    "user-left": [],
    "user-left-room": [],
  };

  constructor() {
    this.socket = io("http://localhost:3000/main");
    this.setUpListeners();
  }

  connect(): void {
    if (this.socket.disconnected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  addListener(event: string, listener: Function): void {
    this.listeners[event].push(listener);
  }

  removeListeners(): void {
    Object.keys(this.listeners).forEach((event) => {
      this.listeners[event].length = 0;
    })
  }

  sendUserJoinedEvent(user: User): void {
    this.socket.emit("user-joined", user);
  }

  sendMessageSentEvent(message: Message): void {
    this.socket.emit("message-sent", message);
  }

  sendInviteEvent(username: string, callback: Function): void {
    this.socket.emit("invite", username, callback);
  }

  sendPrivateMessageSentEvent(message: Message, roomId: string): void {
    this.socket.emit("private-message-sent", message, roomId);
  }

  sendUserLeftRoomEvent(username: string, roomId: string): void {
    this.socket.emit("user-left-room", username, roomId);
  }

  setUpListeners(): void {
    this.socket.on("invite", (username: string, roomId: string) => {
      this.listeners["invite"].forEach((listener) => {
        listener(username, roomId);
      });
    });

    this.socket.on("message-sent", (message: Message) => {
      this.listeners["message-sent"].forEach((listener) => {
        listener(message);
      });
    });

    this.socket.on("private-message-sent", (message: Message, roomId: string) => {
      this.listeners["private-message-sent"].forEach((listener) => {
        listener(message, roomId);
      });
    });

    this.socket.on("user-joined", (user: User) => {
      this.listeners["user-joined"].forEach((listener) => {
        listener(user);
      });
    });

    this.socket.on("user-left", (user: User) => {
      this.listeners["user-left"].forEach((listener) => {
        listener(user);
      });
    });

    this.socket.on("user-left-room", (username: string, roomId: string) => {
      this.listeners["user-left-room"].forEach((listener) => {
        listener(username, roomId);
      });
    });
  }
}
