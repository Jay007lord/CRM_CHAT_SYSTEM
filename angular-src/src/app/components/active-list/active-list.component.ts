import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-active-list',
  templateUrl: './active-list.component.html',
  styleUrls: ['./active-list.component.scss']
})

export class ActiveListComponent implements OnInit {
  @Input() users: Array<String>;
  @Input() current: string;
  @Output() newConv = new EventEmitter<string>();
  @Output() changeflag=new EventEmitter<boolean>();
  image: any = '';
  imagepath: String;

  constructor(private authservice: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onUserClick(username: string): boolean {
    this.newConv.emit(username);
    return false;
  }

  checkstaff(): boolean {
    return this.authservice.checkStaff();
  }

  changeusertype() {
    this.changeflag.emit(false);
  }
}
