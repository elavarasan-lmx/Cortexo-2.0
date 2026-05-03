import { Component, ViewChild } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { Market } from '@ionic-native/market';
import { MobileAccessibility } from '@ionic-native/mobile-accessibility';
import { Network } from '@ionic-native/network';
import { OneSignal } from '@ionic-native/onesignal';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AlertController, Events, LoadingController, ModalController, Nav, Platform, ToastController } from 'ionic-angular'; //,
import { App, MenuController } from "ionic-angular/index";
import { AboutPage } from '../pages/about/about';
import { AnalyticsPage } from '../pages/analytics/analytics';
import { BankPage } from '../pages/bank/bank';
import { ContactPage } from '../pages/contact/contact';
import { EconomicCalenderPage } from '../pages/economical/economical';
import { EnquiryPage } from '../pages/enquiry/enquiry';
import { GalleryPage } from '../pages/gallery/gallery';
import { GraphPage } from '../pages/graph/graph';
import { HistoricalPage } from '../pages/historical/historical';
import { HomePage } from '../pages/home/home';
import { ImagePopupPage } from '../pages/image-popup/image-popup';
import { LoginPage } from '../pages/login/login';
import { MessagesPage } from '../pages/messages/messages';
import { OtpverifyPage } from '../pages/otpverify/otpverify';
import { PendingdeliveryPage } from '../pages/pendingdelivery/pendingdelivery';
import { PendingordersPage } from '../pages/pendingorders/pendingorders';
import { RatealertPage } from '../pages/ratealert/ratealert';
import { RegistrationPage } from '../pages/registration/registration';
import { SettingsPage } from '../pages/settings/settings';
import { SocialsharePage } from '../pages/socialshare/socialshare';
import { TDSPage } from '../pages/tds/tds';
import { TermsPage } from '../pages/terms/terms';
import { TradablecommoditylistPage } from '../pages/tradablecommoditylist/tradablecommoditylist';
import { TradehistoryPage } from '../pages/tradehistory/tradehistory';
import { CommonServiceProvider } from '../providers/common-service/common-service';
import { LiveratesProvider } from '../providers/liverates/liverates';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = HomePage;
    lastBack = 0;
    allowClose: boolean = false;
    toast;
    contracts: any = [];
    app_version = "1.0.0";
    package_name;
    versionData: any;
    loginstatus: any = "";
    postData: any = [];
    userData: any = [];
    username: any = "";
    deviceData: any = [];
    uuid = "";
    userlogged: any = "";
    component_name: any = "";
    showFooter: any = 0;
    user_details: any;
    messages: any = [];
    count: any = 0;
    totalcount: any = "0";
    clientlimit_enable: any = 0;
    delete: any = 0;
    accdelete = false;
    userid: any = "";
    isOnline: boolean = true;

    menulist: Array<{ title: string, iconname: string, component: any, cname: string }>;

    constructor(private mobileAccessibility: MobileAccessibility, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private _OneSignal: OneSignal, private network: Network, private toastController: ToastController, private app: App, private market: Market, private appVersion: AppVersion, private commonService: CommonServiceProvider, private device: Device, private alertCtrl: AlertController, private liverateservice: LiveratesProvider, private loadingCtrl: LoadingController, public modalCtrl: ModalController, public events: Events, private menu: MenuController) {

        platform.ready().then(() => {
            this.ResponsiveApp();
            this.statusBar.styleDefault();
            this.statusBar.overlaysWebView(false);
            this.splashScreen.hide();
            statusBar.show();
            // statusBar.backgroundColorByHexString('#ffffff');

            // Reconnect sockets when app resumes from background
            this.platform.resume.subscribe(() => {
                console.log('App resumed — reconnecting sockets');
                this.liverateservice.reconnect();
            });

            if (this.device.version >= '15') {
                document.documentElement.style.setProperty('--header-padding', '38px');
                document.documentElement.style.setProperty('--footer-padding', '40px');
                const marginTop = this.device.version >= '15' ? '88px' : '56px';
                document.documentElement.style.setProperty('--viewer-margin-top', marginTop);
                document.documentElement.style.setProperty('--fabs-margin-bottom', '100px');
            } else if ((this.device.version < '15')) {
                document.documentElement.style.setProperty('--fabs-margin-bottom', '110px');
            }

            this.menu.swipeEnable(false);

            if (platform.is('cordova')) {
                appVersion.getVersionNumber().then((s) => {
                    this.app_version = s;
                    appVersion.getPackageName().then((p) => {
                        this.package_name = p;
                        //this.initializeApp();
                    });
                });
            }

            //Onesignal device update
            console.log("ready initializeappdatas");
            let pushToken: any = "";

            document.addEventListener('deviceready', OneSignalInit, false);
            var that = this;

            function OneSignalInit() {

                console.log('onseginal inint...')
                window['plugins'].OneSignal.setAppId("2bcb8b30-4518-48cf-8cdb-a0c869588bda", "104880087239");
                window['plugins'].OneSignal.setNotificationOpenedHandler(function (jsonData) {
                    console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
                });

                window['plugins'].OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
                    console.log("User accepted notifications: " + accepted);
                });

                window['plugins'].OneSignal.addSubscriptionObserver(function (ids) {
                    console.log("Subscribed for OneSignal push notifications!")
                    localStorage.setItem('MAHARAJ_deviceData', JSON.stringify({ 'uuid': ids.to.userId, 'pushToken': ids.to.pushToken, 'deviceType': 1 }));
                    console.log(localStorage.getItem('MAHARAJ_deviceData'));
                    console.log("Push Subscription state changed: " + JSON.stringify(ids));

                    if ((JSON.parse(localStorage.getItem('MAHARAJ_deviceData'))['uuid'] != null && JSON.parse(localStorage.getItem('MAHARAJ_deviceData'))['uuid'] != '') && (JSON.parse(localStorage.getItem('MAHARAJ_deviceData'))['pushToken'] != null && JSON.parse(localStorage.getItem('MAHARAJ_deviceData'))['pushToken'] != '')) {

                        let initialData = JSON.parse(localStorage.getItem('MAHARAJ_InitialData'));
                        this.devicesetData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
                        if (initialData == null || initialData == undefined) {
                            that.checkserverappSettings(JSON.stringify({ 'platform': 1, 'app_version': that.app_version, 'uuid': this.devicesetData.uuid, 'pushToken': this.devicesetData.pushToken }));
                        } else {
                            that.checkserverappSettingsChanges(JSON.stringify({ 'platform': 1, 'app_version': that.app_version, 'uuid': this.devicesetData.uuid, 'pushToken': this.devicesetData.pushToken, 'updatetime': initialData.updatetime }));
                        }
                    }
                });
                //window['plugins'].OneSignal.endInit();
            }
            this.commonService.getmessages().subscribe(res => {
                this.messages = res;
                this.count = this.messages.length;
                if (localStorage.getItem("messagecount1") != null && this.count >= localStorage.getItem("messagecount1")) {
                    var totalable = localStorage.getItem("messagecount1");
                    this.totalcount = this.count - parseInt(totalable)
                } else {
                    localStorage.setItem("messagecount1", this.count)
                }

            });
            if (JSON.parse(localStorage.getItem('MAHARAJ_deviceData')) != null) {
                if ((JSON.parse(localStorage.getItem('MAHARAJ_deviceData'))['uuid'] != null && JSON.parse(localStorage.getItem('MAHARAJ_deviceData'))['uuid'] != '') && (JSON.parse(localStorage.getItem('MAHARAJ_deviceData'))['pushToken'] != null && JSON.parse(localStorage.getItem('MAHARAJ_deviceData'))['pushToken'] != '')) {
                    let initialData = JSON.parse(localStorage.getItem('MAHARAJ_InitialData'));
                    let devicesetData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
                    console.log("ready initaldata", initialData);
                    console.log("ready devicesetData", devicesetData);
                    if (initialData == null || initialData == undefined) {
                        this.checkserverappSettings(JSON.stringify({ 'platform': 1, 'app_version': this.app_version, 'uuid': devicesetData.uuid, 'pushToken': devicesetData.pushToken }));
                    } else {
                        this.checkserverappSettingsChanges(JSON.stringify({ 'platform': 1, 'app_version': this.app_version, 'uuid': devicesetData.uuid, 'pushToken': devicesetData.pushToken, 'updatetime': initialData.updatetime }));
                    }
                }
            }

            platform.registerBackButtonAction(() => {
                const overlay = this.app._appRoot._overlayPortal.getActive();
                const nav = this.app.getActiveNav();
                const closeDelay = 2000;
                const spamDelay = 500;

                if (overlay && overlay.dismiss) {
                    overlay.dismiss();
                } else if (nav.canGoBack()) {
                    nav.pop();
                } else if (Date.now() - this.lastBack > spamDelay && !this.allowClose) {
                    this.allowClose = true;
                    let toast = this.toastController.create({
                        message: "Press back again to exit",
                        duration: closeDelay,
                        dismissOnPageChange: true
                    });
                    toast.onDidDismiss(() => {
                        this.allowClose = false;
                    });
                    toast.present();
                } else if (Date.now() - this.lastBack < closeDelay && this.allowClose) {
                    platform.exitApp();
                }
                this.lastBack = Date.now();
            });
            localStorage.setItem("accept_terms", "2")
            let view = this.nav.getActive();
            this.component_name = view.component.name;
            if (this.component_name == 'LoginPage' || this.component_name == 'RegistrationPage' || this.component_name == 'VerifytermsPage' || this.component_name == 'UserregotpPage' || this.component_name == 'ForgotpasswordPage') {
                this.showFooter = 0;
                console.log(this.component_name + "\t" + this.showFooter);
            } else {
                this.showFooter = 1;
                console.log(this.component_name + "\t" + this.showFooter);
            }
            if (localStorage.getItem('MAHARAJ_userlogged') != null && localStorage.getItem('MAHARAJ_userlogged') != undefined) {
                this.userlogged = localStorage.getItem('MAHARAJ_userlogged');
            } else {
                this.userlogged = 0;
                localStorage.setItem('MAHARAJ_userlogged', "0");
            }
            if (localStorage.getItem('MAHARAJ_userlogged') == "0") {
                // this.showFooter = 0;
                // this.nav.setRoot(LoginPage, {})
                this.menulist = [
                    { title: 'MARKET WATCH', iconname: 'market', component: HomePage, 'cname': 'HomePage' },
                    { title: 'TERMS & CONDITIONS', iconname: 'terms', component: TermsPage, 'cname': 'TermsPage' },
                    { title: 'TDS Calculator', iconname: 'calculator', component: TDSPage, 'cname': 'TDSPage' },
                    { title: 'BANK DETAILS', iconname: 'bank', component: BankPage, 'cname': 'BankPage' },
                    { title: 'LIVE CHARTS', iconname: 'chart', component: GraphPage, 'cname': 'GraphPage' },
                    { title: 'HISTORICAL DATA', iconname: 'historical', component: HistoricalPage, 'cname': 'HistoricalPage' },
                    { title: 'ECONOMIC CALENDER', iconname: 'economical', component: EconomicCalenderPage, 'cname': 'EconomicCalenderPage' },
                    { title: 'ANALYTICS', iconname: 'analytics', component: AnalyticsPage, 'cname': 'AnalyticsPage' },
                    { title: 'CONTACT US', iconname: 'contact', component: ContactPage, 'cname': 'ContactPage' },
                    { title: 'RATE ALERT', iconname: 'ratealert', component: RatealertPage, 'cname': 'RatealertPage' },
                    { title: 'ABOUT US', iconname: 'aboutus', component: AboutPage, 'cname': 'AboutPage' },
                    { title: 'ENQUIRY', iconname: 'contact', component: EnquiryPage, 'cname': 'EnquiryPage' },
                    { title: 'SOCIAL SHARE', iconname: 'socialshare', component: SocialsharePage, 'cname': 'SocialsharePage' }
                ];
            } else if (localStorage.getItem('MAHARAJ_userlogged') == "1") {
                // this.showFooter = 1;
                // this.nav.setRoot(HomePage, {})
                this.userData = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
                this.menulist = [
                    { title: 'MARKET WATCH', iconname: 'market', component: HomePage, 'cname': 'HomePage' },
                    { title: 'TRADE HISTORY', iconname: 'tradehistory', component: TradehistoryPage, 'cname': 'TradehistoryPage' },
                    { title: 'LIMIT ORDERS', iconname: 'limit', component: PendingordersPage, 'cname': 'PendingordersPage' },
                    // { title: 'UNFIX REPORT', iconname: 'Transactions_new', component: UnfixPage, 'cname': 'UnfixPage' },
                    { title: 'LIVE CHARTS', iconname: 'chart', component: GraphPage, 'cname': 'GraphPage' },
                    { title: 'HISTORICAL DATA', iconname: 'historical', component: HistoricalPage, 'cname': 'HistoricalPage' },
                    { title: 'ECONOMIC CALENDER', iconname: 'economical', component: EconomicCalenderPage, 'cname': 'EconomicCalenderPage' },
                    { title: 'ANALYTICS', iconname: 'analytics', component: AnalyticsPage, 'cname': 'AnalyticsPage' },
                    /*  { title: 'TRANSACTIONS', iconname: 'Transactions', component: LedgerreportPage, 'cname': 'LedgerreportPage' }, */
                    // { title: 'CLIENT LIMIT', iconname: 'clientlimit', component: ClientlimitPage, 'cname' : 'ClientlimitPage' },
                    { title: 'RATE ALERT', iconname: 'ratealert', component: RatealertPage, 'cname': 'RatealertPage' },
                    { title: 'SETTINGS', iconname: 'Settings', component: SettingsPage, 'cname': 'SettingsPage' },
                    { title: 'TERMS & CONDITIONS', iconname: 'terms', component: TermsPage, 'cname': 'TermsPage' },
                    { title: 'TDS Calculator', iconname: 'calculator', component: TDSPage, 'cname': 'TDSPage' },
                    { title: 'BANK DETAILS', iconname: 'bank', component: BankPage, 'cname': 'BankPage' },
                    { title: 'CONTACT US', iconname: 'contact', component: ContactPage, 'cname': 'ContactPage' },
                    { title: 'ABOUT US', iconname: 'aboutus', component: AboutPage, 'cname': 'AboutPage' },
                    { title: 'ENQUIRY', iconname: 'contact', component: EnquiryPage, 'cname': 'EnquiryPage' },
                    { title: 'SOCIAL SHARE', iconname: 'socialshare', component: SocialsharePage, 'cname': 'SocialsharePage' }
                ];
                if (localStorage.getItem('MAHARAJ_display_margin') == "0") {
                    this.menulist = this.menulist.filter(menu => menu.title !== "Transactions");
                }
                if (localStorage.getItem('clientlimit_enable') == "0") {
                    this.menulist = this.menulist.filter(menu => menu.title !== "ClientlimitPage");
                }

            } else {
                console.log("ERROR: " + localStorage.getItem('MAHARAJ_userlogged'));
            }
        });

        //if (this.platform.is('core') || this.platform.is('mobileweb')) {
        this.initializeApp();
        //}

        // Network status + listeners are set up inside platform.ready() below
        // to ensure the Cordova Network plugin is fully initialized.
        this.platform.ready().then(() => {
            this.checkNetworkStatus();

            this.network.onConnect().subscribe(data => {
                // Small delay to let network stabilize before acting
                setTimeout(() => {
                    this.isOnline = true;
                    this.events.publish("netowork", 1);
                    if (this.toast) {
                        try { this.toast.dismiss(); } catch (e) { }
                    }
                    this.toast = this.toastController.create({
                        message: "You are back Online",
                        duration: 3000
                    });
                    this.toast.present();
                    this.liverateservice.getsettingData().then(() => {
                        this.nav.setRoot(HomePage);
                    });
                }, 1500);
            }, error => console.error(error));

            this.network.onDisconnect().subscribe(data => {
                this.isOnline = false;
                this.events.publish("netowork", 0);
                if (this.toast) {
                    try { this.toast.dismiss(); } catch (e) { }
                }
                this.toast = this.toastController.create({
                    message: "You are Offline",
                    dismissOnPageChange: false
                });
                this.toast.present();
            }, error => console.error(error));
        });
        events.subscribe("messagecount1", (res) => {
            /*  alert(res) */
            this.totalcount = this.count - parseInt(res);
        })
        events.subscribe('clientlimit_enable', (res) => {
            this.userData = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
            this.clientlimit_enable = res;
            localStorage.setItem('clientlimit_enable', this.clientlimit_enable)
            this.events.publish('username:changed', this.userData);
        })
        events.subscribe('tab:changed', (ctab) => {
            //let view = this.nav.getActive();
            this.component_name = ctab;
            console.log("Component Name: ", ctab);
            if (this.component_name == 'LoginPage' || this.component_name == 'VerifytermsPage' || this.component_name == 'RegistrationPage' || this.component_name == 'UserregotpPage' || this.component_name == 'ForgotpasswordPage') {
                this.showFooter = 0;
                console.log("FN: ", this.component_name + "\t" + this.showFooter);
            } else {
                this.showFooter = 1;
                console.log("FY: ", this.component_name + "\t" + this.showFooter);
            }
        });

        events.subscribe('username:changed', (userdata) => {
            if (userdata.username !== undefined && userdata.username !== "") {
                this.loginstatus = userdata.loginstatus;
                console.log("LS:", this.loginstatus);
                if (userdata.loginstatus) {
                    this.userData = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
                    this.userlogged = 1;
                    this.menulist = [
                        { title: 'MARKET WATCH', iconname: 'market', component: HomePage, 'cname': 'HomePage' },
                        { title: 'TRADE HISTORY', iconname: 'tradehistory', component: TradehistoryPage, 'cname': 'TradehistoryPage' },
                        { title: 'LIMIT ORDERS', iconname: 'limit', component: PendingordersPage, 'cname': 'PendingordersPage' },
                        // { title: 'UNFIX REPORT', iconname: 'Transactions_new', component: UnfixPage, 'cname': 'UnfixPage' },
                        { title: 'RATE ALERT', iconname: 'ratealert', component: RatealertPage, 'cname': 'RatealertPage' },
                        { title: 'LIVE CHARTS', iconname: 'chart', component: GraphPage, 'cname': 'GraphPage' },
                        { title: 'HISTORICAL DATA', iconname: 'historical', component: HistoricalPage, 'cname': 'HistoricalPage' },
                        { title: 'ECONOMIC CALENDER', iconname: 'economical', component: EconomicCalenderPage, 'cname': 'EconomicCalenderPage' },
                        { title: 'ANALYTICS', iconname: 'analytics', component: AnalyticsPage, 'cname': 'AnalyticsPage' },
                        /*  { title: 'TRANSACTIONS', iconname: 'Transactions', component: LedgerreportPage, 'cname': 'LedgerreportPage' }, */
                        // { title: 'CLIENT LIMIT', iconname: 'clientlimit', component: ClientlimitPage, 'cname' : 'ClientlimitPage' },
                        { title: 'SETTINGS', iconname: 'Settings', component: SettingsPage, 'cname': 'SettingsPage' },
                        { title: 'TERMS & CONDITIONS', iconname: 'terms', component: TermsPage, 'cname': 'TermsPage' },
                        { title: 'TDS Calculator', iconname: 'calculator', component: TDSPage, 'cname': 'TDSPage' },
                        { title: 'BANK DETAILS', iconname: 'bank', component: BankPage, 'cname': 'BankPage' },
                        { title: 'CONTACT US', iconname: 'contact', component: ContactPage, 'cname': 'ContactPage' },
                        { title: 'ABOUT US', iconname: 'aboutus', component: AboutPage, 'cname': 'AboutPage' },
                        { title: 'ENQUIRY', iconname: 'contact', component: EnquiryPage, 'cname': 'EnquiryPage' },
                        { title: 'SOCIAL SHARE', iconname: 'socialshare', component: SocialsharePage, 'cname': 'SocialsharePage' }
                        //{ title: 'Rate Alert', iconname: 'notifications', component: RatealertPage, 'cname' : 'RatealertPage' }
                    ];
                    if (localStorage.getItem('MAHARAJ_display_margin') == "0") {
                        this.menulist = this.menulist.filter(menu => menu.title !== "Transactions");
                    }
                    if (localStorage.getItem('clientlimit_enable') == "0") {
                        this.menulist = this.menulist.filter(menu => menu.title !== "CLIENT LIMIT");
                    }
                } else {
                    this.userlogged = 0;
                    this.menulist = [
                        { title: 'MARKET WATCH', iconname: 'market', component: HomePage, 'cname': 'HomePage' },
                        { title: 'TERMS & CONDITIONS', iconname: 'terms', component: TermsPage, 'cname': 'TermsPage' },
                        { title: 'TDS Calculator', iconname: 'calculator', component: TDSPage, 'cname': 'TDSPage' },
                        { title: 'RATE ALERT', iconname: 'ratealert', component: RatealertPage, 'cname': 'RatealertPage' },
                        { title: 'LIVE CHARTS', iconname: 'chart', component: GraphPage, 'cname': 'GraphPage' },
                        { title: 'HISTORICAL DATA', iconname: 'historical', component: HistoricalPage, 'cname': 'HistoricalPage' },
                        { title: 'ECONOMIC CALENDER', iconname: 'economical', component: EconomicCalenderPage, 'cname': 'EconomicCalenderPage' },
                        { title: 'ANALYTICS', iconname: 'analytics', component: AnalyticsPage, 'cname': 'AnalyticsPage' },
                        { title: 'BANK DETAILS', iconname: 'bank', component: BankPage, 'cname': 'BankPage' },
                        { title: 'CONTACT US', iconname: 'contact', component: ContactPage, 'cname': 'ContactPage' },
                        { title: 'ABOUT US', iconname: 'aboutus', component: AboutPage, 'cname': 'AboutPage' },
                        { title: 'ENQUIRY', iconname: 'contact', component: EnquiryPage, 'cname': 'EnquiryPage' },
                        { title: 'SOCIAL SHARE', iconname: 'socialshare', component: SocialsharePage, 'cname': 'SocialsharePage' }
                        //{ title: 'Rate Alert', iconname: 'notifications', component: RatealertPage, 'cname' : 'RatealertPage' },
                    ];
                }
            }
        });

    }

    initializeApp() {
        /* let pushToken: any = "";
        if (this.platform.is('cordova')) {
            this._OneSignal.startInit("4c2e9e9b-0e8b-4d57-8a0f-02de80a82b2d", "855727401325");
            this._OneSignal.inFocusDisplaying(this._OneSignal.OSInFocusDisplayOption.Notification);
            this._OneSignal.setSubscription(true);
            this._OneSignal.handleNotificationReceived().subscribe((jsonData) => {
                let notiobj: any = JSON.stringify(jsonData);
                let obj = JSON.parse(notiobj);

                if (obj.payload.additionalData.page_type != undefined && obj.payload.additionalData.page_type != '') {
                    var res={"title":obj.notification.payload.title,"subTitle": obj.notification.payload.body}
                    this.events.publish("notificationdata",res);
                }
            });
            this._OneSignal.handleNotificationOpened().subscribe((data) => {
                if(data.action['type']==0){
                    if(data!=null && data!=null){
                    var res={"title":data.notification.payload.title,"subTitle": data.notification.payload.body}
                    this.events.publish("notificationdata",res)
                    }
                }

            });

            this._OneSignal.getIds().then((ids) => {
                console.log(JSON.stringify(ids))

              //  alert(JSON.stringify( { 'userId': ids.userId, 'pushToken': ids.pushToken, 'deviceType': ( this.platform.is( 'android' ) ? 1 : 2 ), 'acctype': 1 } ));
                //this.commonService.doUpdateDeviceIds( JSON.stringify( { 'userId': ids.userId, 'pushToken': ids.pushToken, 'deviceType': ( platform.is( 'android' ) ? 1 : 2 ) } ) );
                pushToken = ids.userId;
                localStorage.setItem('MAHARAJ_deviceData', JSON.stringify({ 'pushToken': ids.userId, 'uuid': this.device.uuid, 'deviceType': (this.platform.is('android') ? 1 : 2), 'platform': (this.platform.is('android') ? 1 : (this.platform.is('ios') ? 2 : 0)) }));

                let initialData = JSON.parse(localStorage.getItem('MAHARAJ_InitialData'));
                if (initialData == null || initialData == undefined) {
                    this.checkserverappSettings(JSON.stringify({ 'platform': (this.platform.is('android') ? 1 : (this.platform.is('ios') ? 2 : 0)), 'app_version': this.app_version, 'uuid': this.device.uuid, 'pushToken': pushToken }));
                } else {
                    this.checkserverappSettingsChanges(JSON.stringify({ 'platform': (this.platform.is('android') ? 1 : (this.platform.is('ios') ? 2 : 0)), 'app_version': this.app_version, 'uuid': this.device.uuid, 'pushToken': pushToken, 'updatetime': initialData.updatetime }));
                }
            });
            this._OneSignal.endInit();
        } else {
            localStorage.setItem('MAHARAJ_deviceData', JSON.stringify({ 'pushToken': "1563456123", 'uuid': "78976952552", 'deviceType': (this.platform.is('android') ? 1 : 2) }));
            this.checkserverappSettings(JSON.stringify({ 'platform': (this.platform.is('android') ? 1 : (this.platform.is('ios') ? 2 : 0)), 'app_version': this.app_version, 'uuid': "78976952552", 'pushToken': "1563456123" }));
            console.log("MAHARAJ_deviceData: " + localStorage.getItem('MAHARAJ_deviceData'));
        } */


    }


    checkserverappSettings(requestdata) {
        //this.statusBar.styleDefault();
        console.log("checkserverappSettings", requestdata);
        let loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        loading.present();
        this.commonService.settingsData(requestdata).then(res => {
            //this.commonService.settingsData( JSON.stringify( { 'platform':(this.platform.is('android') ? 1 : (this.platform.is('ios') ? 2 : 0)), 'app_version' : '1.0.1', 'uuid' : "78976952552", 'pushToken' : "1563456123" } ) ).then( res => {
            if (res) {
                if (!res.error) {
                    console.log("checkseset: ", res);
                    this.versionData = res.resultdata;
                    this.delete = res.resultdata.userdeleteoption;
                    this.user_details = res.resultdata.user_data;
                    localStorage.setItem("MAHARAJOTR", JSON.stringify(this.user_details));
                    localStorage.setItem('MAHARAJ_InitialData', JSON.stringify(this.versionData));
                    if (this.versionData.showpopup == 1 && this.versionData.popupimage != "" && this.versionData.popupimage != null) {
                        this.presentPopupModal(this.versionData.popupimage);
                    }
                    localStorage.setItem('MAHARAJ_shtolerance', this.versionData.silverhigh_tol);
                    localStorage.setItem('MAHARAJ_ghtolerance', this.versionData.goldhigh_tol);
                    localStorage.setItem('MAHARAJ_sltolerance', this.versionData.silverlow_tol);
                    localStorage.setItem('MAHARAJ_gltolerance', this.versionData.goldlow_tol);

                    localStorage.setItem('MAHARAJLSData', JSON.stringify({ 'url': this.versionData.url, 'adapter': this.versionData.adapter, 'provider': this.versionData.provider, 'username': this.versionData.username }));
                    if (this.versionData) {
                        if (this.platform.is('android')) {
                            if (this.versionData.updateAvail) {
                                this.presentAlert(this.package_name, this.versionData.message, this.versionData.title);
                                //this.nav.setRoot( RegistrationPage, {} );
                            } else {
                                //this.splashScreen.hide();
                                if (this.versionData.registerstatus == 0 && this.versionData.otrrequired == 1) {
                                    this.showFooter = 0;
                                    this.nav.setRoot(RegistrationPage, {});
                                } else if (this.versionData.registerstatus == 1 && this.versionData.otrrequired == 1) {
                                    this.showFooter = 0;
                                    this.nav.setRoot(OtpverifyPage, {});
                                } else if (this.versionData.registerstatus == 2 || this.versionData.otrrequired == 0) {
                                    // this.nav.setRoot(this.rootPage, {});
                                }
                            }
                        }
                        else if (this.platform.is('ios')) {
                            if (this.versionData.updateAvail) {
                                this.presentAlert(this.versionData.appurl, this.versionData.message, this.versionData.title);
                            } else {
                                //this.splashScreen.hide();
                                if (this.versionData.registerstatus == 0 && this.versionData.otrrequired == 1) {
                                    this.showFooter = 0;
                                    this.nav.setRoot(RegistrationPage, {});
                                } else if (this.versionData.registerstatus == 1 && this.versionData.otrrequired == 1) {
                                    this.showFooter = 0;
                                    this.nav.setRoot(OtpverifyPage, {});
                                } else if (this.versionData.registerstatus == 2 || this.versionData.otrrequired == 0) {
                                    //this.nav.setRoot( this.rootPage, {}  );
                                }
                            }
                        }
                    }
                } else {
                    console.log(res);
                }
            }
            loading.dismiss();
        }, error => {
            loading.dismiss();
        });
    }

    checkserverappSettingsChanges(requestdata) {
        console.log("checkserverappSettingsChanges");
        this.commonService.checksettingsData(requestdata).then(res => {
            if (res) {
                console.log("checksesetche: ", res);
                if (!res.error) {
                    this.delete = res.resultdata.userdeleteoption;
                    if (res.resultdata.update == 0) {
                        this.versionData = JSON.parse(localStorage.getItem('MAHARAJ_InitialData'));
                        this.versionData.updateAvail = false;
                    } else {
                        this.versionData = res.resultdata;
                        localStorage.setItem('MAHARAJ_InitialData', JSON.stringify(this.versionData));
                    }

                    if (this.versionData.showpopup == 1 && this.versionData.popupimage != "" && this.versionData.popupimage != null) {
                        this.presentPopupModal(this.versionData.popupimage);
                    }
                    localStorage.setItem('MAHARAJLSData', JSON.stringify({ 'url': this.versionData.url, 'adapter': this.versionData.adapter, 'provider': this.versionData.provider, 'username': this.versionData.username }));
                    if (this.versionData) {
                        if (this.platform.is('android')) {
                            if (this.versionData.updateAvail) {
                                this.presentAlert(this.package_name, this.versionData.message, this.versionData.title);
                                //this.nav.setRoot( RegistrationPage, {} );
                            } else {
                                //this.splashScreen.hide();
                                if (this.versionData.registerstatus == 0 && this.versionData.otrrequired == 1) {
                                    this.showFooter = 0;
                                    this.nav.setRoot(RegistrationPage, {});
                                } else if (this.versionData.registerstatus == 1 && this.versionData.otrrequired == 1) {
                                    this.showFooter = 0;
                                    this.nav.setRoot(OtpverifyPage, {});
                                } else if (this.versionData.registerstatus == 2 || this.versionData.otrrequired == 0) {
                                    //this.nav.setRoot( this.rootPage, {}  );
                                    //this.liverateservice.subscribeStocks();
                                }
                            }
                        } else if (this.platform.is('ios')) {
                            if (this.versionData.updateAvail) {
                                this.presentAlert(this.versionData.appurl, this.versionData.message, this.versionData.title);
                            } else {
                                if (this.versionData.registerstatus == 0 && this.versionData.otrrequired == 1) {
                                    this.showFooter = 0;
                                    this.nav.setRoot(RegistrationPage, {});
                                } else if (this.versionData.registerstatus == 1 && this.versionData.otrrequired == 1) {
                                    this.showFooter = 0;
                                    this.nav.setRoot(OtpverifyPage, {});
                                } else if (this.versionData.registerstatus == 2 || this.versionData.otrrequired == 0) {
                                    //this.nav.setRoot( this.rootPage, {}  );
                                    //this.liverateservice.subscribeStocks();
                                }
                            }
                        }
                    }
                } else {
                    console.log(res);
                }
            }
        }, error => {

        });
    }

    presentAlert(appurl, msg, title) {
        //this.splashScreen.hide();
        const overlay = this.app._appRoot._overlayPortal.getActive();
        if (overlay && overlay.dismiss) {
            overlay.dismiss();
        }
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: msg,
            enableBackdropDismiss: false,
            buttons: [{
                text: 'Ok',
                handler: data => {
                    this.market.open(appurl);
                    this.platform.exitApp();
                }
            }]
        });
        alert.present();
    }

    presentPopupModal(imgurl) {
        let popupModal = this.modalCtrl.create(ImagePopupPage, { imgurl: imgurl });
        popupModal.present();
    }

    gotoProducts() {
        this.events.publish('tab:changed', "GalleryPage");
        this.nav.setRoot(GalleryPage, {});
    }

    openPage(page) {
        console.log("openPage");
        this.events.publish('tab:changed', page.cname);
        this.nav.setRoot(page.component);
    }

    gotoHomePage() {
        this.events.publish('tab:changed', "HomePage");
        this.nav.setRoot(HomePage, {});
    }
    gotoMessagesPage() {
        this.events.publish('tab:changed', "MessagesPage");
        this.nav.setRoot(MessagesPage, {});
    }
    gotoBookingPage() {
        if (localStorage.getItem('MAHARAJ_userlogged') == "1") {
            this.events.publish('tab:changed', "TradablecommoditylistPage");
            this.nav.setRoot(TradablecommoditylistPage, {});
        } else {
            this.events.publish('tab:changed', "LoginPage");
            this.nav.setRoot(LoginPage, {});
        }
    }
    login() {
        this.events.publish('tab:changed', "LoginPage");
        this.nav.setRoot(LoginPage, {});
    }
    gotopendingPage() {
        if (localStorage.getItem('MAHARAJ_userlogged') == "1") {
            this.events.publish('tab:changed', "PendingdeliveryPage");
            this.nav.setRoot(PendingdeliveryPage, {});
        } else {
            this.events.publish('tab:changed', "LoginPage");
            this.nav.setRoot(LoginPage, {});
        }
    }

    gotoPendingordersPage() {
        if (localStorage.getItem('MAHARAJ_userlogged') == "1") {
            this.events.publish('tab:changed', "PendingordersPage");
            this.nav.setRoot(PendingordersPage, {});
        } else {
            this.events.publish('tab:changed', "LoginPage");
            this.nav.setRoot(LoginPage, {});
        }
    }

    gotoRatealertPage() {
        this.events.publish('tab:changed', "RatealertPage");
        this.nav.setRoot(RatealertPage, {});
    }
    gotoTradeHistoryPage() {
        if (localStorage.getItem('MAHARAJ_userlogged') == "1") {
            this.events.publish('tab:changed', "TradehistoryPage");
            this.nav.setRoot(TradehistoryPage, {});
        } else {
            this.events.publish('tab:changed', "LoginPage");
            this.nav.setRoot(LoginPage, {});
        }
    }
    gotoTCSTDSPage() {
        this.events.publish('tab:changed', "TDSPage");
        this.nav.setRoot(TDSPage, {});
    }
    openLogimaxWebsite() {
        window.open('https://logimaxindia.com/', '_system');
    }
    openmaharajWebsite() {
        window.open('http://www.maharajgoldsmith.com/', '_system');
    }
    gotoBankPage() {
        this.events.publish('tab:changed', "BankPage");
        this.nav.setRoot(BankPage, {});
    }
    deleteacc() {
        let alert = this.alertCtrl.create({
            title: "Logout",
            subTitle: "Are you sure want to delete your account",
            enableBackdropDismiss: false,
            buttons: [
                {
                    text: 'cancel',
                    handler: data => { }
                },
                {
                    text: 'Ok',
                    handler: data => {
                        var loader = this.loadingCtrl.create({
                            content: "Please wait..."
                        });
                        loader.present();
                        this.userid = localStorage.getItem('MAHARAJ_userId');
                        this.commonService.deleteacc(this.userid).then(data => {
                            loader.dismiss();
                            let toast = this.toastController.create({
                                message: data['message'],
                                duration: 6000,
                                position: 'middle'
                            });
                            toast.present();
                            if (data['success'] == true) {
                                // this.accdelete = data['success'];
                                console.log('status true...');
                                localStorage.setItem('MAHARAJ_userlogged', "0");
                                localStorage.setItem('logincred', JSON.stringify({
                                    user_name: '',
                                    password: '',
                                    rememberme: ''
                                }));

                                this.nav.setRoot(LoginPage, {});
                            }
                        });
                    }
                }
            ]
        });
        alert.present();
    }
    logout() {
        let alert = this.alertCtrl.create({
            title: "Logout",
            subTitle: "Are you sure want to logout",
            enableBackdropDismiss: false,
            buttons: [
                {
                    text: 'cancel',
                    handler: data => { }
                },
                {
                    text: 'Ok',
                    handler: data => {
                        let loading = this.loadingCtrl.create({
                            content: 'Logging out...'
                        });
                        this.userData = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
                        console.log(this.userData);
                        this.username = this.userData.username;
                        console.log(this.username);
                        this.deviceData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
                        let deviceData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
                        this.uuid = deviceData == null ? "78976952552" : this.deviceData.uuid;
                        this.postData = {
                            'username': this.username,
                            'uuid': deviceData == null ? "78976952552" : this.uuid,
                            'imieno': deviceData == null ? "78976952552" : deviceData.uuid,
                            'pushToken': deviceData == null ? "1563456123" : deviceData.pushToken,
                            'deviceType': deviceData == null ? "1" : deviceData.pushToken
                        };

                        /* this.uuid = this.deviceData.uuid;
                        this.postData = {
                            'username': this.username,
                            'uuid': this.uuid,
                            'imieno': deviceData.uuid,
                            'pushToken': deviceData.pushToken,
                            'deviceType': deviceData.deviceType
                        }; */

                        this.commonService.logout(JSON.stringify(this.postData)).then(result => {
                            if (result) {
                                //localStorage.setItem('logincred', "");
                                localStorage.setItem('MAHARAJ_userData', JSON.stringify({
                                    'loginstatus': false,
                                    'username': 'guest',
                                    'usergroup': 'Default'
                                }));
                                this.events.publish('username:changed', {
                                    'loginstatus': false,
                                    'username': 'guest',
                                    'usergroup': 'Default'
                                });
                                this.events.publish('tab:changed', "LoginPage");
                                if (result.data.status == 1) {
                                    let alert = this.alertCtrl.create({
                                        title: "Logout Request",
                                        subTitle: result.data.message,
                                        buttons: [
                                            {
                                                text: 'Ok',
                                                handler: data => { }
                                            }
                                        ]
                                    });
                                    alert.present();
                                    localStorage.setItem('MAHARAJ_userlogged', "0");
                                    this.nav.setRoot(LoginPage, {});
                                } else {
                                    let alert = this.alertCtrl.create({
                                        title: "Logout Request",
                                        subTitle: result.data.message,
                                        buttons: [
                                            {
                                                text: 'Ok',
                                                handler: data => { }
                                            }
                                        ]
                                    });
                                    alert.present();
                                }
                            }
                        });
                    }
                }
            ]
        });
        alert.present();
    }
    ResponsiveApp() {
        this.platform.ready().then(() => {
            // Log the current text zoom level
            this.mobileAccessibility.getTextZoom().then(textZoom => {
                console.log('Current text zoom = ' + textZoom + '%');
            });

            // Set text zoom to 100% (or any other value)
            this.mobileAccessibility.setTextZoom(100);
        });
    }

    checkNetworkStatus() {
        if (this.network.type === 'none') {
            this.isOnline = false;
        } else {
            this.isOnline = true;
        }
    }
}
