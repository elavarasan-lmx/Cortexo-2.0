import { Component,Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController,Events, } from 'ionic-angular';

/**
 * Generated class for the SimcardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-simcard',
  templateUrl: 'simcard.html',
})
export class SimcardPage {
  simdetails:any=[]
  constructor(public viewCtrl: ViewController,private event: Events,public renderer: Renderer,public navCtrl: NavController, public navParams: NavParams) {
    this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'my-popup', true);
    this.simdetails=this.navParams.get('data')
   // alert(JSON.stringify(this.simdetails));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SimcardPage');
  }
  getnumber(i){
    console.log(i);
    this.event.publish('simcard:change',{"simvalue":1})
    let phoneindex
    phoneindex=this.simdetails.find(data=>data.phone==i);
    console.log(phoneindex)
    this.viewCtrl.dismiss(phoneindex);
  }
  closeModal(){
    this.event.publish('simcard:change',{"simvalue":1})
    this.viewCtrl.dismiss();
  }

}
