import { Component, OnInit } from '@angular/core';
import { Validators , FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { FlashMessagesService } from 'angular2-flash-messages';
declare var $:any;

@Component({
  selector: 'app-adminhome',
  templateUrl: './adminhome.component.html',
  styleUrls: ['./adminhome.component.scss']
})
export class AdminhomeComponent implements OnInit {

  registerForm: FormGroup;
  loginForm:FormGroup;

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
    this.formJquery();
  }

  formJquery(){
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
      adminname: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(14) ]],
      email: ['', [ Validators.required, Validators.email]],
       companyname:['',[Validators.required]],
       password: ['', [ Validators.required , Validators.minLength(4) ]],
       confirmPass: ['', [ Validators.required, Validators.minLength(4) ]]
   });
  }

  LogInForm(){
    this.loginForm = this.formBuilder.group({
      
      adminname: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(14) ]],
      password: ['', [ Validators.required, Validators.minLength(4) ]]
    });
  }

  checkLoggedIn(): void {
    if (this.authService.loggedIn()) {
      this.router.navigate(["/"]);
    }
  }

  onRegisterSubmit(): void {
    this.authService.registerAdmin(this.registerForm.value)
      .subscribe(data => {
        if (data.success == true) {
          this.flashMessagesService.show(data.msg, {cssClass: "alert-success", timeout: 3000});
        
        } else {
          this.flashMessagesService.show(data.msg, {cssClass: "alert-danger", timeout: 3000});
        }
      });
  }

  onLoginSubmit(): void {
    this.authService.authenticateAdmin(this.loginForm.value)
      .subscribe(data => {
        if (data.success == true) {
          this.authService.storeUserData(data.token, data.admin);
          this.chatService.connect(data.admin.adminname);
          this.router.navigate(["/chat"]);
        } else {
          this.flashMessagesService.show(data.msg, {cssClass: "alert-danger", timeout: 3000});
        }
      });
  }
}
