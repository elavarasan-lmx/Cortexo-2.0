import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ShowWhen, Events } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { DatePicker } from '@ionic-native/date-picker';
import { LiveratesProvider } from '../../providers/liverates/liverates';

import { BankPage } from '../../pages/bank/bank';
import { AboutPage } from '../../pages/about/about';
import { ContactPage } from '../../pages/contact/contact';
import { TDSPage } from '../../pages/tds/tds';
import { HomePage } from '../../pages/home/home';
declare var rateFeed: any;


/**
 * Generated class for the HistoricalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-historical',
  templateUrl: 'historical.html',
})
export class HistoricalPage {
  fromdate: String;
  todate: String;
  ratehistory = [];
  ratehistory_len = 0;
  userid: any = "";
  liverates: any = [];
  live_rates: any = [];
  selected_comid: number = 0;
  marketstatus: number = 1;
  curcomsellrate: any = "";
  sell_color: any = "";
  oldliverates: any = [];
  oldData: any;
  commodities: any = [];
  rateFeed: any;
  loader: any = true;
  private rateCache: any = {};

  constructor(private datePicker: DatePicker, private commonservice: CommonServiceProvider, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public events: Events,
    public liverateservice: LiveratesProvider, private zone: NgZone
  ) {
    var curDate = new Date();
    console.log(curDate);
    var numberOfDaysToSub = 9;
    var dd = curDate.getDate();
    var mm = curDate.getMonth() + 1;
    var y = curDate.getFullYear();
    var today = new Date().toISOString().substring(0, 10);
    this.todate = today;

    curDate.setDate(curDate.getDate() - numberOfDaysToSub);
    console.log(curDate);
    var ddd = curDate.getDate();
    var mmm = curDate.getMonth() + 1;
    var yy = curDate.getFullYear();
    var exitday = new Date(yy + "-" + mmm + "-" + ddd).toISOString().substring(0, 10);
    this.fromdate = exitday;
    // this.loadCommodityList();
    this.fetch_data();
    // this.baserateInit();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HistoricalPage');
  }
  getHistoricalReport() {
    if (this.todate != "" && this.fromdate != "" && this.todate >= this.fromdate) {
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
      this.commonservice.getHistoricalReport(this.selected_comid, this.fromdate, this.todate).then((result) => {
        console.log(result);
        if (result.success) {
          this.ratehistory = result.data.historicaldata;
          console.log(this.ratehistory, '4223232');
          this.ratehistory_len = this.ratehistory.length;
          console.log(this.ratehistory_len, '1234567');
        } else {
          this.ratehistory = [];
        }
        loading.dismiss();
      });
    } else {
      let alert = this.alertCtrl.create({
        title: 'Historical Report',
        message: 'Enter valid date!!!',
        buttons: ['ok']
      });
      alert.present();
    }
  };
  ionViewDidEnter() {
    this.selected_comid = 0;
    if (this.liverates.length == 0) {
      let allRates = JSON.parse(localStorage.getItem('MAHARAJ_Liverates')) || [];
      // Filter out commodities with sell rate disabled
      this.liverates = allRates.filter(c => c.selling_rate != '-' && c.selling_rate != '' && c.selling_rate != 0);
      console.log(this.liverates, 'this.liverates ');

      if (this.liverates.length > 0) {
        this.selected_comid = this.liverates[0].com_id;
      }
    }
  }
  // ionViewWillLeave(): void {
  //   this.events.unsubscribe('liverate:changed');
  // }
  // loadCommodityList() {
  //   this.commonservice.getcommoditylist().subscribe(res => {
  //     this.liverates = res['data']['comlist'];
  //     const uniqueLiverates = this.liverates.filter((value, index, self) =>
  //       index === self.findIndex((t) => (
  //         t.com_id === value.com_id
  //       ))
  //     );
  //     this.liverates = uniqueLiverates;
  //     if (this.liverates.length > 0) {
  //       this.selected_comid = this.liverates[0].com_id;
  //     }
  //   });
  // }
  ionViewWillEnter(): void {
    // this.events.subscribe('liverate:changed', (liverate) => {
    //   this.live_rates = liverate;
    //   console.log(this.live_rates,'this.liveratesthis.liveratesthis.liverates');

    //   if (this.selected_comid != 0 && this.marketstatus == 1) {
    //     let selectedcomid = this.selected_comid;
    //     let currentrate: any;
    //     let sell_color: any;
    //     this.live_rates.forEach(function (rcval, rckey) {
    //       if (rcval['com_id'] == selectedcomid) {
    //         currentrate = rcval['selling_rate'];
    //         sell_color = rcval['currentsell'];
    //       }
    //     });
    //     this.curcomsellrate = currentrate;
    //     this.sell_color = sell_color;
    //   } else {
    //     this.curcomsellrate = "-";
    //   }
    // });
  }
  // fetch_data() {
  //   if (rateFeed === 3) {
  //     this.liverateservice.getRateUpdates().subscribe(data => {
  //       this.zone.run(() => {
  //         if (data != null) {
  //           this.loader = false;
  //           this.baserateInit(data);
  //         }
  //       });
  //     });
  //   } else if (rateFeed === 0 || rateFeed === 1 || rateFeed === 2) {
  //     this.liverateservice.getrfcallback((data) => {
  //       this.loader = false;
  //       this.baserateInit(data);
  //     });
  //   }
  // }

  fetch_data() {
    if (rateFeed === 3) {
      this.liverateservice.getRateUpdates().subscribe(data => {
        this.zone.run(() => {
          if (data != null) {
            this.baserateInit(data);
          }
        });
      });
    } else {
      this.liverateservice.getrfcallback((data) => {
        this.zone.run(() => {
          this.baserateInit(data);
        });
      });
    }
  }
  baserateInit(data) {
    // Detect format: pipe-delimited (native WebSocket) vs tab-delimited (API/Socket.IO)
    let isPipeFormat = (typeof data === 'string') && data.indexOf('|') !== -1 && data.indexOf('\t') === -1;

    if (isPipeFormat) {
      this.baserateInitPipe(data);
      return;
    }

    // Original tab-delimited format
    let messagesDesktopp = data.split("\n");
    if (typeof this.oldData != "undefined") {
    } else {
      this.oldData = data.toString();
    }
    var messagesOldDesktop = this.oldData.split("\n");
    let currentliverates: any = [];
    let selectedcomid = this.selected_comid;

    for (var i = 0; i < messagesDesktopp.length; i++) {
      var liveretDesktop = messagesDesktopp[i].split("\t");
      var liveoldRetDesktop;
      if (messagesOldDesktop[i] !== undefined) {
        liveoldRetDesktop = messagesOldDesktop[i].split("\t");
      } else {
        liveoldRetDesktop = liveretDesktop;
      }

      if (typeof liveretDesktop[1] != "undefined") {
        if (liveretDesktop[0] == 3) {
          if (liveretDesktop[1] == selectedcomid) {
            let selling_rate: any = 0;
            let buying_rate: any = 0;
            selling_rate = liveretDesktop[4];
            buying_rate = liveretDesktop[3];
            if (buying_rate != "-" || selling_rate != "-") {
              currentliverates.push({
                selling_rate: selling_rate,
              });
            }
          }
        }
      }
    }
    if (typeof this.live_rates != "undefined") {
    } else {
      this.oldliverates = this.live_rates;
    }
    this.oldliverates = Object.create(this.live_rates);
    this.live_rates = currentliverates;

    if (
      this.oldliverates == "" ||
      this.oldliverates == undefined ||
      this.oldliverates == null ||
      this.oldliverates.length != this.live_rates.length
    ) {
      this.oldliverates = this.live_rates;
    }

    this.oldData = data.toString();
  }

  /**
   * Handle pipe-delimited data from native WebSocket
   * Format: type|field1|field2|...
   * Type 3: Commodity rates — 3|com_id|buy|sell
   */
  baserateInitPipe(data: string) {
    let lines = data.split("\n");

    // Merge incoming lines into rateCache (accumulate partial updates)
    for (let i = 0; i < lines.length; i++) {
      let r = lines[i].split("|");
      if (r[1] === undefined) continue;
      let key = r[0] + '|' + r[1];

      if (this.rateCache[key]) {
        let cached = this.rateCache[key].split("|");
        for (let j = 0; j < r.length; j++) {
          if (r[j] !== undefined && r[j] !== '') {
            cached[j] = r[j];
          }
        }
        this.rateCache[key] = cached.join("|");
      } else {
        this.rateCache[key] = lines[i];
      }
    }

    // Rebuild from full cache
    let allLines: string[] = [];
    for (let key in this.rateCache) {
      allLines.push(this.rateCache[key]);
    }

    let currentliverates: any = [];
    let selectedcomid = this.selected_comid;

    for (let i = 0; i < allLines.length; i++) {
      let r = allLines[i].split("|");
      if (r[1] === undefined) continue;

      // Type 3: Commodity rates — 3|com_id|buy|sell
      if (r[0] == '3') {
        if (r[1] == String(selectedcomid)) {
          let selling_rate: any = r[3] || 0;
          let buying_rate: any = r[2] || 0;
          if (buying_rate != "-" || selling_rate != "-") {
            currentliverates.push({
              selling_rate: selling_rate,
            });
          }
        }
      }
    }

    this.oldliverates = Object.create(this.live_rates);
    this.live_rates = currentliverates;

    if (
      this.oldliverates == "" ||
      this.oldliverates == undefined ||
      this.oldliverates == null ||
      this.oldliverates.length != this.live_rates.length
    ) {
      this.oldliverates = this.live_rates;
    }
  }

  gotoHomePage() {
    this.events.publish('tab:changed', "HomePage");
    this.navCtrl.setRoot(HomePage, {});
  }
  gotoAboutPage() {
    this.events.publish('tab:changed', "AboutPage");
    this.navCtrl.setRoot(AboutPage, {});
  }
  gotoContactPage() {
    this.events.publish('tab:changed', "ContactPage");
    this.navCtrl.setRoot(ContactPage, {});
  }
  gotoBankPage() {
    this.events.publish('tab:changed', "BankPage");
    this.navCtrl.setRoot(BankPage, {});
  }
  gotoTCSTDSPage() {
    this.events.publish('tab:changed', "TDSPage");
    this.navCtrl.setRoot(TDSPage, {});
  }
}
