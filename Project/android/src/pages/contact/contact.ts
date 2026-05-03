import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  contactusdetails: any = [];
  aboutusdetails: any = []; // Added aboutusdetails to avoid undefined errors

  constructor(
    public navCtrl: NavController,
    private commonservice: CommonServiceProvider
  ) {}

  ionViewWillEnter() {
    this.commonservice.getcontactusdetails().subscribe(res => {
      console.log(res);
      this.contactusdetails = res['contactus'] || [];
      this.aboutusdetails = res['aboutus'] || [];
    });
  }
}
