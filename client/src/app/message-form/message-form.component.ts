import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-message-form',
  templateUrl: './message-form.component.html',
  styleUrls: ['./message-form.component.scss']
})
export class MessageFormComponent implements OnInit {
  name: string = 'name0';

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit(event: Event): void {
    event.preventDefault();
  }
}
