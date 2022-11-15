import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { EventService } from "../event.service";
import { SessionService } from "../session.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private eventHandler: EventService,
    private session: SessionService,
  ) { }

  ngOnInit(): void {
    if (this.session.hasUser()) {
      this.isLoading = false;
    } else {
      this.session.requestData().subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.session.setUser({ name: response.body.user.username });
          this.eventHandler.sendUserJoinedEvent(this.session.getUser()!);
        },
        error: () => {
          this.router.navigate(["/enter"]);
        },
      });
    }
  }
}
