import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { FileSelectDirective } from 'ng2-file-upload';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { MessageComponent } from './components/message/message.component';

import { FlashMessagesModule } from 'angular2-flash-messages';
import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { ChatService } from "./services/chat.service";
import { ActiveListComponent } from './components/active-list/active-list.component';
import { ActiveStaffListComponent } from './components/active-staff-list/active-staff-list.component';
import { CompanyhomeComponent } from './components/companyhome/companyhome.component';
import { StaffhomeComponent } from './components/staffhome/staffhome.component';
import { AdminhomeComponent } from './components/adminhome/adminhome.component';
import { CustomerhomeComponent } from './components/customerhome/customerhome.component';
import { AppImageComponent } from './components/app-image/app-image.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'customer', component: CustomerhomeComponent },
  { path: 'company', component: CompanyhomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },

  { path: 'company', component: CompanyhomeComponent },
  { path: 'staff', component: StaffhomeComponent },
  { path: 'admin', component: AdminhomeComponent },


  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'imagepath', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'active-staff-list', component: ActiveStaffListComponent, canActivate: [AuthGuard] },
  { path: 'active-list', component: ActiveListComponent, canActivate: [AuthGuard] },

  {
    path: 'chat', canActivate: [AuthGuard], children: [
      { path: ':chatWith', component: ChatRoomComponent },
      { path: '**', redirectTo: '/chat/chat-room', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProfileComponent,
    ChatRoomComponent,
    MessageComponent,
    ActiveListComponent,
    FileSelectDirective,
    CompanyhomeComponent,
    StaffhomeComponent,
    AdminhomeComponent,
    CustomerhomeComponent,
    AppImageComponent,
    ActiveStaffListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    FlashMessagesModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    AuthGuard,
    AuthService,
    ChatService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
