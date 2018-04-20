import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { Message } from "../../models/message.model";
import { AuthService } from '../../services/auth.service';



@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})

export class MessageComponent implements OnInit {
  @Input() message: Message;
  time: string;
  fadeTime: boolean;
    
  constructor(private authService: AuthService) { }

  ngOnInit() {
    setTimeout(() => { this.updateFromNow(); this.fadeTime = true }, 2000);
    setInterval(() => { this.updateFromNow() }, 60000);
  }

  

  updateFromNow(): void {
    this.time = moment(this.message.created).fromNow();
  }


  
}

