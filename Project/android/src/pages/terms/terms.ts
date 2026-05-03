import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';

/**
 * Generated class for the TermsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-terms',
  templateUrl: 'terms.html',
})
export class TermsPage {
  terms:any = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, private commonservice: CommonServiceProvider) {
    this.commonservice.terms().subscribe( res => {
      this.terms = res['terms']['content']['displaytext'];
    });
  }
}
