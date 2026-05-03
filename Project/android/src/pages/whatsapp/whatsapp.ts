import { Component,Renderer } from '@angular/core';
import { App,IonicPage, NavController, NavParams,Events,  ViewController,ToastController ,LoadingController  } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
/**
 * Generated class for the WhatsappPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-whatsapp',
  templateUrl: 'whatsapp.html',
})
export class WhatsappPage {
  whatsappDetails:any = this.navParams.get('data');
  android:any[] = [];
  constructor( public socialSharing:SocialSharing,public appCtrl: App,public load:LoadingController, public toast:ToastController, public event:Events,public navCtrl: NavController,public renderer: Renderer,public viewCtrl: ViewController, public navParams: NavParams) {
    this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'whatsapp', true);
     console.log(this.whatsappDetails,'=================');
    this.android = this.whatsappDetails.android;
    console.log(this.android,'=================');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WhatsappPage');
  }

  whatsapp(phoneNumber){
console.log(phoneNumber,"tttttttttttttttttt");


      this.socialSharing.shareViaWhatsAppToReceiver(phoneNumber.displaytext,'Hi,',null /* img */,null /* url */).then(() => {
          // Success!
        }).catch((e) => {
          alert("Sorry! Sharing via WhatsApp is not possible");
        });
  }
  closeModal($event) {
    this.navCtrl.pop();
}

}
