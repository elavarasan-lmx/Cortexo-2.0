import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, Platform, Events, ActionSheetController, LoadingController, Nav } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagePicker } from '@ionic-native/image-picker';
import { HomePage } from '../home/home';

import { normalizeURL } from 'ionic-angular';
declare var cordova: any;

/**
 * Generated class for the KycPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-kyc',
  templateUrl: 'kyc.html',
})
export class KycPage {
  public targetPaths: any = [];
  public targetPaths1: any = [];
  public targetPaths2: any = [];
  public targetPaths3: any = [];
  public images: any = [];
  public filenames = [];
  deletephotos: any[] = [];
  lastImage: string = null;
  loader: any;
  type: any = 1;
  imgpaths: any = [];
  GSTpattern: string = "";
  PANpattern: string = "";
  count = 1;
  pickedimg: any = [];
  errorMessage: string = '';
  public registrationForm: FormGroup;
  public cus_company_name: AbstractControl;
  public cus_address: AbstractControl;
  public cus_name: AbstractControl;
  public cus_mobile: AbstractControl;
  public cus_name2: AbstractControl;
  public cus_mobile2: AbstractControl;
  public cus_phone1: AbstractControl;
  public cus_phone2: AbstractControl;
  public cus_res_phone: AbstractControl;
  public cus_email: AbstractControl;
  public cus_bnkname: AbstractControl;
  public cus_bnkbranch: AbstractControl;
  public cus_accno: AbstractControl;
  public cus_ifsc: AbstractControl;
  public gst_no: AbstractControl;
  public cus_ref: AbstractControl;
  public cus_panno: AbstractControl;
  public attachment: any[] = [];
  private win: any = window;
  isDisabled: boolean = false;
  userdata: any;
  constructor(public navCtrl: NavController, public platform: Platform, private event: Events, private imagePicker: ImagePicker, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, private camera: Camera, private domSanitizer: DomSanitizer, public navParams: NavParams, private builder: FormBuilder, private toastCtrl: ToastController, private commonservice: CommonServiceProvider, public loadingCtrl: LoadingController) {
    this.userdata = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
    this.registrationForm = builder.group({
      'cus_company_name': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'cus_address': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'cus_name': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'cus_mobile': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      'cus_name2': [''],
      'cus_ref': [''],
      'cus_mobile2': [''],
      'cus_phone1': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      'cus_phone2': [''],
      'cus_res_phone': [''],
      'cus_email': ['', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$')])],
      'cus_bnkname': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'cus_accno': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'cus_bnkbranch': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'cus_ifsc': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'cus_panno': ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
      'gst_no': ['', Validators.compose([Validators.required, Validators.minLength(15), Validators.maxLength(15)])],
    });
    this.cus_company_name = this.registrationForm.controls['cus_company_name'];
    this.cus_address = this.registrationForm.controls['cus_address'];
    this.cus_name = this.registrationForm.controls['cus_name'];
    this.cus_mobile = this.registrationForm.controls['cus_mobile'];
    this.cus_name2 = this.registrationForm.controls['cus_name2'];
    this.cus_mobile2 = this.registrationForm.controls['cus_mobile2'];
    this.cus_phone1 = this.registrationForm.controls['cus_phone1'];
    this.cus_phone2 = this.registrationForm.controls['cus_phone2'];
    this.cus_res_phone = this.registrationForm.controls['cus_res_phone'];
    this.cus_email = this.registrationForm.controls['cus_email'];
    this.cus_bnkname = this.registrationForm.controls['cus_bnkname'];
    this.cus_accno = this.registrationForm.controls['cus_accno'];
    this.cus_bnkbranch = this.registrationForm.controls['cus_bnkbranch'];
    this.cus_ifsc = this.registrationForm.controls['cus_ifsc'];
    this.cus_panno = this.registrationForm.controls['cus_panno'];
    this.gst_no = this.registrationForm.controls['gst_no'];
    this.cus_ref = this.registrationForm.controls['cus_ref'];
  }

  ionViewDidLoad() {
    this.userdata = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
    console.log('ionViewDidLoad KycPage', this.userdata);
  }
  public onSubmit(values: Object): void {
    if (this.registrationForm.valid) {
      this.errorMessage = 'Processing....';
      this.isDisabled = true;
      let loader = this.loadingCtrl.create({
        content: "Please wait..."
      });
      loader.present();
      let deviceData = JSON.parse(localStorage.getItem('WLPUSHBUDeviceData'));
      let uploadFile = {
        "attachments": this.attachment,
      }
      let userid = {
        'userid': this.userdata.userid
      }
      let registrationData = Object.assign({}, values, uploadFile, userid);
      console.log(JSON.stringify(registrationData));
      this.commonservice.doKYCRegister(JSON.stringify(registrationData)).then(res => {
        this.errorMessage = res.message;
        let toast = this.toastCtrl.create({
          message: res.message,
          duration: 3000
        });
        toast.present();
        loader.dismiss()
        this.event.publish('tab:changed', "HomePage");
        this.navCtrl.setRoot(HomePage, {});
      })
    } else {
      this.errorMessage = "please Enter the required field"
    }
  }

  load() {

    this.loader = this.loadingCtrl.create({
      content: "Uploading..."
    });
    this.loader.present();
  }

  deletePhoto(index, e) {
    this.type = e;
    console.log("type===============>" + e)
    console.log("this.type===========" + this.type)
    let confirm = this.alertCtrl.create({
      title: 'Message',
      message: 'Sure you want to delete this photo? There is no undo!',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        }, {
          text: 'Yes',
          handler: () => {
            console.log('Agree clicked');
            if (this.type == 1) {
              this.targetPaths.splice(index, 1);
            } else if (this.type == 2) {
              this.targetPaths1.splice(index, 1);
            } else if (this.type == 3) {
              this.targetPaths2.splice(index, 1);
            } else {
              this.targetPaths3.splice(index, 1);
            }
            this.attachment.splice(index, 1);
            this.filenames.splice(index, 1);
            this.deletephotos.push(this.filenames[index])
            this.lastImage == '';
          }
        }
      ]
    });
    confirm.present();
  }
  public presentActionSheet(e) {
    this.type = e;
    console.log("this.type" + this.type)
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Gallery',
          handler: () => {
            this.loadgallery(this.type);
          }
        },
        {
          text: 'Take Picture',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  loadgallery(type) {
    this.type = type;
    var options = {
      maximumImagesCount: 10,
      width: 500,
      height: 500,
      quality: 80
    };

    let filePath
    const reader = new FileReader();
    let win: any = window;
    this.imagePicker.getPictures({
      maximumImagesCount: 5,
      outputType: 1
    }).then(selectedImg => {
      console.log(selectedImg)
      selectedImg.forEach((i) => {
        if (this.type == 1) {
          this.targetPaths.push("data:image/jpeg;base64," + i)
          //this.targetPaths=this.webview.convertFileSrc(this.targetPaths)
        } else if (this.type == 2) {
          this.targetPaths1.push("data:image/jpeg;base64," + i)
          ///this.targetPaths1=this.webview.convertFileSrc(this.targetPaths1)
          console.log("this.type" + this.images)
        } else if (this.type == 3) {
          this.targetPaths2.push("data:image/jpeg;base64," + i)
          //this.targetPaths2=this.webview.convertFileSrc(this.targetPaths2)
        } else {
          this.targetPaths3.push("data:image/jpeg;base64," + i)
        }
      });

      for (var i = 0; i < selectedImg.length; i++) {
        let temp: any;
        if (this.type == 1) {
          temp = { 'cus_tincopy': selectedImg[i] };
          //this.targetPaths=this.webview.convertFileSrc(this.targetPaths)
        } else if (this.type == 2) {
          console.log("this.type" + this.type)
          temp = { 'cus_pancopy': selectedImg[i] };
          ///this.targetPaths1=this.webview.convertFileSrc(this.targetPaths1)
          console.log("this.type" + this.type)
        } else if (this.type == 3) {
          temp = { 'cus_addrcopy': selectedImg[i] };
          //this.targetPaths2=this.webview.convertFileSrc(this.targetPaths2)
        } else {
          temp = { 'cus_dealcopy': selectedImg[i] };
        }
        this.commonservice.uploadedit(temp).then(result => {
          let res = result['response']['imgname'];
          this.attachment.push(res);
          this.loader.dismissAll();
        });
      }

    })

  }
  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: sourceType,
      targetWidth: 1024,
      targetHeight: 768,
      saveToPhotoAlbum: false,
      allowEdit: true

    };
    // Get the data of an image
    if (sourceType === this.camera.PictureSourceType.CAMERA) {

      this.camera.getPicture(options).then((imagePaths) => {
        //  if ( this.platform.is( 'android' ) && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY ) {
        this.imgpaths = 'data:image/jpeg;base64,' + imagePaths;
        if (this.type == 1) {
          this.targetPaths.push(this.imgpaths)
          //this.targetPaths=this.webview.convertFileSrc(this.targetPaths)
        } else if (this.type == 2) {
          this.targetPaths1.push(this.imgpaths)
          ///this.targetPaths1=this.webview.convertFileSrc(this.targetPaths1)
          console.log("this.type" + this.type)
        } else if (this.type == 3) {
          this.targetPaths2.push(this.imgpaths)
          //this.targetPaths2=this.webview.convertFileSrc(this.targetPaths2)
        } else {
          this.targetPaths3.push(this.imgpaths)
        }
        let temp: any;
        if (this.type == 1) {
          temp = { 'cus_tincopy': imagePaths };
          //this.targetPaths=this.webview.convertFileSrc(this.targetPaths)
        } else if (this.type == 2) {
          console.log("this.type" + this.type)
          temp = { 'cus_pancopy': imagePaths };
          ///this.targetPaths1=this.webview.convertFileSrc(this.targetPaths1)
          console.log("this.type" + this.type)
        } else if (this.type == 3) {
          temp = { 'cus_addrcopy': imagePaths };
          //this.targetPaths2=this.webview.convertFileSrc(this.targetPaths2)
        } else {
          temp = { 'cus_dealcopy': imagePaths };
        }
        console.log("attach=========" + this.attachment);
        this.commonservice.uploadedit(temp).then(result => {
          let res = result['response']['imgname'];
          if (res !== null) {
            this.attachment.push(res);
          } else {
            console.log("attach=========" + this.attachment);
          }
          console.log("attach=========" + this.attachment);

        });


      }, (err) => {
        this.presentToast('Error while selecting image.');
      })
    }
  }

  // Create a new name for the image
  /* private createFileName() {
    var d = new Date(),
        n = d.getTime(),
        newFileName = n + ".jpg";
    return newFileName;
  } */


  // Copy the image to a local folder
  /* private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
        this.lastImage = newFileName;
        if(this.type==1){
          this.targetPaths.push(this.pathForImage(this.lastImage));
        //this.targetPaths=this.webview.convertFileSrc(this.targetPaths)
        }else if(this.type==2){
          this.targetPaths1.push(this.pathForImage(this.lastImage));
      //this.targetPaths1=this.webview.convertFileSrc(this.targetPaths1)
        }else{
          this.targetPaths2.push(this.pathForImage(this.lastImage));
        ///this.targetPaths2=this.webview.convertFileSrc(this.targetPaths2)
        }
        this.filenames.push(this.lastImage);
        this.uploadImage();
    }, error => {
        this.presentToast('Error while storing file.');
    });
  } */
  /* private copyFileToLocalDirg(namePath, currentName, newFileName, i) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
        this.lastImage = newFileName;
        this.targetPaths.push(this.pathForImage(this.lastImage));
        this.filenames.push(this.lastImage);
        this.uploadImageg(i);
    }, error => {
        this.presentToast('Error while storing file.');
    });
  } */
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }



  toLocaleUpperCase(value) {
    this.GSTpattern = value;
    if (this.GSTpattern.length > 15)
      console.log(this.GSTpattern.length);
    this.PANpattern = value;
  }

}