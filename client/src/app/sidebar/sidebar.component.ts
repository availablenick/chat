import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { SessionService } from '../session.service';
import { EventService } from '../event.service';
import { User } from '../user';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  usernames: Set<string> = new Set();

  constructor(
    private router: Router,
    private session: SessionService,
    private eventHandler: EventService,
  ) { }

  ngOnInit(): void {
    this.eventHandler.addListener("user-joined", (user: User) => {
      this.usernames.add(user.name);
    });

    this.eventHandler.addListener("user-left", (user: User) => {
      this.usernames.delete(user.name);
    });

    this.session.requestAll().subscribe((response: any) => {
      response.body.data.forEach((user: any) => { this.usernames.add(user.username) });
    });
  }

  onClick(): void {
    this.session.clear().subscribe(() => {
      this.router.navigate(["/enter"]);
      this.eventHandler.disconnect();
    });
  }
}
