import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Events, NavParams, ToastController, AlertController, ModalController, LoadingController, Nav } from 'ionic-angular';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { OtpverifyPage } from '../otpverify/otpverify';
import { UserregotpPage } from '../userregotp/userregotp';
import { LoginPage } from '../login/login';
import { TermsPage } from '../terms/terms';
import { Sim } from '@ionic-native/sim';
import { SimcardPage } from '../simcard/simcard';
// import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';
declare var cordova: any;



/**
 * Generated class for the RegistrationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
    selector: 'page-user_registration',
    templateUrl: 'user_registration.html',
})
export class User_registrationPage {
    public registrationForm: FormGroup;
    public name: AbstractControl;
    public cus_address: AbstractControl;
    public mobile: AbstractControl;
    public whatsappno: AbstractControl;
    //public city: AbstractControl;
    public email: AbstractControl;
    public company: AbstractControl;
    public Pan_no: AbstractControl;
    public company_GST: AbstractControl;
    public password: AbstractControl;
    public confirmpassword: AbstractControl;
    public dummy_accept: AbstractControl;
    public submitted: boolean = false;
    isDisabled: boolean = false;
    errorMessage: string = '';
    pswderror: string = '';
    @ViewChild(Nav) nav: Nav;
    public authorization: any = [];
    public showPass = false;
    public typecheck = 'password';
    public showcPass = false;
    public ctypecheck = 'password';
    public clearedit = false;
    public clearedit1 = false;
    GSTpattern: string = "";
    PANpattern: string = "";
    otrdata: any;
    public options: AbstractControl;
    public default_select: number = 1;
    tcstdshint: string = '';



    constructor(/* private inAppBrowser: InAppBrowser, */ public navCtrl: NavController, public modalCtrl: ModalController, public alertCtrl: AlertController, public navParams: NavParams, private builder: FormBuilder, private toastCtrl: ToastController, private commonservice: CommonServiceProvider, public events: Events, public loadingCtrl: LoadingController) {

        console.log('ionViewDidLoad RegistrationPage');
        this.otrdata = JSON.parse(localStorage.getItem("MAHARAJOTR"));
        this.registrationForm = builder.group({
            'name': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern('^[a-zA-Z0-9 .,-]+$')])],
            'mobile': ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
            'whatsappno': ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
            'email': ['', Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$')])],
            'cus_address': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(200), Validators.pattern('^[a-zA-Z0-9 .,-/]+$')])],
            'company': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9 .,-]+$')])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(15), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,15}$')])],
            'dummy_accept': [''],
            // 'Pan_no': ['', Validators.compose([ Validators.minLength(10), Validators.maxLength(10),Validators.pattern("^[A-Z]{5}[0-9]{4}[A-Z]{1}$")])],
            'company_GST': ['', Validators.compose([Validators.required, Validators.minLength(15), Validators.maxLength(15)])],
            // 'options': ['', Validators.compose([Validators.required])],
            'confirmpassword': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(15), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,15}$')])],
        }, { validator: this.checkIfMatchingPasswords('password', 'confirmpassword') });
        this.name = this.registrationForm.controls['name'];
        this.mobile = this.registrationForm.controls['mobile'];
        this.cus_address = this.registrationForm.controls['cus_address'];
        this.whatsappno = this.registrationForm.controls['whatsappno'];
        this.email = this.registrationForm.controls['email'];
        // this.Pan_no = this.registrationForm.controls['Pan_no'];
        this.company_GST = this.registrationForm.controls['company_GST'];
        this.company = this.registrationForm.controls['company'];
        this.password = this.registrationForm.controls['password'];
        this.confirmpassword = this.registrationForm.controls['confirmpassword'];
        this.dummy_accept = this.registrationForm.controls['dummy_accept'];
        // this.options = this.registrationForm.controls['options'];
        this.authorization.terms = false;
    }

    // checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    //     return (group: FormGroup) => {
    //         let passwordInput = group.controls[passwordKey],
    //             passwordConfirmationInput = group.controls[passwordConfirmationKey];
    //         if (passwordInput.value !== passwordConfirmationInput.value && passwordConfirmationInput.value !== "") {
    //             this.pswderror = "Password and confirm password should be same";
    //             return passwordConfirmationInput.setErrors({ notEquivalent: true })
    //         }
    //         else {
    //             this.pswderror = "";
    //             return passwordConfirmationInput.setErrors(null);
    //         }
    //     }
    // }
    checkIfMatchingPasswords(passwordKey: string, confirmPasswordKey: string) {
        return (group: FormGroup) => {
            let password = group.controls[passwordKey];
            let confirmPassword = group.controls[confirmPasswordKey];

            if (password.value !== confirmPassword.value) {
                confirmPassword.setErrors({ notMatching: true });
            } else {
                // IMPORTANT: keep required error if the field is empty
                if (!confirmPassword.value) {
                    confirmPassword.setErrors({ required: true });
                } else {
                    confirmPassword.setErrors(null);
                }
            }
        };
    }
    ionViewDidLoad() {
        this.commonservice.gettdsvalues().subscribe(res => {
            this.tcstdshint = res['tcstds_hint'];
        });
        // Clear error message when user modifies any field after a failed submit
        this.registrationForm.valueChanges.subscribe(() => {
            if (this.errorMessage !== '') {
                this.errorMessage = '';
                this.isDisabled = false;
            }
        });
    }
    gotoLoginPage() {
        this.navCtrl.push(LoginPage);
    }
    gotoTermsPage() {
        this.navCtrl.push(TermsPage);
    }

    hasUpperCase(v: string): boolean { return /[A-Z]/.test(v || ''); }
    hasNumber(v: string): boolean { return /[0-9]/.test(v || ''); }
    hasSpecialChar(v: string): boolean { return /[!@#$%^&*(),.?:{}|<>]/.test(v || ''); }
    validLength(v: string): boolean { return (v || '').length >= 6 && (v || '').length <= 15; }

    // Blocks special characters on keypress for name/company/address fields
    noSpecialChars(event: any) {
        const char = event.key;
        if (!/^[a-zA-Z0-9 .,'\-\/]$/.test(char)) {
            event.preventDefault();
        }
    }

    // Email: only allow letters, digits, @ and .
    noSpecialCharsEmail(event: any) {
        const char = event.key;
        if (!/^[a-zA-Z0-9@._\-]$/.test(char)) {
            event.preventDefault();
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
        if (this.registrationForm.valid) {
            this.errorMessage = 'Doing Register...';
            this.isDisabled = true;
            let loader = this.loadingCtrl.create({
                content: "Please wait..."
            });
            loader.present();
            //let deviceData = JSON.parse(localStorage.getItem( 'WLSVGDeviceData'));
            let regData = {
                /*'status':0,
                'pushToken':deviceData.pushToken,
                'uuid':deviceData.uuid,
                'deviceType':deviceData.deviceType*/
            }
            let registrationData = Object.assign({}, regData, values);
            console.log(registrationData);
            this.commonservice.doUserRegister(JSON.stringify(registrationData)).then(res => {
                if (res) {
                    if (res.success) {
                        this.errorMessage = res.message;
                        let toast = this.toastCtrl.create({
                            message: res.message,
                            duration: 3000
                        });
                        toast.present();
                        localStorage.setItem('MAHARAJ_receivedotp', JSON.stringify(res.newotp));
                        localStorage.setItem('MAHARAJ_currentuserregdata', JSON.stringify(res.userdata));
                        this.navCtrl.push(UserregotpPage);
                    } else {
                        //this.commonservice.showAlertMSG( 2, res.message );
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
    toLocaleUpperCase(value) {
        this.GSTpattern = value;
        if (this.GSTpattern.length > 15)
            console.log(this.GSTpattern.length);
        this.errorMessage = "Invalid"
        this.PANpattern = value;

    }
    onlyNumbers(event: any) {
        const char = event.key;
        if (!/^\d$/.test(char)) {
            event.preventDefault();
        }
    }

    GST_valid(event: any) {
        const char = event.key;
        if (!/^[a-zA-Z0-9]$/.test(char)) {
            event.preventDefault();
        }
    }

    //  download_kyc() {
    //     let link = localStorage.getItem("Kyc_file");
    // 	var locationWindow = cordova.InAppBrowser.open(link, '_system', 'location=no, clearsessioncache=yes' + "&nocache=");
    //   }

}
