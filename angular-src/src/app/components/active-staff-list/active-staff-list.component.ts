import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AuthService} from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-active-staff-list',
  templateUrl: './active-staff-list.component.html',
  styleUrls: ['./active-staff-list.component.scss']
})

export class ActiveStaffListComponent implements OnInit {
  @Input() staffs: Array<String>;
  @Input() current: string;
  @Output() newConvStaff = new EventEmitter<string>();
  @Output() changeflaggy=new EventEmitter<boolean>();
 

  constructor(private authservice: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onUserClick(staffname: string): boolean {
    this.newConvStaff.emit(staffname);
    return false;
  }

  checkstaff(): boolean {
    return this.authservice.checkStaff();
  }

 
  changeusertype() {
    this.changeflaggy.emit(true);
  }
}
