import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UsernameSelectorComponent } from './username-selector/username-selector.component';
import { ChatComponent } from './chat/chat.component';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomComponent } from './room/room.component';
import { MessageContainerComponent } from './message-container/message-container.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    UsernameSelectorComponent,
    ChatComponent,
    RoomListComponent,
    RoomComponent,
    MessageContainerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
