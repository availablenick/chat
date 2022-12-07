import { Component, Output, EventEmitter } from "@angular/core";
import { RoomService } from "../../services/room.service";
import { Room } from "../../interfaces/room";

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent {
  @Output() showRoomEvent = new EventEmitter<Room>();
  @Output() leaveRoomEvent = new EventEmitter<Room>();

  constructor(public roomHandler: RoomService) { }

  showRoom(id: string): void {
    this.showRoomEvent.emit(this.roomHandler.getRoom(id));
  }

  leaveRoom(id: string): void {
    this.roomHandler.leaveRoom(id);
    this.leaveRoomEvent.emit();
  }
}
