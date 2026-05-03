import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonServiceProvider } from "../../providers/common-service/common-service";
import { LiveratesProvider } from "../../providers/liverates/liverates";
/**
 * Generated class for the UnfixPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-unfix',
  templateUrl: 'unfix.html',
})
export class UnfixPage {
  paymentunfix: any = [];
  userid: any = "";
  booktotal: any = "";
  unfixpaymentlist = [];
  unfixbooklist = [];
  unfixpaymenttotal = [];
  unfixbooktotal = [];
  unfixpaymentlist_len = 0;
  unfixbooklist_len = 0;
  unfixdiffamount = 0;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public liverateservice: LiveratesProvider,
    private commonservice: CommonServiceProvider
  ) {
  }
  paymentunfixreport() {
    let currentliverates: any = [];
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad UnfixPage');
    this.userid = localStorage.getItem('MAHARAJ_userId');
    console.log("userid: " + this.userid);
    this.commonservice.getunfixReport(this.userid).then((result) => {
      if (result.success) {
        this.unfixpaymentlist = result.data.unfixpayment;
        this.unfixpaymenttotal = result.data.unfixpaymenttotal;
        this.unfixbooklist = result.data.unfixbook;
        this.unfixbooktotal = result.data.unfixbooktotal;

        this.unfixpaymentlist_len = this.unfixpaymentlist.length;
        this.unfixbooklist_len = this.unfixbooklist.length;
        this.unfixdiffamount = result.data.difftotalamt;
        /*this.dispbookinglist.forEach(function(value, key){
          this.dispbookinglist[key].show = "0";
        });	*/

      }
    });
  }

}
