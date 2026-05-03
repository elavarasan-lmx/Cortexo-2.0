import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Events, MenuController } from 'ionic-angular';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { HomePage } from '../home/home'
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { RegistrationPage } from "../registration/registration";
import { ForgotpasswordPage } from '../forgotpassword/forgotpassword';
import { TabsPage } from '../tabs/tabs';
import { from } from 'rxjs/observable/from';
import { User_registrationPage } from '../user_registration/user_registration';
import { BookingPage } from '../booking/booking';
import { VerifytermsPage } from '../verifyterms/verifyterms';
//import { Storage } from '@ionic/storage';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    public loginForm: FormGroup;
    public username: AbstractControl;
    public password: AbstractControl;
    public submitted: boolean = false;
    public dummy_rememberme: AbstractControl;
    isDisabled: boolean = false;
    errorMessage: string = '';
    public authorization: any = [];
    public authendicationtype: any = '';
    public errormsg: string = '';
    userData: any = [];
    user_commodityData = [];
    margindata: any = "";
    trade_enable: any = "";
    post: any = [];
    user_name = "";//9629104630
    //rememberme = "";
    page = "";
    comid = "";
    reqtype = "";
    inputType = "";
    public showPass = false;
    public clearedit = false;
    public typecheck = 'password';


    constructor(public navCtrl: NavController, public navParams: NavParams, public builder: FormBuilder, private toastCtrl: ToastController, public loadingCtrl: LoadingController, private commonservice: CommonServiceProvider, private event: Events, public menu: MenuController) {
        this.loginForm = builder.group({
            'username': ['', Validators.compose([Validators.required])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(15)])],
            'dummy_rememberme': ['']
        });
        this.username = this.loginForm.controls['username'];
        this.password = this.loginForm.controls['password'];
        this.dummy_rememberme = this.loginForm.controls['dummy_rememberme'];
        this.authorization.rememberme = false;
    }

    ionViewDidLoad() {

    }

    ionViewDidEnter() {
        this.page = this.navParams.get('page');
        this.comid = this.navParams.get('comid');
        this.reqtype = this.navParams.get('reqtype');
        console.log(this.page + "\t" + this.comid + "\t" + this.reqtype);

        let post = JSON.parse(localStorage.getItem('MAHARAJ_logincred'));
        if (post != undefined) {
            if (post.rememberme) {
                this.authorization = {
                    user_name: post.user_name,
                    password: post.password,
                    rememberme: post.rememberme
                };
                this.onSubmit(this.authorization);
                //console.log("post: "+JSON.stringify(post));
            } else {
                //console.log("rememberme: "+post.rememberme);
            }
        } else {
            console.log("post: " + post);
        }

        /*this.post = storage.getObject('logincred');
        storage.get('logincred').then((val) => {
            console.log('Your age is', val);
        });*/
    }

    gotoRegisterPage() {
        this.navCtrl.push(User_registrationPage);
    }

    gotoForgotpasswordPage() {
        this.navCtrl.push(ForgotpasswordPage);
    }

    gotoHomePage() {
        //this.navCtrl.push( HomePage );
        this.event.publish('tab:changed', "HomePage");
        this.navCtrl.setRoot(HomePage);
        //setRoot(pageOrViewCtrl, params, opts, done)
    }


    hasUpperCase(v: string): boolean { return /[A-Z]/.test(v || ''); }
    hasNumber(v: string): boolean { return /[0-9]/.test(v || ''); }
    hasSpecialChar(v: string): boolean { return /[!@#$%^&*(),.?:{}|<>]/.test(v || ''); }
    validLength(v: string): boolean { return (v || '').length >= 6 && (v || '').length <= 15; }

    showPassword1() {
        //console.log(this.inputType+"\t"+this.passwordCheckbox);
        if (this.inputType == 'password') {
            this.inputType = 'text';
            this.clearedit = true;
            //this.passwordCheckbox = 1;
        } else {
            this.inputType = 'password';
            this.clearedit = false;
            //this.passwordCheckbox = 0;
        }
    }

    showPassword() {
        this.showPass = !this.showPass;

        if (this.showPass) {
            this.typecheck = 'text';
        } else {
            this.typecheck = 'password';
        }
    }

    private showToast(message: string) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000,
            position: 'bottom'
        });
        toast.present();
    }

    public onSubmit(values: Object): void {
        this.submitted = true;

        // --- Validate mobile number ---
        const mobileVal = (this.authorization.user_name || '').toString().trim();
        if (!mobileVal) {
            this.showToast('Please enter your mobile number.');
            return;
        }
        if (!/^[0-9]{10}$/.test(mobileVal)) {
            this.showToast('Mobile number must be exactly 10 digits.');
            return;
        }

        // --- Validate password format with specific messages ---
        const passVal = (this.authorization.password || '').toString();
        if (!passVal) {
            this.showToast('Please enter your password.');
            return;
        }
        if (passVal.length < 6) {
            this.showToast('Password must be at least 6 characters long.');
            return;
        }
        if (passVal.length > 15) {
            this.showToast('Password must not exceed 15 characters.');
            return;
        }

        if (this.loginForm.valid) {
            this.errorMessage = 'Logging in...';
            let loader = this.loadingCtrl.create({
                content: "Please wait..."
            });
            loader.present();
            let deviceData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
            let logData = {
                'imieno': deviceData == null ? "78976952552" : deviceData.uuid,
                'pushToken': deviceData == null ? "1563456123" : deviceData.pushToken,
                'deviceType': deviceData == null ? "1" : deviceData.pushToken,
            }
            let loginData = Object.assign({}, logData, values);
            //console.log(loginData);
            this.commonservice.doLogin(JSON.stringify(loginData)).then(result => {
                if (result.success == true) {
                    if (this.authorization.rememberme) {
                        localStorage.setItem('MAHARAJ_logincred', JSON.stringify({
                            user_name: this.authorization.user_name,
                            password: this.authorization.password,
                            rememberme: this.authorization.rememberme
                        }));
                    } else {
                        localStorage.setItem('MAHARAJ_logincred', JSON.stringify({
                            user_name: '',
                            password: '',
                            rememberme: ''
                        }));
                    }
                    if (result.data.operationresult == 0) {
                        this.errorMessage = result.data.message;
                        this.authendicationtype = 1;
                        let toast = this.toastCtrl.create({
                            message: this.errorMessage,
                            duration: 3000
                        });
                    }
                    else if (result.data.operationresult == 2) {
                        this.errorMessage = result.data.message;
                        this.authendicationtype = 2;
                        let toast = this.toastCtrl.create({
                            message: this.errorMessage,
                            duration: 3000
                        });
                    }
                    else if (result.data.operationresult == 3) {
                        this.errorMessage = result.data.message;
                        this.authendicationtype = 1;
                        let toast = this.toastCtrl.create({
                            message: this.errorMessage,
                            duration: 3000
                        });
                    }
                    else if (result.data.operationresult == 1) {

                        this.errorMessage = result.data.message;
                        this.userData = {
                            'loginstatus': true,
                            'username': this.authorization.user_name,
                            'userid': result.data.usercode,
                            'uuid': result.data.uuid,
                            'usergroup': result.data.group_name,
                            'name': result.profile.cus_name,
                            'company_name': result.profile.cus_company_name,
                            'mobile': result.profile.cus_mobile,
                            'email': result.profile.cus_email,
                            'address': result.profile.cus_address
                        };
                        //console.log(this.userData);
                        this.user_commodityData = result.trade_comm.comgroupData;
                        this.margindata = result.trade_comm.settings;
                        this.trade_enable = result.trade_comm.settings.trade_enable;
                        localStorage.setItem('MAHARAJ_userData', JSON.stringify(this.userData));
                        this.event.publish('username:changed', this.userData);
                        localStorage.setItem('MAHARAJ_userId', this.userData.userid);
                        localStorage.setItem('MAHARAJ_last_commodityupdatetime', "0");
                        localStorage.setItem('MAHARAJ_client', result.trade_comm.client);
                        localStorage.setItem('MAHARAJ_trade_enable', this.trade_enable);
                        localStorage.setItem('MAHARAJ_user_commodityData', JSON.stringify(this.user_commodityData));
                        localStorage.setItem('MAHARAJ_margindata', JSON.stringify(this.margindata));
                        localStorage.setItem('MAHARAJ_available_balance', JSON.stringify(result.trade_comm.available_balance));
                        localStorage.setItem('MAHARAJ_market_on', result.trade_comm.settings.market_on);
                        localStorage.setItem('MAHARAJ_display_margin', result.trade_comm.settings.display_margin);
                        localStorage.setItem('MAHARAJ_market_off', result.trade_comm.settings.market_off);
                        localStorage.setItem('MAHARAJ_sunday_holiday', result.trade_comm.settings.sunday_holiday);

                        //console.log("page: "+this.page);
                        if (this.page == "booking") {
                            let comid = this.navParams.get('comid');
                            let reqtype = this.navParams.get('reqtype');
                            //console.log(comid+"\t"+reqtype);
                            this.event.publish('tab:changed', "BookingPage");
                            this.navCtrl.setRoot(BookingPage, { 'comid': comid, 'reqtype': reqtype, 'page': "booking" });
                        } else {
                            if (localStorage.getItem("accept_terms") == "1") {
                                localStorage.setItem("accept_terms", "1")
                                localStorage.setItem('MAHARAJ_loginstatus', "1");
                                localStorage.setItem('MAHARAJ_userlogged', "1");
                                this.event.publish('tab:changed', "HomePage");
                                this.navCtrl.setRoot(HomePage, {});
                            } else {
                                localStorage.setItem('MAHARAJ_loginstatus', "0");
                                localStorage.setItem('MAHARAJ_userlogged', "0");
                                this.event.publish('tab:changed', "VerifytermsPage");
                                this.navCtrl.setRoot(VerifytermsPage, {});
                            }

                        }
                        //this.navCtrl.setRoot( HomePage, {}  );

                        let toast = this.toastCtrl.create({
                            message: 'Login Successful!',
                            duration: 3000,
                            position: 'top'
                        });
                        toast.present();
                    }
                    else {
                        //this.commonservice.showAlertMSG( 2, result.message );
                        let toast = this.toastCtrl.create({
                            message: result.message,
                            duration: 3000
                        });
                        this.errorMessage = result.message;
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
    ionViewWillEnter() {
        this.menu.enable(false);
    }
}
