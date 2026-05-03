import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Nav, Events } from 'ionic-angular';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { LoginPage } from '../login/login';

/**
 * Generated class for the ChangepasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-changepassword',
  templateUrl: 'changepassword.html',
})
export class ChangepasswordPage {
  public changepasswordForm: FormGroup;
  public oldpassword: AbstractControl;
  public newpassword: AbstractControl;
  public confirmpassword: AbstractControl;

  public submitted: boolean = false;
  isDisabled: boolean = false;
  errorMessage: string = '';
  public showPass = false;
  public typecheck = 'password';
  public showoPass = false;
  public typeocheck = 'password';
  public showcPass = false;
  public ctypecheck = 'password';
  public clearedit = false;
  public clearedit1 = false;
  public clearedit2 = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events, private builder: FormBuilder, private toastCtrl: ToastController, private commonservice: CommonServiceProvider, public loadingCtrl: LoadingController) {
    this.changepasswordForm = builder.group({
      'oldpassword': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(15), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,15}$')])],
      'newpassword': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(15), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,15}$')])],
      'confirmpassword': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(15), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,15}$')])],
    }, { validator: this.checkIfMatchingPasswords('newpassword', 'confirmpassword') });
    this.oldpassword = this.changepasswordForm.controls['oldpassword'];
    this.newpassword = this.changepasswordForm.controls['newpassword'];
    this.confirmpassword = this.changepasswordForm.controls['confirmpassword'];
  }
  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value && passwordConfirmationInput.value !== "") {
        this.errorMessage = "Password and confirmpassword should be same";
        return passwordConfirmationInput.setErrors({ notEquivalent: true })
      }
      else {
        this.errorMessage = "";
        return passwordConfirmationInput.setErrors(null);
      }
    }
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ChangepasswordPage');
  }
  hasUpperCase(v: string): boolean { return /[A-Z]/.test(v || ''); }
  hasNumber(v: string): boolean { return /[0-9]/.test(v || ''); }
  hasSpecialChar(v: string): boolean { return /[!@#$%^&*(),.?:{}|<>]/.test(v || ''); }
  validLength(v: string): boolean { return (v || '').length >= 6 && (v || '').length <= 15; }

  showoPassword() {
    this.showoPass = !this.showoPass;

    if (this.showoPass) {
      this.typeocheck = 'text';
      this.clearedit2 = true;
    } else {
      this.typeocheck = 'password';
      this.clearedit2 = false;
    }
  }
  showPassword() {
    this.showPass = !this.showPass;

    if (this.showPass) {
      this.typecheck = 'text';
      this.clearedit1 = true;
    } else {
      this.typecheck = 'password';
      this.clearedit1 = false;
    }
  }
  showcPassword() {
    this.showcPass = !this.showcPass;

    if (this.showcPass) {
      this.ctypecheck = 'text';
      this.clearedit = true;
    } else {
      this.ctypecheck = 'password';
      this.clearedit = false;
    }
  }
  public onSubmit(values: Object): void {
    this.submitted = true;
    if (this.changepasswordForm.valid) {
      this.errorMessage = 'Changing Password...';
      this.isDisabled = true;
      let loader = this.loadingCtrl.create({
        content: "Please wait..."
      });
      loader.present();

      let changeData = {
        'userid': localStorage.getItem('MAHARAJ_userId')
      }
      let changepasswordData = Object.assign({}, changeData, values);
      this.commonservice.changePassword(JSON.stringify(changepasswordData)).then(res => {
        if (res) {
          if (res.success) {
            this.errorMessage = res.message;
            let toast = this.toastCtrl.create({
              message: res.message,
              duration: 3000
            });
            toast.present();
            this.events.publish('tab:changed', "LoginPage");
            this.navCtrl.setRoot(LoginPage);
          } else {
            //this.commonservice.showAlertMSG( 2, res.message );
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

}
