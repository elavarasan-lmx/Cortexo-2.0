import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Events, LoadingController } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import ApexCharts from 'apexcharts';
import { LiveratesProvider, BaseURL } from '../../providers/liverates/liverates';
import { BankPage } from '../../pages/bank/bank';
import { AboutPage } from '../../pages/about/about';
import { ContactPage } from '../../pages/contact/contact';
import { TDSPage } from '../../pages/tds/tds';
import { HomePage } from '../../pages/home/home';
declare var rateFeed: any;


@Component({
  selector: 'page-graph',
  templateUrl: 'graph.html',
})
export class GraphPage {
  liverates: any = [];
  live_rates: any = [];
  selected_comid: any = "";
  time: any = '1day';
  chartType: any = 'line';
  chart: any;
  liveratess: any[] = [];
  intervalId: any;
  chartData: { x: Date; y: number }[] = [];
  curcomsellrate: any = "";
  marketstatus: number = 1;
  sell_color: any = "";
  oldliverates: any = [];
  oldData: any;
  commodities: any = [];
  rateFeed: any;
  loader: any = true;
  private rateCache: any = {};

  constructor(
    private commonservice: CommonServiceProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public liverateservice: LiveratesProvider,
    public events: Events,
    private loadingCtrl: LoadingController,
    private zone: NgZone
  ) {
    // this.baserateInit();
    this.fetch_data();
  }

  getChartOptions(seriesData) {
    console.log(seriesData, 'sssss');
    console.log(this.chartType, 'this.chartTypethis.chartType');
    return {
      chart: { type: this.chartType, height: 350 },
      series: seriesData,
      xaxis: { type: 'time', title: { text: 'Time' } },
      yaxis: { title: { text: 'Price(₹)' } }
    };
  }

  showError(message: string) {
    const alert = this.alertCtrl.create({
      title: 'Error',
      message: message,
      buttons: ['OK']
    });
    alert.present();
  }
  ngOnDestroy() {
    clearInterval(this.intervalId);
    if (this.chart) {
      this.chart.destroy();
    }
  }
  getGraphReport() {
    const loading = this.loadingCtrl.create({ content: 'Please wait...' });
    loading.present();

    const data = { hd_code: this.selected_comid, time_period: this.time };
    this.commonservice.getGraphReport(data).then(result => {
      loading.dismiss();
      if (result.success) {
        console.log(result, 'resultresultresult');

        //   const chartData = result.data.map(entry => ({
        //     hd_ask: entry.hd_ask,
        //     hd_bid: entry.hd_bid,
        //     hd_date: entry.hd_date,
        // }));

        this.populateChartData(result.data);
        // this.fetchLiveRates(chartData);
      } else {
        this.showError('Failed to load data');
      }
    }).catch(err => {
      loading.dismiss();
      this.showError('Error fetching graph report: ' + err.message);
    });
  }



  populateChartData(data: any[]) {
    const prices = data.map(item => {
      const dateTime = new Date(item.hd_date.replace(' ', 'T')); // Convert to Date object
      const timeString = dateTime.toLocaleTimeString(); // Get time as a string (e.g., "10:30:03")
      return {
        x: timeString,
        bid: parseFloat(item.hd_bid || 0),
        ask: parseFloat(item.hd_ask || 0),
      };
    });

    console.log(prices, 'price');
    const seriesData = [
      {
        name: 'Ask Prices',
        data: prices.map(item => ({ x: item.x, y: item.ask })),
        color: '#d7b470'
      }
    ];

    console.log(seriesData, 'seriesData');

    const options = this.getChartOptions(seriesData);

    const chartElement = document.querySelector("#chart");
    if (chartElement) {
      if (!this.chart) {
        this.chart = new ApexCharts(chartElement, options);
        this.chart.render();
      } else {
        this.chart.updateSeries(seriesData);
      }
    }
  }

  onCommodityChange() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.getGraphReport();
  }

  ionViewDidEnter() {
    this.selected_comid = 0;
    if (this.liverates.length == 0) {
      let allRates = JSON.parse(localStorage.getItem('MAHARAJ_Liverates')) || [];
      // Filter out commodities with sell rate disabled
      this.liverates = allRates.filter(c => c.selling_rate != '-' && c.selling_rate != '' && c.selling_rate != 0);
      if (this.liverates.length > 0) {
        this.selected_comid = this.liverates[0].com_id;
      }
    }
  }
  ionViewDidLoad() {

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

