import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { SessionService } from '../session.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  constructor(
    private router: Router,
    private session: SessionService,
  ) { }

  ngOnInit(): void {
    if (!this.session.hasUser()) {
      this.router.navigate(["/enter"]);
      return;
    }
  }
}
