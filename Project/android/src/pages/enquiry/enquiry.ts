import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Nav } from 'ionic-angular';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { SocialsharePage } from "../socialshare/socialshare";

/**
 * Generated class for the EnquiryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-enquiry',
    templateUrl: 'enquiry.html',
})
export class EnquiryPage {
    public enquiryForm: FormGroup;
    public name: AbstractControl;
    public mobile: AbstractControl;
    public address: AbstractControl;
    public emailid: AbstractControl;
    public message: AbstractControl;
    public submitted: boolean = false;
    isDisabled: boolean = false;
    errorMessage: string = '';
    constructor(public navCtrl: NavController, public navParams: NavParams, private builder: FormBuilder, private toastCtrl: ToastController, private commonservice: CommonServiceProvider, public loadingCtrl: LoadingController) {
        this.enquiryForm = builder.group({
            'name': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern('^[^\\s].*[^\\s]$')])],
            'mobile': ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')])],
            'emailid': ['', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$')])],
            'address': ['', Validators.compose([Validators.minLength(4), Validators.maxLength(150), Validators.pattern('^[^\\s].*[^\\s]$')])],
            'message': ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(200), Validators.pattern('^[^\\s].*[^\\s]$')])],
        });
        this.name = this.enquiryForm.controls['name'];
        this.mobile = this.enquiryForm.controls['mobile'];
        this.emailid = this.enquiryForm.controls['emailid'];
        this.address = this.enquiryForm.controls['address'];
        this.message = this.enquiryForm.controls['message'];
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad EnquiryPage');
    }
    public onSubmit(values: Object): void {
        this.submitted = true;
        if (this.enquiryForm.valid) {
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
            let enquiryData = Object.assign({}, regData, values);
            console.log(enquiryData);
            this.commonservice.sendEnquiry(JSON.stringify(enquiryData)).then(res => {
                if (res) {
                    if (res.success) {
                        console.log(1);
                        this.errorMessage = res.message;
                        let toast = this.toastCtrl.create({
                            message: res.message,
                            duration: 3000
                        });
                        toast.present();
                        this.isDisabled = false;
                    } else {
                        console.log(2);
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
    share() {
        this.navCtrl.setRoot(SocialsharePage);
    }
    gotoSocialshare() {
        //this.event.publish('tab:changed', "SocialsharePage");
        this.navCtrl.setRoot(SocialsharePage);
    }
    validateInput(event, field) {
        let value = event.target.value;
        if (field === 'name') {
            value = value.replace(/^\s+/, '').replace(/[^a-zA-Z\s]/g, '').substring(0, 50);
        } else if (field === 'mobile') {
            value = value.replace(/[^0-9]/g, '').substring(0, 10);
        } else if (field === 'email') {
            value = value.replace(/\s/g, '').replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 100);
        } else if (field === 'address') {
            // value = value.replace(/^\s+/, '').replace(/[^a-zA-Z0-9\s,.-]/g, '').substring(0, 200);
            value = value.replace(/^\s+/, '').substring(0, 200);
        } else if (field === 'message') {
            value = value.replace(/^\s+/, '').substring(0, 200);
            // value = value.replace(/^\s+/, '').replace(/[^a-zA-Z0-9\s,.?!-]/g, '').substring(0, 500);
        }
        this.enquiryForm.controls[field === 'email' ? 'emailid' : field].setValue(value);
    }
}
