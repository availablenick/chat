import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef } from "@angular/core";
import { EventService } from "../event.service";
import { Message } from "../message";
import { User } from "../user";

interface CustomMessage {
  author: string,
  contents: any[],
  type: string,
  containsLink: boolean,
}

@Component({
  selector: 'app-message-container',
  templateUrl: './message-container.component.html',
  styleUrls: ['./message-container.component.scss']
})
export class MessageContainerComponent implements OnInit, AfterViewInit, OnDestroy {
  messages: CustomMessage[] = [];
  private containerObserver: any = null;

  constructor(
    private containerRef: ElementRef,
    private eventHandler: EventService,
  ) { }

  ngOnInit(): void {
    this.eventHandler.addListener("message-sent", (message: Message) => {
      switch (message.type) {
        case "text":
          const contents = this.filterMessageContent(message.content);
          this.messages.push({
            author: message.author,
            contents: contents,
            type: message.type,
            containsLink: true,
          });
          break;
        case "image":
        case "video":
          this.messages.push({
            author: message.author,
            contents: [message.content],
            type: message.type,
            containsLink: false,
          });
          break;
      }
    });

    this.eventHandler.addListener("user-joined", (user: User) => {
      this.messages.push({
        author: user.name,
        contents: [`${user.name} joined the chat`],
        type: "text",
        containsLink: false,
      });
    });

    this.eventHandler.addListener("user-left", (user: User) => {
      this.messages.push({
        author: user.name,
        contents: [`${user.name} left the chat`],
        type: "text",
        containsLink: false,
      });
    });
  }

  ngAfterViewInit(): void {
    this.containerRef.nativeElement.scrollTop = this.containerRef.nativeElement.scrollHeight;
    this.containerObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        switch (mutation.type) {
          case "childList":
            (<any>mutation.target).scrollTop = (<any>mutation.target).scrollHeight;
            break;
        }
      });
    });

    this.containerObserver.observe(this.containerRef.nativeElement, { childList: true });
  }

  ngOnDestroy(): void {
    if (this.containerObserver !== null) {
      this.containerObserver.disconnect();
    }
  }

  private filterMessageContent(content: string): any[] {
    const contents = [];
    const regex = /\[link\](.*?)\[\/link\]/g;
    let currentIndex = 0;
    let result;
    while ((result = regex.exec(content)) !== null) {
      if (result.index - currentIndex > 1) {
        const nonLinkText = content.substring(currentIndex, result.index);
        contents.push({ isLink: false, text: nonLinkText });
      }

      const linkText = result[1];
      contents.push({ isLink: true, text: linkText });
      currentIndex = regex.lastIndex;
    }

    const remainingText = content.substring(currentIndex, content.length);
    contents.push({ isLink: false, text: remainingText });
    return contents;
  }
}
