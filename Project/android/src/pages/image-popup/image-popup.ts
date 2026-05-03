import { Component, Renderer  } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-image-popup',
  templateUrl: 'image-popup.html',
})
export class ImagePopupPage {
	popupimg:any;
	constructor(public navCtrl: NavController, public navParams: NavParams, public renderer: Renderer, public viewCtrl: ViewController) {
		this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'my-popup', true);
		console.log('ImgURL:', navParams.get('imgurl'));
		this.popupimg = navParams.get('imgurl');
	}

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImagePopupPage');
  }
  closeModal(){
	  this.navCtrl.pop();
  }

}
