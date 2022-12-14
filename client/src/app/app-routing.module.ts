import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { UsernameSelectorComponent } from './components/username-selector/username-selector.component';

const routes: Routes = [
  { path: '', redirectTo: '/enter', pathMatch: 'full' },
  { path: 'enter', component: UsernameSelectorComponent },
  { path: 'chat', component: ChatComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
