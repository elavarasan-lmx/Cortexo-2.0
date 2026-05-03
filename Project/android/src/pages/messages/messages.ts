import { Component } from '@angular/core';
import { Events, NavController, NavParams } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
/**
 * Generated class for the MessagesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {
  messages:any = [];
  count:any=0;
  constructor(public navCtrl: NavController,public events:Events, public navParams: NavParams, public commonservice: CommonServiceProvider) {
  }
  ionViewDidEnter() {
    this.commonservice.getmessages().subscribe( res => {
       this.messages = res;
       this.count=this.messages.length;
       localStorage.setItem("messagecount1",this.count)
       this.events.publish("messagecount1",this.count)
    });
  }

}
