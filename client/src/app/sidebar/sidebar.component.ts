import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { SessionService } from '../session.service';
import { User } from '../user';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  users: User[] = [];

  constructor(
    private router: Router,
    private session: SessionService,
  ) { }

  onClick(): void {
    this.session.attemptLogout().subscribe(() => {
      this.session.clear();
      this.router.navigate(["/enter"]);
    });
  }
}
