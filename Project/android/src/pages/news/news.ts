import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LiveratesProvider } from '../../providers/liverates/liverates';

/**
 * Generated class for the NewsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-news',
  templateUrl: 'news.html',
})
export class NewsPage {
  newslist:any;
  newsdetails:any;
  constructor(public navCtrl: NavController,public liverateservice: LiveratesProvider, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.liverateservice.getnews().subscribe(res=>{
      console.log(res);
      this.newslist= res;
    })
  }

}
