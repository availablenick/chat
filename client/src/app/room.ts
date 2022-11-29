import { Message } from "./message";

export interface Room {
  id: string,
  username: string,
  isActive: boolean,
  messages: Message[],
}
