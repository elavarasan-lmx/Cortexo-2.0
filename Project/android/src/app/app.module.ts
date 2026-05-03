declare var socketurl;
import { NgModule, ErrorHandler, Injectable, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { EnquiryPage } from '../pages/enquiry/enquiry';
import { RegistrationPage } from '../pages/registration/registration';
import { OtpverifyPage } from '../pages/otpverify/otpverify';
import { ImagePopupPage } from '../pages/image-popup/image-popup';
import { MessagesPage } from '../pages/messages/messages';
import { LoginPage } from '../pages/login/login';
import { TradehistoryPage } from '../pages/tradehistory/tradehistory';
import { UnfixPage } from '../pages/unfix/unfix';
import { UpdaterequestPage } from '../pages/updaterequest/updaterequest';
import { PendingordersPage } from '../pages/pendingorders/pendingorders';
import { UserregotpPage } from '../pages/userregotp/userregotp';
import { ForgotpasswordPage } from '../pages/forgotpassword/forgotpassword';
import { TradablecommoditylistPage } from '../pages/tradablecommoditylist/tradablecommoditylist';
import { Observable } from 'rxjs/Rx';
import { LedgerreportPage } from '../pages/ledgerreport/ledgerreport';
import { UpdateprofilePage } from '../pages/updateprofile/updateprofile';
import { ChangepasswordPage } from '../pages/changepassword/changepassword';
import { BookingPage } from '../pages/booking/booking';
import { SettingsPage } from '../pages/settings/settings';
import { User_registrationPage } from '../pages/user_registration/user_registration';
import { TermsPage } from '../pages/terms/terms';
import { RatealertPage } from '../pages/ratealert/ratealert';
import { ClientlimitPage } from '../pages/clientlimit/clientlimit';
import { SimcardPage } from '../pages/simcard/simcard';
import { GalleryPage } from '../pages/gallery/gallery';
import { ModalPage } from '../pages/modal/modal';
import { VideosPage } from '../pages/videos/videos';
import { NewsPage } from '../pages/news/news';
import { BankPage } from '../pages/bank/bank';
import { KycPage } from '../pages/kyc/kyc';
import { ImagePicker } from '@ionic-native/image-picker';
import { IndcurrencyPipe } from '../pipes/indcurrency/indcurrency';
import { PendingdeliveryPage } from '../pages/pendingdelivery/pendingdelivery';
import { VerifytermsPage } from '../pages/verifyterms/verifyterms';
import { TDSPage } from '../pages/tds/tds';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LiveratesProvider } from '../providers/liverates/liverates';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { OneSignal } from '@ionic-native/onesignal';
import { Network } from '@ionic-native/network';
import { Market } from '@ionic-native/market';
import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { Camera } from '@ionic-native/camera';
// import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';

import { CommonServiceProvider } from '../providers/common-service/common-service';
import { DatePicker } from '@ionic-native/date-picker';
import { SafeHtmlPipe } from '../pipes/safe-html/safe-html';
import { IndianCurrency } from '../pipes/indian-currency/indian-currency';
import { EconomicCalenderPage } from '../pages/economical/economical';
import { AnalyticsPage } from '../pages/analytics/analytics';
import { GraphPage } from '../pages/graph/graph';
import { HistoricalPage } from '../pages/historical/historical';
import { WhatsappPage } from "../pages/whatsapp/whatsapp";
import { SocialSharing } from '@ionic-native/social-sharing';
import { SocialsharePage } from '../pages/socialshare/socialshare';
import { FormattimePipe } from '../pipes/formattime/formattime';
import { MobileAccessibility } from '@ionic-native/mobile-accessibility';
// import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
// export let config: SocketIoConfig = { url: "http://test.maharajbullion.com/", options: {} };


@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch (e) {
      // Unable to get the IonicErrorHandler provider, ensure
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    // Remove this if you want to disable Ionic's auto exception handling
    // in development mode.
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    IndcurrencyPipe,
    ContactPage,
    HomePage,
    TabsPage,
    EnquiryPage,
    RegistrationPage,
    OtpverifyPage,
    ImagePopupPage,
    SafeHtmlPipe,
    SimcardPage,
    GalleryPage,
    ModalPage,
    NewsPage,
    BankPage,
    TradablecommoditylistPage,
    KycPage,
    MessagesPage,
    PendingdeliveryPage,
    VerifytermsPage,
    LoginPage,
    BookingPage,
    SettingsPage,
    User_registrationPage,
    TradehistoryPage,
    PendingordersPage,
    UnfixPage,
    UpdaterequestPage,
    ChangepasswordPage,
    UpdateprofilePage,
    UserregotpPage,
    ForgotpasswordPage,
    TermsPage,
    LedgerreportPage,
    ClientlimitPage,
    IndianCurrency,
    RatealertPage,
    TDSPage,
    VideosPage,
    HistoricalPage,
    GraphPage,
    AnalyticsPage,
    EconomicCalenderPage,
    WhatsappPage,
    SocialsharePage,
    FormattimePipe

  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    // SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    EnquiryPage,
    RegistrationPage,
    OtpverifyPage,
    ImagePopupPage,
    ClientlimitPage,
    GalleryPage,
    MessagesPage,
    ModalPage,
    BankPage,
    LoginPage,
    BookingPage,
    SettingsPage,
    User_registrationPage,
    TradehistoryPage,
    PendingordersPage,
    UnfixPage,
    UpdaterequestPage,
    TradablecommoditylistPage,
    ChangepasswordPage,
    UpdateprofilePage,
    UserregotpPage,
    ForgotpasswordPage,
    PendingdeliveryPage,
    VerifytermsPage,
    TermsPage,
    LedgerreportPage,
    RatealertPage,
    SimcardPage,
    KycPage,
    VideosPage,
    TDSPage,
    NewsPage,
    HistoricalPage,
    GraphPage,
    AnalyticsPage,
    EconomicCalenderPage,
    WhatsappPage,
    SocialsharePage
  ],
  providers: [
    IonicErrorHandler,
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: MyErrorHandler },
    LiveratesProvider,
    OneSignal,
    Network,
    Market,
    AppVersion,
    CommonServiceProvider,
    Device,
    DatePicker,
    ImagePicker,
    Camera,
    SocialSharing,
    MobileAccessibility,
    // InAppBrowser
  ]
})
export class AppModule { }
