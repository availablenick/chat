import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { SessionService } from "../session.service";

@Component({
  selector: 'app-username-selector',
  templateUrl: './username-selector.component.html',
  styleUrls: ['./username-selector.component.scss']
})
export class UsernameSelectorComponent implements OnInit {
  statusMessage: string = "";

  constructor(
    private router: Router,
    private session: SessionService,
  ) { }

  ngOnInit(): void {
    if (this.session.hasUser()) {
      this.router.navigate(["/chat"]);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.statusMessage = "Validating username..."
    const username = (<any>event.target).querySelector("input[name=username]").value;
    this.session.attemptLogin(username).subscribe({
      next: () => {
        this.session.setUser({ username });
        this.statusMessage = "Joining chat...";
        this.router.navigate(["/chat"]);
      },
      error: () => {
        this.statusMessage = "This username is already being used";
      }
    });
  }
}
