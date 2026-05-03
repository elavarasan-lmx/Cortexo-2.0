import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { DatePicker } from '@ionic-native/date-picker';

@Component({
  selector: 'page-ledgerreport',
  templateUrl: 'ledgerreport.html',
})

export class LedgerreportPage {
  disptransactionslist: any = [];
  disptransactions_len: any = 0;
  userid: any = "";
  fromdate: String;
  todate: String;
  currentbalance: any = 0;

  constructor(private datePicker: DatePicker, public navCtrl: NavController, public navParams: NavParams, private commonservice: CommonServiceProvider, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    var curDate = new Date();
    var numberOfDaysToSub = 10;
    var today = new Date(new Date().getTime()).toISOString().substring(0, 10);
    this.todate = today;
    console.log("todate: " + this.todate);

    curDate.setDate(curDate.getDate() - numberOfDaysToSub);
    var dateOffset = (24 * 60 * 60 * 1000) * 10;
    var exitday = new Date(new Date().getTime() - dateOffset).toISOString().substring(0, 10);
    this.fromdate = exitday;
    console.log("fromdate: " + this.fromdate);

    this.getcustomer_transactions();
  }


  displayfromdatepicker() {
    this.getcustomer_transactions();
  }

  displaytodatepicker() {
    this.getcustomer_transactions();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LedgerreportPage');
  }

  getcustomer_transactions() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    this.userid = localStorage.getItem('MAHARAJ_userId');
    this.commonservice.getcustomer_transactions(this.userid, this.fromdate, this.todate).then((result) => {
      if (result.success) {
        loading.dismiss();
        this.currentbalance = result['data']['currentbalance'];
        this.disptransactionslist = result['data']['transactiondata'];
        this.disptransactions_len = this.disptransactionslist.length;
      } else {
        loading.dismiss();
        console.log("ERROR: " + result.success);
      }
    });
  };
}
