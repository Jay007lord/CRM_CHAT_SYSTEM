import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-companyhome',
  templateUrl: './companyhome.component.html',
  styleUrls: ['./companyhome.component.scss']
})
export class CompanyhomeComponent implements OnInit {

  constructor(private  authService: AuthService) { }

  ngOnInit() {
  }

}
