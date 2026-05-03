import { ChangeDetectorRef, Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { LoginPage } from '../login/login';
import { Observable } from 'rxjs/Observable';

/**
 * Generated class for the UserregotpPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-userregotp',
  templateUrl: 'userregotp.html',
})
export class UserregotpPage {
  public userotpForm: FormGroup;
  public receivedotp: AbstractControl;
  public verifyotp: AbstractControl;
  submitted: any = "";
  errorMessage: any = "";
  isDisabled: any = "";
  countDown;
  counter = 0;
  tick = 1000;
  data: any = '';

  constructor(public cd: ChangeDetectorRef, public navCtrl: NavController, public navParams: NavParams, public builder: FormBuilder, private toastCtrl: ToastController, private commonservice: CommonServiceProvider, public loadingCtrl: LoadingController) {
    this.userotpForm = builder.group({
      'verifyotp': ['', Validators.compose([Validators.required])]
    });
    this.verifyotp = this.userotpForm.controls['verifyotp'];
    var newDateObj = new Date();
    newDateObj.setTime(newDateObj.getTime() + (1 * 60 * 1000));

    var secondBetweenTwoDate = Math.abs((new Date().getTime() - newDateObj.getTime()) / 1000);

    this.counter = secondBetweenTwoDate;
    this.countDown = Observable.timer(0, this.tick)
      .take(this.counter)
      .map(() => {
        this.data = this.counter
        this.cd.detectChanges();
        console.log('count : ' + this.counter)
        console.log(this.data)
        return --this.counter
      })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserregotpPage');
  }

  public onSubmit(values: Object): void {
    this.submitted = true;
    if (this.userotpForm.valid) {
      this.errorMessage = 'Verifying OTP...';
      this.isDisabled = true;
      let loader = this.loadingCtrl.create({
        content: "Please wait..."
      });
      loader.present();

      let otpData = {
        'receivedotp': localStorage.getItem('MAHARAJ_receivedotp'),
        'userdata': localStorage.getItem('MAHARAJ_currentuserregdata')
      }
      let otpverifyData = Object.assign({}, otpData, this.userotpForm.value);

      this.commonservice.doUserRegisterwithOtp(JSON.stringify(otpverifyData)).then(res => {
        if (res) {
          if (res.success) {
            this.errorMessage = res.message;
            let toast = this.toastCtrl.create({
              message: res.message,
              duration: 3000
            });
            toast.present();
            localStorage.setItem('vb_userotp', res.newotp);
            this.navCtrl.setRoot(LoginPage);
          } else {
            let toast = this.toastCtrl.create({
              message: res.message,
              duration: 3000
            });
            this.errorMessage = res.message;
            this.isDisabled = false;
          }
          loader.dismiss();
        }
      }, error => {
        this.isDisabled = false;
        loader.dismiss();
      });
    } else {
      console.log("Invalid Form");
    }
  }

  resendOTP() {
    var newDateObj = new Date();
    newDateObj.setTime(newDateObj.getTime() + (1 * 60 * 1000));

    var secondBetweenTwoDate = Math.abs((new Date().getTime() - newDateObj.getTime()) / 1000);

    this.counter = secondBetweenTwoDate;
    this.countDown = Observable.timer(0, this.tick)
      .take(this.counter)
      .map(() => {
        this.data = this.counter
        this.cd.detectChanges();
        console.log('count : ' + this.counter)
        console.log(this.data)
        return --this.counter
      })
    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    loader.present();

    let currentuserregdata = localStorage.getItem('MAHARAJ_currentuserregdata');
    let parsedData = JSON.parse(currentuserregdata);
    let mobile_no = parsedData.cus_mobile;
    let email = parsedData.cus_email;
    this.commonservice.userresendOTP(mobile_no, email).then(res => {
      if (res) {
        if (res.success) {
          this.errorMessage = res.message;
          let toast = this.toastCtrl.create({
            message: res.message,
            duration: 3000
          });
          toast.present();
          console.log(1);
          localStorage.setItem('MAHARAJ_receivedotp', res.newotp);

          console.log(2);
        } else {
          console.log(3);
          let toast = this.toastCtrl.create({
            message: res.message,
            duration: 3000
          });
          this.errorMessage = res.message;
          this.isDisabled = false;
        }
        loader.dismiss();
      }
    }, error => {
      this.isDisabled = false;
      loader.dismiss();
    });
  }
}
