import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Message } from "../../models/message.model";
import { ChatService } from "../../services/chat.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})

export class ChatRoomComponent implements OnInit, OnDestroy {
  messageList: Array<Message>;
  userList: Array<any>;
  showActive: boolean;
  sendForm: FormGroup;
  username: string;
  chatWith: string;
  currentUser: boolean;// For Customer it's true and for Staff it's false
  currentOnline: boolean;
  receiveMessageObs: any;
  receiveActiveObs: any;
  noMsg: boolean;
  conversationId: string;
  notify: boolean;
  notification: any = { timeout: null };
  isCustomer: boolean = true;
  staffList: Array<any> = [];
  showActiveStaff: boolean=false;
  staffname: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private el: ElementRef,
    private authService: AuthService,
    private chatService: ChatService
  ) { }

  ngOnInit() {
    this.checkStaff();
    this.connectUsertype();
    this.connectToChat();
    this.showList(this.isCustomer);
  }

  connectUsertype(){
    let userData = this.authService.getUserData();
    if (this.authService.checkStaff()) {
      this.staffname = userData.user.staffname;
      this.route.params.subscribe((params: Params) => {
        this.chatWith = params.chatWith;
      });
      this.sendForm = this.formBuilder.group({
        message: ['', Validators.required]
      });
      this.getMessages(this.chatWith);
    }
    else {
      this.username = userData.user.username;
      this.route.params.subscribe((params: Params) => {
        this.chatWith = params.chatWith;
      });
      this.sendForm = this.formBuilder.group({
        message: ['', Validators.required]
      });
      this.getMessages(this.chatWith);
    }
  }

  checkStaff() {
    if (this.authService.checkStaff())
      this.currentUser = false;
    else
      this.currentUser = true;
  }

  ngOnDestroy() {
    this.receiveActiveObs.unsubscribe();
    this.receiveMessageObs.unsubscribe();
  }

  connectToChat(): void {
    let connected = this.chatService.isConnected();
    if (connected == true) {
      this.initReceivers();
    } else {
      if (this.currentUser) {
        this.chatService.connect(this.username, () => {
          this.initReceivers();
        });
      } else {
        this.chatService.connect(this.staffname, () => {
          this.initReceivers();
        });
      }
    }
  }
  getMessages(name: string): void {
    let current;
    if(this.currentUser)
    current=this.username;
    else
    current=this.staffname;
    this.chatService.getConversation(current, name)
      .subscribe(data => {
        if (data.success == true) {
          this.conversationId = data.conversation._id || data.conversation._doc._id;
          let messages = data.conversation.messages || null;
          if (messages && messages.length > 0) {
            for (let message of messages) {
              this.checkMine(message);
            }
            this.noMsg = false;
            this.messageList = messages;
            this.scrollToBottom();
          } else {
            this.noMsg = true;
            this.messageList = [];
          }
        } else {
          this.onNewConv("chat-room");
        }
      });
  }

  getStaffList(): void {
    this.chatService.getStaffList()
      .subscribe(data => {
        if (data.success == true) {
          let ListOfstaffs=[];
          for (let i = 0,j=0; i < data.staffs.length; i++) {
            if (data.staffs[i].staffname !== this.staffname) {
              ListOfstaffs[j] = data.staffs[i];
              j++;
            }
          }
          
          this.staffList = ListOfstaffs.sort(this.compareByStaffname);

          this.receiveActiveObs = this.chatService.receiveActiveStaffList()
            .subscribe(staffs => {
              for (let onlineStaff of staffs) {
                if (onlineStaff.staffname != this.staffname) {
                  let flag = 0;
                  for (let registered of this.staffList) {
                    if (registered.staffname == onlineStaff.staffname) {
                      flag = 1;
                      break;
                    }
                  }
                  if (flag == 0) {
                    this.staffList.push(onlineStaff);
                    this.staffList.sort(this.compareByStaffname);
                  }
                }
              }

              for (let staff of this.staffList) {
                let flag = 0;
                for (let liveStaff of staffs) {
                  if (liveStaff.staffname == staff.staffname) {
                    staff.online = true;
                    flag = 1;
                    break;
                  }
                }
                if (flag == 0) {
                  staff.online = false;
                }
              }

              this.currentOnline = this.checkOnlineStaff(this.chatWith);
            });

          this.chatService.getActiveList();
        } else {
          this.onNewConv("chat-room");
        }
      });
  }

  getUserList(): void {
    this.chatService.getUserList()
      .subscribe(data => {
        if (data.success == true) {
          let users = [];
          for (let i = 0, j = 0; i < data.users.length; i++) {
            if (data.users[i].username !== this.username) {
              users[j] = data.users[i];
              j++;
            }
          }
          this.userList = users.sort(this.compareByUsername);

          this.receiveActiveObs = this.chatService.receiveActiveList()
            .subscribe(users => {
              for (let onlineUsr of users) {
                if (onlineUsr.username != this.username) {
                  let flag = 0;
                  for (let registered of this.userList) {
                    if (registered.username == onlineUsr.username) {
                      flag = 1;
                      break;
                    }
                  }
                  if (flag == 0) {
                    this.userList.push(onlineUsr);
                    this.userList.sort(this.compareByUsername);
                  }
                }
              }

              for (let user of this.userList) {
                let flag = 0;
                for (let liveUser of users) {
                  if (liveUser.username == user.username) {
                    user.online = true;
                    flag = 1;
                    break;
                  }
                }
                if (flag == 0) {
                  user.online = false;
                }
              }

              this.currentOnline = this.checkOnline(this.chatWith);
            });

          this.chatService.getActiveList();
        } else {
          this.onNewConv("chat-room");
        }
      });
  }

  initReceivers(): void {
    
      
    this.receiveMessageObs = this.chatService.receiveMessage()
      .subscribe(message => {
        this.checkMine(message);
        if (message.conversationId == this.conversationId) {
          this.noMsg = false;
          this.messageList.push(message);
          this.scrollToBottom();
          this.msgSound();
        } else if (message.mine != true) {
          if (this.notification.timeout) { clearTimeout(this.notification.timeout) };
          this.notification = {
            from: message.from,
            inChatRoom: message.inChatRoom,
            text: message.text,
            timeout: setTimeout(() => { this.notify = false }, 4000)
          };
          this.notify = true;
          this.notifSound();
        }
      });
  }

  onSendSubmit(): void {
    let newMessage: Message;
    if (this.currentUser) {
      newMessage = {
        created: new Date(),
        from: this.username,
        text: this.sendForm.value.message,
        conversationId: this.conversationId,
        inChatRoom: this.chatWith == "chat-room"
      };
    }
    else {
      newMessage = {
        created: new Date(),
        from: this.staffname,
        text: this.sendForm.value.message,
        conversationId: this.conversationId,
        inChatRoom: this.chatWith == "chat-room"
      };
    }
    this.chatService.sendMessage(newMessage, this.chatWith);
    newMessage.mine = true;
    this.noMsg = false;
    this.messageList.push(newMessage);
    this.scrollToBottom();
    this.msgSound();
    this.sendForm.setValue({ message: "" });
  }

  checkMine(message: Message): void {
    if (this.currentUser) {
      if (message.from == this.username) {
        message.mine = true;
      }
    } else {
      if (message.from == this.staffname) {
        message.mine = true;
      }
    }
  }

  onUsersClick(): void {
    this.showActive = !this.showActive;
  }

  onNewConv(username: string) {
    if (this.chatWith != username) {
      this.router.navigate(['/chat', username]);
      this.getMessages(username);
    } else {
      this.getMessages(username);
    }
    if(this.isCustomer)
    this.currentOnline = this.checkOnline(username);
    else
    this.currentOnline=this.checkOnlineStaff(username);
    this.showActive = false;
  }

  notifSound(): void {
    let sound: any = this.el.nativeElement.querySelector('#notifSound');
    sound.play();
  }

  msgSound(): void {
    let sound: any = this.el.nativeElement.querySelector('#msgSound');
    sound.load();
    sound.play();
  }

  scrollToBottom(): void {
    let element: any = this.el.nativeElement.querySelector('.msg-container');
    setTimeout(() => {
      element.scrollTop = element.scrollHeight;
    }, 100);
  }

  checkOnline(name: string): boolean {
      if (name == "chat-room") {
        for (let user of this.userList) {
          if (user.online == true) {
            return true;
          }
        }
        return false;
      } else {
        for (let user of this.userList) {
          if (user.username == name) {
            return user.online;
          }
        }
      return false;
      }
  }

  checkOnlineStaff(name: string): boolean {
    console.log(this.staffList)
    if (name == "chat-room") {
      for (let staff of this.staffList) {
        if (staff.online == true) {
          return true;
        }
      }
      return false;
    } else {
      for (let staff of this.staffList) {
        if (staff.staffname == name) {
          return staff.online;
        }
      }
    }
  }

  compareByUsername(a, b): number {
    if (a.username < b.username)
      return -1;
    if (a.username > b.username)
      return 1;
    return 0;
  }

  compareByStaffname(a, b): number {
    if (a.staffname < b.staffname)
      return -1;
    if (a.staffname > b.staffname)
      return 1;
    return 0;
  }

  changeUser($event) {
    this.isCustomer = $event;
    this.showList(this.isCustomer);
  }
  showList(customer:boolean){
    if(customer)
    this.getUserList();
    else
    this.getStaffList();
  }
}
