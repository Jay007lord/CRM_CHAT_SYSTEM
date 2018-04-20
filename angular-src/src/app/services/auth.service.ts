import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, Jsonp } from "@angular/http";
import 'rxjs/add/operator/map';
//import 'rxjs/add/operator/catch';
import {Router} from '@angular/router';
import { tokenNotExpired } from 'angular2-jwt';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';

const BASE_URL = environment.backendUrl;

@Injectable()
export class AuthService {
  private authToken: string;
  private user: string;

  private apiUrl: string = `${BASE_URL}/users`;
  private staffapi: String = `${BASE_URL}/staffs`;
  private adminapi: String = `${BASE_URL}/admins`;

  constructor(private http: Http, private route:Router) { }

  registerUser(user): any {
    let url: string = this.apiUrl + "/register";

    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    let reqBody = user;

    // POST
    let observableReq = this.http.post(url, reqBody, options)
      .map(this.extractData);
    return observableReq;
  }

  authenticateUser(user): any {
    let url: string = this.apiUrl + "/authenticate";

    // prepare the request
    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    let reqBody = user;

    // POST
    let observableReq = this.http.post(url, reqBody, options)
      .map(this.extractData);

    return observableReq;
  }

  getProfile(): any {
    let url: string = this.apiUrl + "/profile";
    this.loadCredentials();
    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": this.authToken
    });
    let options = new RequestOptions({ headers: headers });
    let observableReq = this.http.get(url, options)
      .map(this.extractData);
    return observableReq;
  }

  getImagePath(): any {
    this.loadCredentials();
    let id = JSON.parse(this.user).id;
    let url: string = this.apiUrl + '/imagepath/' + id;

    let headers = new Headers({
      "Conten-Type": "application/json",
      "Authorization": this.authToken
    });
    let options = new RequestOptions({ headers: headers });
    let observableReq = this.http.get(url, options)
      .map(this.extractData);
    return observableReq;
  }

  getStaffImagePath(): any {
    this.loadCredentials();
    let id = JSON.parse(this.user).id;
    let url: string = this.staffapi + '/imagepath/' + id;

    let headers = new Headers({
      "Conten-Type": "application/json",
      "Authorization": this.authToken
    });
    let options = new RequestOptions({ headers: headers });
    let observableReq = this.http.get(url, options)
      .map(this.extractData);  
      return observableReq;
  }


  getImageAny(username): any {
    this.loadCredentials();
    let url: string = this.apiUrl + '/imgpath/' + username;
    let headers = new Headers({
      "Conten-Type": "application/json",
      "Authorization": this.authToken
    });
    let options = new RequestOptions({ headers: headers });
    let observableReq = this.http.get(url, options)
      .map(this.extractData);
    return observableReq;
  }

  getStaffImageAny(username): any {
    this.loadCredentials();
    let url: string = this.staffapi + '/imgpath/' + username;
    let headers = new Headers({
      "Conten-Type": "application/json",
      "Authorization": this.authToken
    });
    let options = new RequestOptions({ headers: headers });
    let observableReq = this.http.get(url, options)
      .map(this.extractData);
    return observableReq;
  }


  storeUserData(token, user): void {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  getUserData(): any {
    this.loadCredentials();
    let jUser = JSON.parse(this.user);
    let jData = { token: this.authToken, user: jUser };
    return jData;
  }

  loadCredentials(): void {
    let token = localStorage.getItem("token");
    let user = localStorage.getItem("user");
    this.authToken = token;
    this.user = user;
  }

  loggedIn(): boolean {
    return tokenNotExpired();
  }

  logout(): void {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  extractData(res: Response): any {
    let body = res.json();
    return body || {};
  }

  removeAccount(): any {
    this.loadCredentials();
    let id = JSON.parse(this.user).id;
    let url: string = this.apiUrl + "/removeUser/" + id;

    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": this.authToken
    });
    let options = new RequestOptions({ headers: headers });

    let observableReq = this.http.delete(url, options)
      .map(this.extractData);
    this.logout();
    return observableReq;
  }

  removeStaffAccount():any{

    this.loadCredentials();
    let id = JSON.parse(this.user).id;
    let url: string = this.staffapi + "/removeUser/" + id;

    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": this.authToken
    });
    let options = new RequestOptions({ headers: headers });

    let observableReq = this.http.delete(url, options)
      .map(this.extractData);
    this.logout();
    return observableReq;
  }

  removeImage(): any {
    this.loadCredentials();
    let id = JSON.parse(this.user).id;
    let url: string = this.apiUrl + "/removeImage/" + id;

    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": this.authToken
    });
    let options = new RequestOptions({ headers: headers });

    let observableReq = this.http.delete(url, options)
      .map(this.extractData);

    return observableReq;
  }

  removeStaffImage():any{
    this.loadCredentials();
    let id = JSON.parse(this.user).id;
    let url: string = this.staffapi + "/removeImage/" + id;

    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": this.authToken
    });
    let options = new RequestOptions({ headers: headers });

    let observableReq = this.http.delete(url, options)
      .map(this.extractData);
    return observableReq;
  }
  
  //////==================================STAFF REGISTRATION AND LOGIN===================================///////
  registerStaff(staff): any {
    let url: string = this.staffapi + "/staffRegister";

    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    let reqBody = staff;
    let observableReq = this.http.post(url, reqBody, options)
      .map(this.extractData);
    return observableReq;
  }

  authenticateStaff(staff): any {
    let url: string = this.staffapi + "/authenticateStaff";
    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    let reqBody = staff;
    let observableReq = this.http.post(url, reqBody, options)
      .map(this.extractData);
    return observableReq;
  }

  checkStaff():any{
    let data=this.getUserData().user;
    if(data.staffname==undefined)
    return false;
    else
    return true;
  }
  //////==================================Admin REGISTRATION AND LOGIN===================================///////
  registerAdmin(admin): any {
    let url: string = this.adminapi + "/adminRegister";

    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    let reqBody = admin;
    let observableReq = this.http.post(url, reqBody, options)
      .map(this.extractData);
    return observableReq;
  }

  authenticateAdmin(admin): any {
    let url: string = this.adminapi + "/authenticateAdmin";
    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    let reqBody = admin;
    let observableReq = this.http.post(url, reqBody, options)
      .map(this.extractData);
    return observableReq;
  }

}
