import { Component, Input, AfterViewInit, OnDestroy, ElementRef } from "@angular/core";
import { Message, CustomMessage } from "../message";

@Component({
  selector: 'app-message-container',
  templateUrl: './message-container.component.html',
  styleUrls: ['./message-container.component.scss']
})
export class MessageContainerComponent implements AfterViewInit, OnDestroy {
  @Input() styles: any;
  @Input() set messages(messages: Message[]) {
    this.parsedMessages = messages.map((message) => this.parseMessage(message));
  };

  parsedMessages: CustomMessage[] = [];
  private containerObserver: any = null;

  constructor(private containerRef: ElementRef) { }

  ngAfterViewInit(): void {
    this.containerRef.nativeElement.scrollTo(0, this.containerRef.nativeElement.scrollHeight);
    this.containerObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        switch (mutation.type) {
          case "childList":
            (<any>mutation.target).scrollTo(0, (<any>mutation.target).scrollHeight);
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

  private parseMessage(message: Message): CustomMessage {
    if (message.type === "text") {
      const contents = [];
      const regex = /\[link\](.*?)\[\/link\]/g;
      let currentIndex = 0;
      let result;
      while ((result = regex.exec(message.content)) !== null) {
        if (result.index - currentIndex > 1) {
          const nonLinkText = message.content.substring(currentIndex, result.index);
          contents.push({ isLink: false, text: nonLinkText });
        }

        const linkText = result[1];
        contents.push({ isLink: true, text: linkText });
        currentIndex = regex.lastIndex;
      }

      const remainingText = message.content.substring(currentIndex, message.content.length);
      contents.push({ isLink: false, text: remainingText });

      return {
        author: message.author,
        contents,
        type: message.type,
        containsLink: true,
      };
    }

    return {
      author: message.author,
      contents: [message.content],
      type: message.type,
      containsLink: false,
    };
  }
}
