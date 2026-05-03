import { Component } from '@angular/core';
import { IonicPage, NavController,LoadingController, NavParams } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { ModalPage } from '../modal/modal';
import { LiveratesProvider } from '../../providers/liverates/liverates';

/**
 * Generated class for the GalleryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-gallery',
  templateUrl: 'gallery.html',
})
export class GalleryPage {
  galleyItems=[];
  marqueetext: any = ""; 
  constructor(public navCtrl: NavController, public navParams: NavParams,private commonservice: CommonServiceProvider,private loadingCtrl: LoadingController,public liverateservice: LiveratesProvider) {
  }

  ionViewWillEnter() {
    let that = this;
    let loader = this.loadingCtrl.create( {
      content: "Please wait..."
  } );
  loader.present();
  this.liverateservice.getmarqueetext().subscribe(res => {
    this.marqueetext = res.marquee;
   // this.booknos = res.booknos;
  });
  this.commonservice.galleryimg().then((data)=>{
    console.log(data);
    that.galleyItems=data;
    console.log(that.galleyItems);
   /*  for(let i=0; i<data.length; i++){
      setTimeout( function() {
        that.galleyItems.push( data[i] );
    }, 0 * i );
    } */

    loader.dismiss();
  });
  }
  openmodal(id,name){
    console.log(id);
    this.navCtrl.push( ModalPage, { location: id,name:name} );
    console.log(location);
  }

}
