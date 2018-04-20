import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from "../../services/auth.service";
import { ChatService } from "../../services/chat.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {

  flag:boolean=false;
  flaggy:boolean=false;
  home:boolean=false;
  constructor(
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private el: ElementRef
  ) { }

  ngOnInit() {
  }

  onLogoutClick(): boolean {
    this.chatService.disconnect();
    this.authService.logout();
    this.router.navigate(["/"]);
    this.onNavigate();
    return false;
  }

  onNavigate(): void {
    this.collaspseNav();
  }

  homie(){
    this.flag=false;
    this.flaggy=false;
    this.home=false;
  }
  collaspseNav(): void {
    let butt = this.el.nativeElement.querySelector(".navbar-toggle");
    let isCollapsed = this.hasClass(butt, "collapsed");
    if (isCollapsed == false) {
      butt.click();
    }
  }
   
  companyhome():void{
    this.flag=true;
    this.home=true;
  }

  customerhome():void{
    this.flaggy=true;
    this.home=true;
  }

  hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }

}
