import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ShowWhen } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { DatePicker } from '@ionic-native/date-picker';

/**
 * Generated class for the TradehistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-tradehistory',
  templateUrl: 'tradehistory.html',

})
export class TradehistoryPage {
  @ViewChild('stepper') stepper;
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

  constructor(private datePicker: DatePicker, private commonservice: CommonServiceProvider, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    var curDate = new Date();
    var numberOfDaysToSub = 9;
    var dd = curDate.getDate();
    var mm = curDate.getMonth() + 1;
    var y = curDate.getFullYear();
    var today = new Date().toISOString().substring(0, 10);
    //var today = new Date(y + "-" + mm + "-" + dd).toISOString().substring(0, 10);
    this.todate = today;

    curDate.setDate(curDate.getDate() - numberOfDaysToSub);
    var ddd = curDate.getDate();
    var mmm = curDate.getMonth() + 1;
    var yy = curDate.getFullYear();
    var exitday = new Date(yy + "-" + mmm + "-" + ddd).toISOString().substring(0, 10);
    this.fromdate = exitday;

    this.getbookingreport();

  }
  /*   changeStep(index: number) {
      this.stepper.selectedIndex = index;
  } */
  displayfromdatepicker() {
    this.getbookingreport();
  }

  displaytodatepicker() {
    this.getbookingreport();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TradehistoryPage');
  }

  moredetails(id) {
    this.dispbookinglist.forEach(function (value, key) {
      if (value.book_no == id) {
        if (value.show_details == "1") {
          value.show_details = "0";
        } else {
          value.show_details = "1";
        }
      }
    });
  }

  getbookingreport() {
    if (this.todate != "" && this.fromdate != "" && this.todate >= this.fromdate) {
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
      this.userid = localStorage.getItem('MAHARAJ_userId');
      console.log("userid: " + this.userid);
      this.commonservice.getBookingReport(this.userid, this.fromdate, this.todate).then((result) => {
        console.log(result);
        if (result.success) {
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
    } else {
      let alert = this.alertCtrl.create({
        title: 'Ratehistory Report',
        message: 'Enter valid date!!!',
        buttons: ['ok']
      });
      alert.present();
    }
  };
}
