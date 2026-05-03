import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Events, ViewController, ToastController, LoadingController, MenuController } from 'ionic-angular';
import { concatStatic } from 'rxjs/operator/concat';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';

/**
 * Generated class for the VerifytermsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-verifyterms',
  templateUrl: 'verifyterms.html',
})
export class VerifytermsPage {
  terms: any = [];
  constructor(public navCtrl: NavController, public events: Events, public navParams: NavParams, public modalCtrl: ModalController, public menuCtrl: MenuController, public loadingCtrl: LoadingController, private toastCtrl: ToastController, private commonservice: CommonServiceProvider, public renderer: Renderer, public viewCtrl: ViewController) {
    this.menuCtrl.enable(false, 'myMenu');
    /*  this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'my-popup1', true); */
    this.commonservice.terms1().subscribe(res => {
      this.terms = res['terms']['content']['displaytext'];
      console.log(this.terms)
    });
  }
  agree() {
    localStorage.setItem('MAHARAJ_loginstatus', "1");
    localStorage.setItem('MAHARAJ_userlogged', "1");
    localStorage.setItem("accept_terms", "1")
    this.events.publish('tab:changed', "HomePage");
    this.navCtrl.setRoot(HomePage, {});
  }
  close() {
    localStorage.setItem('MAHARAJ_loginstatus', "0");
    localStorage.setItem("accept_terms", "2")
    this.events.publish('tab:changed', "LoginPage");
    this.navCtrl.setRoot(LoginPage, {});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VerifytermsPage');
  }

}
