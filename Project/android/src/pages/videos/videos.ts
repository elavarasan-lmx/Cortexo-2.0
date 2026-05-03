import { Component } from '@angular/core';
import { IonicPage,Loading, NavController, NavParams,LoadingController } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import {DomSanitizer,SafeResourceUrl} from '@angular/platform-browser'
import { LiveratesProvider } from '../../providers/liverates/liverates';

/**
 * Generated class for the VideosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-videos',
  templateUrl: 'videos.html',
})

export class VideosPage {
  videourl:any=[];
  video_content:any;
  loading: Loading;
  trustedVideoUrl: SafeResourceUrl;
  descriptions:any;
  source:any;
  
  constructor(public navCtrl: NavController,public loadingCtrl: LoadingController,public liverateservice: LiveratesProvider,private dom:DomSanitizer,private commonservice: CommonServiceProvider, public navParams: NavParams) {
  }

  ionViewWillEnter(): void {
    let video_details:any=[];
   this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
  });
  
  
  this.loading.present();
    this.liverateservice.getvideo().subscribe(res=>{
      this.video_content=res;
     
      console.log( this.videourl);
      for(let i  of this.video_content){
        this.trustedVideoUrl=this.dom.bypassSecurityTrustResourceUrl(i.video_id);
        console.log(this.trustedVideoUrl);
        this.descriptions=i.description;
        video_details.push({"url": this.trustedVideoUrl,"description":this.descriptions});
        this.videourl=video_details;
        console.log(this.videourl);
      }

      this.loading.dismiss();
    })
    }
  }