export interface Message {
  author: string,
  content: string,
  type: string,
}

export interface CustomMessage {
  author: string,
  contents: any[],
  type: string,
  containsLink: boolean,
}
