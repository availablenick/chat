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
    "message-sent": [],
    "user-joined": [],
    "user-left": [],
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

  setUpListeners(): void {
    this.socket.on("message-sent", (message: Message) => {
      this.listeners["message-sent"].forEach((listener) => {
        listener(message);
      });
    });

    this.socket.on("user-joined", (users: User[]) => {
      this.listeners["user-joined"].forEach((listener) => {
        listener(users);
      });
    });

    this.socket.on("user-left", (users: User[]) => {
      this.listeners["user-left"].forEach((listener) => {
        listener(users);
      });
    });
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

  sendDisconnectEvent(): void {
    this.socket.disconnect();
  }
}
