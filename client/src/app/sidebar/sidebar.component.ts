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
  users: User[] = [];

  constructor(
    private router: Router,
    private session: SessionService,
    private eventHandler: EventService,
  ) { }

  ngOnInit(): void {
    this.eventHandler.addListener("user-joined", (users: User[]) => {
      this.users = users;
    });

    this.eventHandler.addListener("user-left", (users: User[]) => {
      this.users = users;
    });

    this.session.requestAll().subscribe((response: any) => {
      this.users = response.body.data.map((user: any) => ({ name: user.username }));
    });
  }

  onClick(): void {
    this.session.clear().subscribe(() => {
      this.router.navigate(["/enter"]);
      this.eventHandler.sendDisconnectEvent();
    });
  }
}
