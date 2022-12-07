import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { io, Socket } from "socket.io-client";
import { Message } from "./message";

interface ListenersByEvent {
  [event: string]: Function[],
}

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private socket: Socket;
  private listeners: ListenersByEvent = {
    "connect": [],
    "invite": [],
    "message-sent": [],
    "private-message-sent": [],
    "user-joined": [],
    "user-left": [],
    "user-left-room": [],
  };

  constructor(private http: HttpClient) {
    this.socket = io("http://localhost:3000/", { autoConnect: false });
    this.setUpListeners();
  }

  connect(username: string, callback: Function): void {
    if (this.socket.disconnected) {
      this.socket.on("connect", () => {
        this.socket.emit("user-joined", username, callback);
      });

      this.socket.connect();
    }
  }

  terminate(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }

    this.removeListeners();
  }

  addListener(event: string, listener: Function): void {
    this.listeners[event].push(listener);
  }

  removeListeners(): void {
    Object.keys(this.listeners).forEach((event) => {
      this.listeners[event].length = 0;
    })
  }

  sendUserLeftRoomNotification(username: string, roomId: string): void {
    this.socket.emit("user-left-room", username, roomId);
  }

  sendInvitation(username: string, callback: Function): void {
    this.socket.emit("invite", username, callback);
  }

  sendMessage(data: object): Observable<any> {
    return this.http.post(
      "http://localhost:5000/api/v1/messages",
      data,
      { withCredentials: true }
    );
  }

  private setUpListeners(): void {
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

    this.socket.on("user-joined", (username: string) => {
      this.listeners["user-joined"].forEach((listener) => {
        listener(username);
      });
    });

    this.socket.on("user-left", (username: string) => {
      this.listeners["user-left"].forEach((listener) => {
        listener(username);
      });
    });

    this.socket.on("user-left-room", (username: string, roomId: string) => {
      this.listeners["user-left-room"].forEach((listener) => {
        listener(username, roomId);
      });
    });
  }
}
