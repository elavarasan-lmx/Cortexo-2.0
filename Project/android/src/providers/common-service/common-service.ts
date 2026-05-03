import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the CommonServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CommonServiceProvider {
    constructor(public http: HttpClient) {
        console.log('Hello CommonServiceProvider Provider');
    }

    public settingsData(params): any {
        console.log("sett: ", params);
        console.log("URL: ", BaseURL + 'index.php/C_mobile/viewsettingsdata')
        return this.http
            .post(BaseURL + 'index.php/C_mobile/viewsettingsdata', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public checksettingsData(params): any {
        console.log(params);
        return this.http
            .post(BaseURL + 'index.php/C_mobile/checksettingsdata', params)
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public doRegister(params): any {
        return this.http
            .post(BaseURL + 'index.php/C_mobile/registeruserdata', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }
    public sliderimgs(): any {
        return this.http
            .get(BaseURL + 'index.php/c_booking/getadvertisements')
            .map((response) => {
                // some response manipulation
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public doOTPVerify(params): any {
        return this.http
            .post(BaseURL + 'index.php/C_mobile/verifyuserregotp', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public resendOTP(params): any {
        return this.http
            .post(BaseURL + 'index.php/C_mobile/resendotp', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    // public sendEnquiry(params): any {
    //     return this.http
    //         .post(BaseURL + 'androidmail_enquiry.php', params)
    //         .map((response) => {
    //             let result = response;
    //             console.log(result);
    //             return result;
    //         })
    //         .toPromise();
    // }

    public sendEnquiry(params): any {
        return this.http
            .post(BaseURL + 'index.php/C_mobile/enquiry_mail', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public doLogin(params): any {
        return this.http
            .post(BaseURL + 'mobileapi/index.php/C_mobileclient/user_login', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public forgotPassword(params): any {
        return this.http
            .post(BaseURL + 'mobileapi/index.php/C_mobileclient/forgotPassword', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public doUserRegister(params): any {
        return this.http
            .post(BaseURL + 'mobileapi/index.php/C_mobileclient/user_registration', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public doUserRegisterwithOtp(params): any {
        return this.http
            .post(BaseURL + 'mobileapi/index.php/C_mobileclient/user_registration_withotp', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public changePassword(params): any {
        return this.http
            .post(BaseURL + 'mobileapi/index.php/C_mobileclienttrade/changePassword', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public updateProfile(params): any {
        return this.http
            .post(BaseURL + 'mobileapi/index.php/C_mobileclienttrade/updateProfile', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public VerifyOtp(params): any {
        return this.http
            .post(BaseURL + 'mobileapi/index.php/C_mobileclient/user_registration_withotp', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public userresendOTP(mobile, email): any {
        var my_Date = new Date();
        return this.http
            .get(BaseURL + "mobileapi/index.php/C_mobileclient/resendotp?mobile=" + mobile + "&email=" + email + "&nocache=" + my_Date.getUTCSeconds())
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public getBookingReport(userid, fromdate, todate): any {
        console.log(userid + " " + fromdate + " => " + todate);
        var my_Date = new Date();
        return this.http
            .get(BaseURL + "mobileapi/index.php/C_mobileclienttrade/booking_report?cusid=" + userid + "&from=" + fromdate + "&to=" + todate + "&nocache=" + my_Date.getUTCSeconds())
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public Customer_Order_CancelById(cusid, orderid): any {
        var my_Date = new Date();
        return this.http
            .get(BaseURL + "mobileapi/index.php/C_mobileclienttrade/customerOrderCancel?cusid=" + cusid + "&orderid=" + orderid + "&nocache=" + my_Date.getUTCSeconds())
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public getCustomer_AllOpenOrders(userid): any {
        var my_Date = new Date();
        return this.http
            .get(BaseURL + "mobileapi/index.php/C_mobileclienttrade/customerAllOpenorders?cusid=" + userid + "&nocache=" + my_Date.getUTCSeconds())
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public getcustomer_transactions(userid, fromdate, todate): any {
        var my_Date = new Date();
        return this.http
            .get(BaseURL + "mobileapi/index.php/C_mobileclienttrade/customer_transactions?cusid=" + userid + "&from=" + fromdate + "&to=" + todate + "&nocache=" + my_Date.getUTCSeconds())
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public bookingRequest(customerrequestdetails): any {
        var my_Date = new Date();
        return this.http
            .post(BaseURL + "mobileapi/index.php/C_mobileclienttrade/bookingRequest?", customerrequestdetails)
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public updatebookRequest(customerrequestdetails): any {
        var my_Date = new Date();
        return this.http
            .post(BaseURL + "mobileapi/index.php/C_mobileclienttrade/updatebookRequest?", customerrequestdetails)
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public notifyBooking(params): any {
        var my_Date = new Date();
        return this.http
            .post(BaseURL + "mobileapi/index.php/C_mobileclienttrade/notifyBooking?", params)
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public logout(params): any {
        var my_Date = new Date();
        return this.http
            .post(BaseURL + "mobileapi/index.php/C_mobileclient/logout?", params)
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public getCommodities(cusid): any {
        var my_Date = new Date();
        var url = BaseURL + "mobileapi/index.php/C_mobileclienttrade/gettradecommodities?cusid=" + cusid + "&nocache=" + my_Date.getUTCSeconds();
        return this.http.
            get(url)
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }
    public galleryimg(): any {
        return this.http
            .get(BaseURL + 'index.php/c_booking/getgallery')
            .map((response) => {
                // some response manipulation
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }
    public getClientLimit(userid): any {
        var my_Date = new Date();
        return this.http
            .get(BaseURL + "mobileapi/index.php/C_mobileclienttrade/tradable_status?cusid=" + userid + "&nocache=" + my_Date.getUTCSeconds())
            .map((response) => {
                // some response manipulation
                let result = response;
                return result;
            })
            .toPromise();
    }
    public getratealerttolerance() {
        return this.http.get(BaseURL + "index.php/C_client_main/ratealertTolerance").map(res => res);
    }
    public getAlertTollarence(): any {
        var my_Date = new Date();
        return this.http
            .post(BaseURL + "index.php/C_client_main/getratealerttollarance", '')
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public getratealertlist(uuid): any {
        var my_Date = new Date();
        return this.http
            .post(BaseURL + "index.php/C_client_main/getratealertlist", JSON.stringify({ 'uuid': uuid }))
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public ratealertDelete(data): any {
        var my_Date = new Date();
        return this.http
            .post(BaseURL + "index.php/C_client_main/ratealertDelete", data)
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public ratealertRequest(data): any {
        var my_Date = new Date();
        return this.http
            .post(BaseURL + "index.php/C_client_main/ratealertRequest", data)
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public getphonenumbers() {
        return this.http.get(BaseURL + 'api/phonenumberdetails.php').map(res => res);
    }
    public getcontactusdetails() {
        return this.http.get(BaseURL + 'api/contactusdetails.php').map(res => res);
    }
    public getaboutusdetails() {
        return this.http.get(BaseURL + 'api/aboutusdetails.php').map(res => res);
    }
    public getbankdetails() {
        return this.http.get(BaseURL + 'api/bankdetails.php').map(res => res);
    }

    public terms() {
        return this.http.get(BaseURL + 'api/terms.php').map(res => res);
    }
    public uploadedit(passworddata) {
        console.log(passworddata)
        return this.http
            .post(BaseURL + 'mobileapi/index.php/C_mobileclient/custom_proofupload/', passworddata)
            .map((response) => {
                // some response manipulation
                let result = response;
                return result;
            })
            .toPromise();
    }
    public getpendingReport(userid): any {
        console.log(userid);
        var my_Date = new Date();
        return this.http
            .get(BaseURL + "mobileapi/index.php/C_mobileclienttrade/pendingdelv_report?cusid=" + userid + "&nocache=" + my_Date.getUTCSeconds())
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }
    public terms1() {
        return this.http.get(BaseURL + 'api/trade_terms.php').map(res => res);
    }
    public gettdsvalues() {
        return this.http.get(BaseURL + 'index.php/c_booking/gettds').map(res => res);
    }
    public doKYCRegister(params): any {
        return this.http
            .post(BaseURL + 'mobileapi/index.php/C_mobileclient/user_kycregistration', params)
            .map((response) => {
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }
    public getmessages() {
        return this.http.get(BaseURL + 'index.php/C_client_main/MobileMessages').map(res => res);
    }
    public deleteacc(userid): any {
        return this.http
            .post(BaseURL + 'mobileapi/index.php/C_mobileclient/delete_customer', { 'id_customer': userid })
            .map((response) => {
                // some response manipulation
                let result = response;
                return result;
            })
            .toPromise();
    }
    public getunfixReport(userid): any {
        console.log(userid);
        var my_Date = new Date();
        return this.http
            .get(BaseURL + "mobileapi/index.php/C_mobileclienttrade/unfixreport?cusid=" + userid + "&nocache=" + my_Date.getUTCSeconds())
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }

    public premiumgroup(): any {
        return this.http
            .get(BaseURL + 'index.php/c_client_main/getpremiumgroup')
            .map((response) => {
                // some response manipulation
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }

    public socialsharing(params): any {
        return this.http
            .post(BaseURL + 'api/socialshare.php', params)
            .map((response) => {
                // some response manipulation
                let result = response;
                console.log(result);
                return result;
            })
            .toPromise();
    }


    public getGraphReport(data): any {
        var my_Date = new Date();
        return this.http
            .post(BaseURL + "mobileapi/index.php/C_mobileclienttrade/chart_data", data)
            .map((response) => {
                let result = response;
                return result;
            })
            .toPromise();
    }
    public getHistoricalReport(selected_comid, fromdate, todate): any {
        console.log(selected_comid + " " + fromdate + " => " + todate);
        var my_Date = new Date();
        return this.http
            .get(BaseURL + "mobileapi/index.php/C_mobileclienttrade/historical_report?comid=" + selected_comid + "&from=" + fromdate + "&to=" + todate + "&nocache=" + my_Date.getUTCSeconds())
            .map((response) => {
                // some response manipulation
                let result = response;
                return result;
            })
            .toPromise();
    }
}
export const BaseURL = 'http://www.maharajgoldsmith.com/';

