import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
@Component({
  selector: 'page-bank',
  templateUrl: 'bank.html'
})
export class BankPage {
  bandetails: any[] = [];

  constructor(public navCtrl: NavController, public events: Events, public commonservice: CommonServiceProvider) { }

  ionViewDidLoad() {
    this.commonservice.getbankdetails().subscribe(res => {
      this.bandetails = res['bankdetails'];
    });
  }
}
