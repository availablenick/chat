import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { EventService } from "../event.service";
import { SessionService } from "../session.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private eventHandler: EventService,
    private session: SessionService,
  ) { }

  ngOnInit(): void {
    if (this.session.hasUser()) {
      this.isLoading = false;
      this.eventHandler.connect();
      this.eventHandler.sendUserJoinedEvent(this.session.getUser()!);
    } else {
      this.session.requestData().subscribe({
        next: (response: any) => {
          this.session.setUser({ name: response.body.user.username });
          this.eventHandler.connect();
          this.eventHandler.sendUserJoinedEvent({ name: response.body.user.username });
          this.isLoading = false;
        },
        error: () => {
          this.router.navigate(["/enter"]);
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.eventHandler.removeListeners();
  }
}
