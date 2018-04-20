import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { Router } from '@angular/router';
//import {DataServiceService} from '../../services/data-service.service';
import { FlashMessagesService } from 'angular2-flash-messages';
var URL;
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {

  loading: boolean = false;
  user: Object;
  staff: Object;
  form: FormGroup;
  staffImage: String;
  userflag: boolean = false;
  remove: boolean = false;
  removeP: boolean = false;
  imagePath: String = '';
  public uploader:FileUploader;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(public authService: AuthService,
    private flashMessagesService: FlashMessagesService,
    private formBuilder: FormBuilder,
    private router: Router,
    // private data:DataServiceService
  ) { }

  ngOnInit() {
    this.getProfile();
    this.fileupload();
    this.buildForm();
    this.getImage();
  }

  fileupload(){
    if(!this.checkStaff())
     URL = 'http://localhost:8080/users/upload';
    else
     URL='http://localhost:8080/staffs/upload';
     this.uploader= new FileUploader({ url: URL + "/" + JSON.parse(localStorage.getItem("user")).id, itemAlias: 'photo' });

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      console.log("ImageUpload:uploaded:", item, status, response);
    };
  }

  getImage():void {
    if (this.checkStaff()) {
      this.getStaffImagePath();
    }
    else
      this.getImagePath();
  }

  checkStaff() {
    return this.authService.checkStaff();
  }

 

  getStaffImagePath() {
    this.authService.getStaffImagePath()
      .subscribe(data => {
        if(data.path=="")
        data.path='/generic-avatar.png';
        this.staffImage = "assets/img/" + data.path;
      }, err => {
        console.log("Error while getting path of an Image");
        console.log(err);
        return false;
      });
  }

  getImagePath() {
    this.authService.getImagePath()
      .subscribe(data => {
        if(data.path=="")
        data.path='/generic-avatar.png';
        this.imagePath = "assets/img/" + data.path;
      }, err => {
        console.log("Error while getting path of an Image");
        console.log(err);
        return false;
      });
  }

  getProfile() {
    this.authService.getProfile()
      .subscribe(data => {
        if (data.user.username != undefined) {
          this.user = data.user;
        }
        else {
          this.userflag = false;
          this.staff = data.user;
        }
      }, err => {
        console.log(err);
        return false;
      });
  }

  buildForm() {
    this.form = this.formBuilder.group({
      avatar: null
    });
  }

  removeProfile() {
    if (!this.checkStaff()) {
      this.authService.removeImage()
        .subscribe(data => {
          console.log(data);
          this.removeP = false;
          this.imagePath='assets/img/generic-avatar.png'
        }, err => {
          console.log(err);
          this.removeP = false;
          return false;
        });
    }
    else {
      this.authService.removeStaffImage()
        .subscribe(data => {
          console.log(data);
          this.removeP = false;
          this.staffImage='assets/img/generic-avatar.png';
        }, err => {
          console.log(err);
          this.removeP = false;
          return false;
        });
    }
    this.removeP = !this.removeP;
    
  }

  removeAcc() {
    if(!this.checkStaff()){
      this.authService.removeAccount()
      .subscribe(data => {
        console.log(data);
        this.remove = false;
      }, err => {
        console.log(err);
        this.remove = false;
        return false;
      });
   }
   else{
     this.authService.removeStaffAccount()
     .subscribe(data=>{
       this.remove=false;
     },err=>{
        this.remove=false;
        return false;
     });
   }
    this.remove = !this.remove;
    this.router.navigate(["/"]);
  }
}
