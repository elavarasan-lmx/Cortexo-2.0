import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ShowWhen } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { DatePicker } from '@ionic-native/date-picker';

/**
 * Generated class for the PendingdeliveryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-pendingdelivery',
  templateUrl: 'pendingdelivery.html',
})
export class PendingdeliveryPage {
  bookingrequest: any;
  //public comtype:any;
  fromdate: String;
  todate: String;
  allbookinglist = [];
  dispbookinglist = [];
  dispbookinglist_len = 0;
  userid: any = "";
  sd: any = 0;
  show_extra = "0";
  showDiv = 0;
  booktotal: any = "";
  constructor(private datePicker: DatePicker, private commonservice: CommonServiceProvider, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {

    this.getbookingreport();

  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad TradehistoryPage');
  }

  moredetails(id) {
    this.dispbookinglist.forEach(function (value, key) {
      if (value.bookno == id) {
        if (value.show_details == "1") {
          value.show_details = "0";
        } else {
          value.show_details = "1";
        }
      }
    });
  }

  getbookingreport() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.userid = localStorage.getItem('MAHARAJ_userId');
    console.log("userid: " + this.userid);
    this.commonservice.getpendingReport(this.userid).then((result) => {
      console.log(result);
      if (result.success) {
        this.booktotal = result.data.bookiingtotal;
        this.allbookinglist = result.data.bookingdata;
        console.log(this.allbookinglist);
        this.dispbookinglist = result.data.bookingdata;
        this.dispbookinglist_len = this.dispbookinglist.length;
        /*this.dispbookinglist.forEach(function(value, key){
          this.dispbookinglist[key].show = "0";
        });	*/
        console.log(this.dispbookinglist);
      } else {
        this.allbookinglist = [];
      }
      loading.dismiss();
    });
  };
}
