import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
@Component({
  selector: 'app-customerhome',
  templateUrl: './customerhome.component.html',
  styleUrls: ['./customerhome.component.scss']
})
export class CustomerhomeComponent implements OnInit {

  constructor(private authService:AuthService) { }

  ngOnInit() {
  }

}
