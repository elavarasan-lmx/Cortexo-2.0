import { Component } from '@angular/core';
import { IonicPage,Platform, NavController,LoadingController, NavParams,ToastController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CommonServiceProvider } from '../../providers/common-service/common-service';

/**
 * Generated class for the SocialsharePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-socialshare',
  templateUrl: 'socialshare.html',
})
export class SocialsharePage {
share:any=[];
type:any;
socialshare:any;
private headercolor: string = "#FFFFFF";
private headerbgcolor: string = "#000839";
  constructor(public platform: Platform,private commonservice: CommonServiceProvider,private loadingCtrl: LoadingController,private toastCtrl: ToastController,private socialSharing: SocialSharing,public navCtrl: NavController, public navParams: NavParams) {
    if(localStorage.getItem('Adjustfont')!=undefined && localStorage.getItem('Adjustfont')!=null){
			let data=JSON.parse(localStorage.getItem('Adjustfont'))
			this.headerbgcolor=data.headerbgcolor;
			this.headercolor=data.headercolor;
		}
    this.platform.ready()
    .then(() =>{
      if (this.platform.is('android')) {
        this.type={
          "platform_type":1
      }
      }else{
        this.type={
          "platform_type":1
      }
      }
    })
  }

  ionViewDidLoad() {
    this.commonservice.socialsharing(JSON.stringify(this.type)).then(res=>{
      this.share=res.socialshare;
      this.socialshare=JSON.stringify(this.share);
      console.log(this.share);
    })
  }

  shareViaTwitter(){
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    var instamsg= this.share.subject+","+this.share.message + ","+ this.share.link;
    console.log(instamsg);
    this.socialSharing.shareWithOptions( {
      message: this.share.message,
      subject: this.share.subject,
      files: '',
      url: this.share.link,
      chooserTitle: '',
    }).then(()=>{
      loading.dismiss();
    }).catch(()=>{
      loading.dismiss();
      let toast = this.toastCtrl.create( {
        message: "Can't able to share via Instagram",
        duration: 3000,
        position: 'middle'
    } );
    toast.present();
    });
  }

  shareViaWatsapp(){
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    var instamsg= this.share.subject+","+this.share.message + ","+ this.share.link;
    console.log(instamsg);
    this.socialSharing.shareWithOptions( {
      message: this.share.message,
      subject: this.share.subject,
      files: '',
      url: this.share.link,
      chooserTitle: '',
    }).then(()=>{
      loading.dismiss();
    }).catch(()=>{
      loading.dismiss();
      let toast = this.toastCtrl.create( {
        message: "Can't able to share via Instagram",
        duration: 3000,
        position: 'middle'
    } );
    toast.present();
    });
  }

//   shareViaInsta(){
//     let loading = this.loadingCtrl.create({
//       content: 'Please wait...'
//     });
//     loading.present();
// var instamsg= this.share.subject+","+this.share.message + ","+ this.share.link;
// console.log(instamsg);
//     this.socialSharing.shareViaInstagram(instamsg,null).then(()=>{

//     }).catch(()=>{
//       loading.dismiss();
//       let toast = this.toastCtrl.create( {
//         message: "Can't able to share via Instagram",
//         duration: 3000,
//         position: 'middle'
//     } );
//     toast.present();
//     });
//     loading.dismiss();
//   }

shareViaInsta(){
  let loading = this.loadingCtrl.create({
    content: 'Please wait...'
  });
  loading.present();
  var instamsg= this.share.subject+","+this.share.message + ","+ this.share.link;
  console.log(instamsg);
  this.socialSharing.shareWithOptions( {
    message: this.share.message,
    subject: this.share.subject,
    files: '',
    url: this.share.link,
    chooserTitle: '',
  }).then(()=>{
    loading.dismiss();
  }).catch(()=>{
    loading.dismiss();
    let toast = this.toastCtrl.create( {
      message: "Can't able to share via Instagram",
      duration: 3000,
      position: 'middle'
  } );
  toast.present();
  });
  
}

  shareViaFb(){
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    var instamsg= this.share.subject+","+this.share.message + ","+ this.share.link;
    console.log(instamsg);
    this.socialSharing.shareWithOptions( {
      message: this.share.message,
      subject: this.share.subject,
      files: '',
      url: this.share.link,
      chooserTitle: '',
    }).then(()=>{
      loading.dismiss();
    }).catch(()=>{
      loading.dismiss();
      let toast = this.toastCtrl.create( {
        message: "Can't able to share via Instagram",
        duration: 3000,
        position: 'middle'
    } );
    toast.present();
    });
  }
  shareViaEmail(){
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    var instamsg= this.share.subject+","+this.share.message + ","+ this.share.link;
    console.log(instamsg);
    this.socialSharing.shareWithOptions( {
      message: this.share.message,
      subject: this.share.subject,
      files: '',
      url: this.share.link,
      chooserTitle: '',
    }).then(()=>{
      loading.dismiss();
    }).catch(()=>{
      loading.dismiss();
      let toast = this.toastCtrl.create( {
        message: "Can't able to share via Instagram",
        duration: 3000,
        position: 'middle'
    } );
    toast.present();
    });
  }
  
  shareViaMessage(){
    let data =this.share.subject+","+this.share.message+","+this.share.link;
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.socialSharing.shareViaSMS(data,null).then(()=>{

    }).catch(()=>{
      loading.dismiss();
      let toast = this.toastCtrl.create( {
        message: "Can't able to share via Message ",
        duration: 3000,
        position: 'middle'
    } );
    toast.present();
    })
    loading.dismiss();
  }

}
