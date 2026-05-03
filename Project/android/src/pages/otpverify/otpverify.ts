import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Events, NavParams, ToastController, LoadingController, Nav } from 'ionic-angular';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { TabsPage } from '../tabs/tabs';

/**
 * Generated class for the OtpverifyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-otpverify',
    templateUrl: 'otpverify.html',
})
export class OtpverifyPage {
    rootPage: any = TabsPage;
    public otpverifyForm: FormGroup;
    public receivedotp: AbstractControl;
    public submitted: boolean = false;
    isDisabled: boolean = false;
    errorMessage: string = '';
    @ViewChild(Nav) nav: Nav;
    constructor(public navCtrl: NavController, public navParams: NavParams, private event: Events, private builder: FormBuilder, private toastCtrl: ToastController, private commonservice: CommonServiceProvider, public loadingCtrl: LoadingController) {
        this.otpverifyForm = builder.group({
            'receivedotp': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
        });
        this.receivedotp = this.otpverifyForm.controls['receivedotp'];
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad OtpverifyPage');
    }
    public onSubmit(values: Object): void {
        this.submitted = true;
        if (this.otpverifyForm.valid) {
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
                'deviceid': deviceData.uuid,
                'deviceType': deviceData.deviceType
            }
            let verificationData = Object.assign({}, regData, values);
            this.commonservice.doOTPVerify(JSON.stringify(verificationData)).then(res => {
                if (res) {
                    if (res.success) {
                        let requestdata = JSON.stringify({ 'platform': deviceData.platform, 'app_version': deviceData.app_version, 'uuid': deviceData.uuid, 'pushToken': deviceData.pushToken });
                        this.commonservice.settingsData(requestdata).then(rres => {
                            if (rres) {
                                if (!rres.error) {
                                    localStorage.setItem('MAHARAJ_InitialData', JSON.stringify(rres.resultdata));
                                }
                            }
                        }, error => {
                        });

                        this.errorMessage = res.message;
                        let toast = this.toastCtrl.create({
                            message: res.message,
                            duration: 3000
                        });
                        toast.present();
                        this.event.publish('tab:changed', "HomePage");
                        this.navCtrl.setRoot(this.rootPage);
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
    public resendotp() {
        this.submitted = true;
        this.errorMessage = 'Doing Request...';
        this.isDisabled = true;
        let loader = this.loadingCtrl.create({
            content: "Please wait..."
        });
        loader.present();
        let deviceData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
        let regData = {
            'status': 0,
            'pushToken': deviceData.pushToken,
            'deviceid': deviceData.uuid,
            'deviceType': deviceData.deviceType
        }

        this.commonservice.resendOTP(JSON.stringify(regData)).then(res => {
            if (res) {
                if (res.success) {
                    this.errorMessage = res.message;
                    let toast = this.toastCtrl.create({
                        message: res.message,
                        duration: 3000
                    });
                    toast.present();
                    this.isDisabled = false;
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
