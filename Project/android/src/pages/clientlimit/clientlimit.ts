import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';

/**
 * Generated class for the ClientlimitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-clientlimit',
  templateUrl: 'clientlimit.html',
})
export class ClientlimitPage {
  userid: any = "";
  clientlimitlist: any = [];
  clientlimitlistt_len: any = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, private commonservice: CommonServiceProvider, public loadingCtrl: LoadingController) {
  }

  ionViewDidEnter() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.userid = localStorage.getItem('MAHARAJ_userId');
    console.log("userid: " + this.userid);
    this.commonservice.getClientLimit(this.userid).then((result) => {
      console.log(result);
      if (result.success) {
        this.clientlimitlist = result.data;
        this.clientlimitlistt_len = this.clientlimitlist.length;
      } else {
        this.clientlimitlist = [];
      }
      loading.dismiss();
    });
  }
}
