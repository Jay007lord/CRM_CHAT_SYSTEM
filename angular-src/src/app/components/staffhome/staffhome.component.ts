import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder , FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {FlashMessagesService} from 'angular2-flash-messages';
import { ChatService } from '../../services/chat.service';
declare var $:any; //Use for JQUERY

@Component({
  selector: 'app-staffhome',
  templateUrl: './staffhome.component.html',
  styleUrls: ['./staffhome.component.scss']
})

export class StaffhomeComponent implements OnInit {

  registerForm: FormGroup;
  loginForm:FormGroup;
  log:boolean=false;
  reg:boolean=true;
  constructor(
    private formBuilder: FormBuilder,
    private flashMessagesService: FlashMessagesService,
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService
  ) { }

  ngOnInit() {
    this.checkLoggedIn(); 
    this.RegistrationForm();
    this.LogInForm();   
    this.JQUERY();
  }

  JQUERY(){
    $('.form').find('input, textarea').on('keyup blur focus', function (e) {
    
      var $this = $(this),
        label = $this.prev('label');
  
      if (e.type === 'keyup') {
        if ($this.val() === '') {
          label.removeClass('active highlight');
        } else {
          label.addClass('active highlight');
        }
      } else if (e.type === 'blur') {
        if ($this.val() === '') {
          label.removeClass('active highlight');
        } else {
          label.removeClass('highlight');
        }
      } else if (e.type === 'focus') {
  
        if ($this.val() === '') {
          label.removeClass('highlight');
        } else if ($this.val() !== '') {
          label.addClass('highlight');
        }
      }
  
    });
  
    $('.tab a').on('click', function (e) {
  
      e.preventDefault();
  
      $(this).parent().addClass('active');
      $(this).parent().siblings().removeClass('active');
  
      this.target = $(this).attr('href');
  
      $('.tab-content > div').not(this.target).hide();
  
      $(this.target).fadeIn(600);
  
    });
  }

  RegistrationForm(){
    this.registerForm = this.formBuilder.group({
      staffname: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(14) ]],
      email: ['', [ Validators.required, Validators.email]],
       companyname:['',[Validators.required]],
       password: ['', [ Validators.required , Validators.minLength(4) ]],
       confirmPass: ['', [ Validators.required, Validators.minLength(4) ]]
   });
  }

  LogInForm(){
    this.loginForm = this.formBuilder.group({
      
      staffname: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(14) ]],
      password: ['', [ Validators.required, Validators.minLength(4) ]]
    });
  }

  checkLoggedIn(): void {
    if (this.authService.loggedIn()) {
      this.router.navigate(["/staff"]);
    }
  }

  onRegisterSubmit(): void {
    this.authService.registerStaff(this.registerForm.value)
      .subscribe(data => {
        if (data.success == true) {
          this.flashMessagesService.show(data.msg, {cssClass: "alert-success", timeout: 3000});
        } else {
          this.flashMessagesService.show(data.msg, {cssClass: "alert-danger", timeout: 3000});
        }
      });
      // this.reg=false;
      // this.log=true;
    }

  onLoginSubmit(): void {
    this.authService.authenticateStaff(this.loginForm.value)
      .subscribe(data => {
        if (data.success == true) {
          this.authService.storeUserData(data.token, data.staff);
          
          this.chatService.connect(data.staff.staffname);
          this.router.navigate(["/chat"]);
        } else {
          this.flashMessagesService.show(data.msg, {cssClass: "alert-danger", timeout: 3000});
        }
      });
  }

  // changeReg(){
  //   this.log=false;
  //   this.reg=true;
  // }
  
  // changeLog(){
  //   this.log=true;
  //   this.reg=false; 
  // }
}
