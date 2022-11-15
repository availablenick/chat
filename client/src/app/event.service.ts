import { Injectable } from '@angular/core';
import { io, Socket } from "socket.io-client";
import { Message } from "./message";
import { User } from "./user";

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private socket: Socket;

  constructor() {
    this.socket = io("http://localhost:3000/main");
  }

  getSocket(): Socket {
    return this.socket;
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
