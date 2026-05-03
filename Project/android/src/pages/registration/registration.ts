import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Nav } from 'ionic-angular';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { OtpverifyPage } from '../otpverify/otpverify';

/**
 * Generated class for the RegistrationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-registration',
    templateUrl: 'registration.html',
})
export class RegistrationPage {
    public registerForm: FormGroup;
    public name: AbstractControl;
    public mobile: AbstractControl;
    public city: AbstractControl;
    public emailid: AbstractControl;
    public company: AbstractControl;
    public submitted: boolean = false;
    isDisabled: boolean = false;
    errorMessage: string = '';
    @ViewChild(Nav) nav: Nav;
    constructor(public navCtrl: NavController, public navParams: NavParams, private builder: FormBuilder, private toastCtrl: ToastController, private commonservice: CommonServiceProvider, public loadingCtrl: LoadingController) {
        this.registerForm = builder.group({
            'name': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
            'mobile': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
            'emailid': [''],
            'city': ['', Validators.compose([Validators.required,])],
            'company': [''],
        });
        this.name = this.registerForm.controls['name'];
        this.mobile = this.registerForm.controls['mobile'];
        this.city = this.registerForm.controls['city'];
        this.emailid = this.registerForm.controls['emailid'];
        this.company = this.registerForm.controls['company'];
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad RegistrationPage');
    }
    public onSubmit(values: Object): void {
        this.submitted = true;
        if (this.registerForm.valid) {
            this.errorMessage = 'Doing Register...';
            this.isDisabled = true;
            let loader = this.loadingCtrl.create({
                content: "Please wait..."
            });
            loader.present();
            let deviceData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
            let regData = {
                'status': 0,
                'pushToken': deviceData.pushToken,
                'uuid': deviceData.uuid,
                'deviceType': deviceData.deviceType
            }
            let Otrdetails = {
                'device_mobileno': this.registerForm.value.mobile,
                'device_user_company': this.registerForm.value.company,
                'device_user_email': this.registerForm.value.emailid,
                'device_user_name': this.registerForm.value.name
            }
            localStorage.setItem("MAHARAJOTR", JSON.stringify(Otrdetails));
            let registrationData = Object.assign({}, regData, values);
            console.log(registrationData);
            this.commonservice.doRegister(JSON.stringify(registrationData)).then(res => {
                if (res) {
                    if (res.success) {
                        this.errorMessage = res.message;
                        let toast = this.toastCtrl.create({
                            message: res.message,
                            duration: 3000
                        });
                        toast.present();
                        this.navCtrl.setRoot(OtpverifyPage);
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
