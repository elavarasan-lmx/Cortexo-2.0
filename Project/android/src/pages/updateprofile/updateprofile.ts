import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Nav } from 'ionic-angular';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { HomePage } from '../home/home';

@Component({
    selector: 'page-updateprofile',
    templateUrl: 'updateprofile.html',
})

export class UpdateprofilePage {
    public updateprofileForm: FormGroup;
    public name: AbstractControl;
    public company: AbstractControl;
    public email: AbstractControl;
    public address: AbstractControl;
    public submitted: boolean = false;
    isDisabled: boolean = false;
    errorMessage: string = '';
    userid = "";
    userdata: any = [];
    u_name: any = "";
    u_address: any = "";
    u_email: any = "";
    u_company: any = "";
    temp: any = [];
    modaldata: any = [];

    constructor(public navCtrl: NavController, public navParams: NavParams, private builder: FormBuilder, private toastCtrl: ToastController, private commonservice: CommonServiceProvider, public loadingCtrl: LoadingController) {
        this.userdata = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
        this.u_name = this.sanitizeText(this.userdata.name);
        this.u_address = this.sanitizeText(this.userdata.address);
        this.u_email = this.sanitizeEmail(this.userdata.email);
        this.u_company = this.sanitizeText(this.userdata.company_name);

        this.updateprofileForm = builder.group({
            'name': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern('^[a-zA-Z0-9 .,\'-]+$')])],
            'company': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9 .,\'-]+$')])],
            'email': ['', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$')])],
            'address': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(200), Validators.pattern('^[a-zA-Z0-9 .,-/]+$')])],
        });
        this.name = this.updateprofileForm.controls['name'];
        this.company = this.updateprofileForm.controls['company'];
        this.email = this.updateprofileForm.controls['email'];
        this.address = this.updateprofileForm.controls['address'];
    }

    ionViewDidLoad() {
        // Clear error when user edits any field after a failed submit
        this.updateprofileForm.valueChanges.subscribe(() => {
            if (this.errorMessage !== '') {
                this.errorMessage = '';
                this.isDisabled = false;
            }
        });
    }

    // Strip special characters from pre-loaded text values (name/company/address)
    sanitizeText(value: string): string {
        if (!value) return '';
        return value.replace(/[^a-zA-Z0-9 .,'-\/]/g, '');
    }

    // Strip illegal characters from pre-loaded email values
    sanitizeEmail(value: string): string {
        if (!value) return '';
        return value.replace(/[^a-zA-Z0-9@._-]/g, '');
    }

    // Blocks special characters for name/company/address
    noSpecialChars(event: any) {
        const char = event.key;
        if (!/^[a-zA-Z0-9 .,'\-\/]$/.test(char)) {
            event.preventDefault();
        }
    }

    // Email: only allow letters, digits, @ . _ -
    noSpecialCharsEmail(event: any) {
        const char = event.key;
        if (!/^[a-zA-Z0-9@._\-]$/.test(char)) {
            event.preventDefault();
        }
    }

    // Only digits
    onlyNumbers(event: any) {
        const char = event.key;
        if (!/^\d$/.test(char)) {
            event.preventDefault();
        }
    }

    public onSubmit(values: Object): void {
        this.modaldata = values;
        this.submitted = true;
        if (this.updateprofileForm.valid) {
            this.errorMessage = 'Updating Profile...';
            this.isDisabled = true;
            let loader = this.loadingCtrl.create({
                content: "Please wait..."
            });
            loader.present();
            this.userid = localStorage.getItem('MAHARAJ_userId');
            let updateData = {
                userid: this.userid
            }
            let updateProfileData = Object.assign({}, updateData, values);
            this.commonservice.updateProfile(JSON.stringify(updateProfileData)).then(res => {
                if (res) {
                    if (res.success) {
                        this.errorMessage = res.message;
                        this.userdata = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
                        this.temp = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
                        this.temp.name = this.modaldata['name'];
                        this.temp.company_name = this.modaldata['company'];
                        this.temp.email = this.modaldata['email'];
                        this.temp.address = this.modaldata['address'];
                        localStorage.setItem('MAHARAJ_userData', JSON.stringify(this.temp));
                        let toast = this.toastCtrl.create({
                            message: res.message,
                            duration: 3000,
                            position: 'bottom'
                        });
                        toast.present();
                        this.navCtrl.setRoot(HomePage);
                    } else {
                        let toast = this.toastCtrl.create({
                            message: res.message,
                            duration: 3000
                        });
                        toast.present();
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
