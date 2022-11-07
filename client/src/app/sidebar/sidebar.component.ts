import { Component, OnInit } from '@angular/core';
import { User } from '../user';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  users: User[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
