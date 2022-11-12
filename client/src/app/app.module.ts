import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MessageFormComponent } from './message-form/message-form.component';
import { MessageContainerComponent } from './message-container/message-container.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UsernameSelectorComponent } from './username-selector/username-selector.component';
import { ChatComponent } from './chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    MessageFormComponent,
    MessageContainerComponent,
    SidebarComponent,
    UsernameSelectorComponent,
    ChatComponent
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
