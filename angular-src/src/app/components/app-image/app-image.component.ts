import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-image',
  templateUrl: './app-image.component.html',
  styleUrls: ['./app-image.component.scss']
})
export class AppImageComponent implements OnInit {

  @Input('user') user: any = '';
  image: string = '';
  @Input('staff') staff: any = '';
  constructor(private authservice: AuthService) { }

  ngOnInit() {
    if (this.user != '') {
      if (this.user.filename == '')
        this.image = "assets/img/generic-avatar.png";
      else
        this.image = "assets/img/" + this.user.filename;
    }

    else {
      if (this.staff.filename == '')
      this.image = "assets/img/generic-avatar.png";
    else
      this.image = "assets/img/" + this.staff.filename;
  }
 
    }
  }

