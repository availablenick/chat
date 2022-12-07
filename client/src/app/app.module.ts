import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from "./components/app.component";
import { ChatComponent } from "./components/chat/chat.component";
import { MessageContainerComponent } from "./components/message-container/message-container.component";
import { RoomListComponent } from "./components/room-list/room-list.component";
import { RoomComponent } from "./components/room/room.component";
import { UserListComponent } from "./components/user-list/user-list.component";
import { UsernameSelectorComponent } from "./components/username-selector/username-selector.component";

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    MessageContainerComponent,
    RoomComponent,
    RoomListComponent,
    UserListComponent,
    UsernameSelectorComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
