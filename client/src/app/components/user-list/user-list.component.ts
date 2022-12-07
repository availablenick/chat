import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { SessionService } from '../../services/session.service';
import { CommunicationService } from '../../services/communication.service';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @Input() set initialUsernames(initialUsernames: string[]) {
    initialUsernames.forEach((username) => {
      this.usernames.add(username);
    });
  }

  usernames: Set<string> = new Set();

  constructor(
    private router: Router,
    private session: SessionService,
    private communicationHandler: CommunicationService,
    private roomHandler: RoomService,
  ) { }

  ngOnInit(): void {
    this.communicationHandler.addListener("user-joined", (username: string) => {
      this.usernames.add(username);
    });

    this.communicationHandler.addListener("user-left", (username: string) => {
      this.usernames.delete(username);
    });
  }

  onClick(): void {
    this.session.clear().subscribe(() => {
      this.router.navigate(["/enter"]);
    });
  }

  sendInvitation(username: string) {
    this.roomHandler.inviteUser(username);
  }
}
