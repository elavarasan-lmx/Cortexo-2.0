import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
  
})
export class ModalPage {
  proid: any;
  proname: any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.proid = navParams.get( 'location' );
    this.proname = navParams.get( 'name' );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
  }

}
