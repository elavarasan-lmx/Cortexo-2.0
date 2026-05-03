import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { UpdaterequestPage } from '../updaterequest/updaterequest';

/**
 * Generated class for the PendingordersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-pendingorders',
  templateUrl: 'pendingorders.html',
})
export class PendingordersPage {
  bookingrequest: any;
  public comtype: any;
  fromdate: String;
  todate: String;
  allbookinglist = [];
  dispbookinglist = [];
  userid: any = "";
  dispbookinglist_len: any = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, private commonservice: CommonServiceProvider, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    var curDate = new Date();
    var numberOfDaysToSub = 10;
    var dd = curDate.getDate();
    var mm = curDate.getMonth() + 1;
    var y = curDate.getFullYear();
    //var today = new Date(y + "-" + mm + "-" + dd).toISOString().substring(0, 10);
    var today = new Date(new Date().getTime()).toISOString().substring(0, 10);
    this.todate = today;

    curDate.setDate(curDate.getDate() - numberOfDaysToSub);
    console.log(curDate);
    var ddd = curDate.getDate();
    var mmm = curDate.getMonth() + 1;
    var yy = curDate.getFullYear();
    var dateOffset = (24 * 60 * 60 * 1000) * 10;
    var exitday = new Date(new Date().getTime() - dateOffset).toISOString().substring(0, 10);
    this.fromdate = exitday;

    this.getAllOpenOrders();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PendingordersPage');
  }

  getAllOpenOrders() {
    if (this.todate != "" && this.fromdate != "" && this.todate >= this.fromdate) {
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();
      this.userid = localStorage.getItem('MAHARAJ_userId');
      this.commonservice.getCustomer_AllOpenOrders(this.userid).then((result) => {
        console.log("API result:", JSON.stringify(result));

        let bookings = [];

        // API format: {success: true, data: [[{...}]]}
        if (result && result.success && result.data) {
          let data = result.data;
          // data is [[{...}]] - flatten the nested array
          if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            bookings = data[0];
          } else if (Array.isArray(data)) {
            bookings = data;
          }
        }

        this.dispbookinglist = bookings;
        this.dispbookinglist_len = this.dispbookinglist.length;
        console.log("dispbookinglist:", JSON.stringify(this.dispbookinglist), "len:", this.dispbookinglist_len);
        loading.dismiss();
      });
    } else {
      let alert = this.alertCtrl.create({
        title: 'Ratehistory Report',
        message: 'Enter valid date!!!',
        buttons: ['ok']
      });
      alert.present();
    }
  };

  moredetails(id) {
    this.dispbookinglist.forEach(function (value, key) {
      if (value.book_no == id) {
        if (value.show_details == "1") {
          value.show_details = "0";
        } else {
          value.show_details = "1";
        }

      }
    });
  }

  editorder(book_no, book_rate, qty, com_name, book_comid, book_type, book_totalcost, book_request_amtwt, book_usercomment) {
    this.navCtrl.push(UpdaterequestPage, {
      'data_book_no': book_no,
      'data_book_rate': book_rate,
      'data_qty': qty,
      'data_com_name': com_name,
      'data_book_comid': book_comid,
      'data_book_type': book_type,
      'book_totalcost': book_totalcost,
      'book_request_amtwt': book_request_amtwt,
      'book_usercomment': book_usercomment
    });
  }

  cancelorder(orderId) {
    console.log("orderId: " + orderId);
    const alert = this.alertCtrl.create({
      title: 'Cancel Order',
      subTitle: 'Are you sure you want to cancel this order?',
      buttons: [
        {
          text: 'Ok',
          handler: data => {
            this.commonservice.Customer_Order_CancelById(this.userid, orderId).then(result => {
              if (result.success) {
                const alert1 = this.alertCtrl.create({
                  title: 'Customer request',
                  subTitle: result.message,
                  buttons: [{
                    text: 'OK',
                    handler: data => {
                      this.getAllOpenOrders();
                    }
                  }
                  ]
                });
                alert1.present();
              } else {
                const alert1 = this.alertCtrl.create({
                  title: 'Customer request',
                  subTitle: result.message,
                  buttons: ['OK']
                });
                //$state.go('app.liverates');
                alert1.present();
                console.log("ERROR: " + result.status);
              }
            });
          }
        }
      ]
    });

    alert.present();
    /*var confirmPopup = $ionicPopup.confirm({
     title	 : 'Cancel Order',
     template : 'Are you sure you want to cancel this order?'
   });
   confirmPopup.then(function(res) {
     if(res) {
       $scope.confirmcancelorder(orderId);
     } else {
       console.log('You are not sure');
     }
   });*/
  }

}
