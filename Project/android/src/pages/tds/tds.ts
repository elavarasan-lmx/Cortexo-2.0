import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';

/**
 * Generated class for the TermsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-tds',
  templateUrl: 'tds.html',
})
export class TDSPage {
  tdsvalue: number = 0;
  gstvalue: number = 0;
  tds_tcs_enable: number = 0;
  calculateinputs = [];
  calculationFor = 1;
  calculatedresponse = { "totalweight": 0.00, "totalamt": 0.00, "totaltds": 0.00, "totalpayable": 0.00 };

  constructor(private toastCtrl: ToastController, public navCtrl: NavController, private cdRef: ChangeDetectorRef, public navParams: NavParams, public commonservice: CommonServiceProvider, private zone: NgZone) {
  }

  ionViewDidLoad() {
    this.calculateinputs = this.getinitialvalue();
    this.commonservice.gettdsvalues().subscribe(res => {
      this.tdsvalue = parseFloat(res['tds_value']);
      this.gstvalue = parseFloat(res['admin_igst']);
      this.tds_tcs_enable = parseInt(res['tds_tcs_enable']);
    });
  }

  getinitialvalue() {
    return [{ "weight": "", "rate": "", "payable": 0, "purity": "", "tds": "" }];
  }
  valChange(value: number, index: number, type: number): void {
    this.zone.run(() => {
      if (type == 3 || type == 4) {
        let pattern = /^\d{1,2}(?:\.\d{1,2})?$/;
        let result = pattern.test(value.toString());
        if (!result) {
          if (value >= 100) {
            /* this.calculateinputs.forEach((calval, calkey) => {
              if (calkey == index) {
                this.calculateinputs[calkey].purity = '100';
                this.cdRef.detectChanges();
              }
            }); */
            if (type === 3) {
              this.calculateinputs[index].purity = value == 100 ? value : 100;

            } else if (type === 4) {
              this.calculateinputs[index].tds = value == 100 ? value : 100;
            }


            //this.cdRef.detectChanges();

            //this.cdRef.detectChanges();
          } else {
            value = parseFloat(value.toString().substring(0, value.toString().length - 1));
            this.calculateinputs.forEach((calval, calkey) => {
              if (calkey == index) {
                if (type === 3) {
                  this.calculateinputs[calkey].purity = this.calculateinputs[calkey].purity.substring(0, this.calculateinputs[calkey].purity.length - 1);
                } else if (type === 4) {
                  this.calculateinputs[calkey].tds = this.calculateinputs[calkey].tds.substring(0, this.calculateinputs[calkey].tds.length - 1);
                }
                this.cdRef.detectChanges();
              }
            });
          }
        }
      }
    });
    this.calculateinputs.forEach((calval, calkey) => {
      if (calkey == index) {
        if (calval.weight != "" && calval.rate != "") {
          if (!isNaN(parseFloat(calval.weight)) && !isNaN(parseFloat(calval.rate)) && !isNaN(parseFloat(calval.purity)) && !isNaN(parseFloat(calval.tds))) {
            this.calculateinputs[calkey].payable = ((parseFloat(calval.weight) * parseFloat(calval.rate)) * (parseFloat(calval.purity) / 100)).toFixed(0);
          } else {
            this.calculateinputs[calkey].payable = 0;
          }
        } else {
          this.calculateinputs[calkey].payable = 0;
        }
      }
    });
    this.calculatesummary();
  }
  removecalrow(index: number) {
    if (index > 0) {
      this.calculateinputs.splice(index, 1);
    } else {
      if (this.calculateinputs.length > 1) {
        this.calculateinputs.splice(index, 1);
      }
      else {
        this.calculateinputs[index].payable = 0;
        this.calculateinputs[index].rate = "";
        this.calculateinputs[index].weight = "";
        this.calculateinputs[index].purity = "";
        this.calculateinputs[index].tds = "";
      }

    }
    this.calculatesummary();
  }
  addcalrow() {
    const rowpossible = this.calculateinputs.every(row =>
      row.weight && row.rate && row.purity && row.tds
    );

    if (!rowpossible) {
      this.showToast("Please fill all fields");
      return;
    }

    this.calculateinputs.push({ weight: "", purity: "", rate: "", payable: 0, tds: "" });
    this.calculatesummary();
  }

  showToast(message: string) {
    const toast = this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  // calculatesummary() {
  //   //calculatedresponse = { "totalweight": 0.00, "totalamt": 0.00, "totaltds": 0.00, "totalpayable": 0.00 };
  //   let totalweight = 0, totalamt = 0, totaltds = 0, totalpayable = 0;
  //   this.calculateinputs.forEach((calval, calkey) => {
  //     if (!isNaN(parseFloat(calval.weight)) && !isNaN(parseFloat(calval.rate)) && !isNaN(parseFloat(calval.purity)) && calval.weight != "" && calval.rate != "" && calval.purity != "") {
  //       totalamt += parseFloat(calval.payable);
  //     }
  //     if (!isNaN(parseFloat(calval.weight)) && calval.weight != "") {
  //       totalweight += parseFloat(calval.weight);
  //     }

  //   });
  //   this.calculatedresponse.totalweight = parseFloat(totalweight.toFixed(3));
  //   this.calculatedresponse.totalamt = parseFloat(totalamt.toFixed(0));
  //   if (this.tdsvalue > 0) {
  //     let gstval = this.gstvalue + 100;
  //     if (this.calculationFor == 1) {
  //       totaltds = parseFloat((((totalamt * 100) / (gstval)) * (this.tdsvalue / 100)).toFixed(2));
  //     } else {
  //       totaltds = parseFloat((totalamt * (this.tdsvalue / 100)).toFixed(2));
  //     }
  //   }

  //   this.calculatedresponse.totaltds = Math.round(totaltds);
  //   if (this.calculationFor == 1) {
  //     totalpayable = parseFloat((totalamt - totaltds).toFixed(2));
  //   } else {
  //     totalpayable = parseFloat((totalamt + totaltds).toFixed(2));
  //   }
  //   this.calculatedresponse.totalpayable = Math.round(totalpayable);
  // }
  calculatesummary() {
    let totalweight = 0, totalamt = 0, totaltds = 0, totalpayable = 0, tds_amt = 0, pay_amt = 0, total_rate_row = 0, total_amount_row = 0;
    this.calculateinputs.forEach((calval, calkey) => {
      let weight_row = parseFloat(calval.weight) || 0;
      let total_rate_row = parseFloat(calval.payable) || 0;
      let total_amount_row = parseFloat(calval.amount) || 0;
      let purity_row = parseFloat(calval.purity) || 0;
      let rate_row = parseFloat(calval.rate) || 0;
      let tds = parseFloat(calval.tds) || 0;
      if (!isNaN(parseFloat(calval.amount)) && calval.amount != "") {
        totalpayable += parseFloat(calval.amount);
      }


      let gstval = this.gstvalue;
      if (this.calculationFor == 1) {
        tds_amt = parseFloat(((total_rate_row * 100 / (gstval + 100)) * (tds / 100)).toFixed(2));
        pay_amt = total_rate_row - tds_amt;
        totalweight = totalweight + weight_row;
        totalamt = total_rate_row + totalamt;
        totalpayable = pay_amt + totalpayable;
      } else {
        tds_amt = parseFloat((total_rate_row * (tds / 100)).toFixed(2));
        pay_amt = total_rate_row + tds_amt;
        totalweight = totalweight + weight_row;
        totalamt = total_rate_row + totalamt;
        totalpayable = pay_amt + totalpayable;
      }

      totaltds = totaltds + tds_amt;
      // totalpayable 	= pay_amt + totalpayable;
    });

    this.calculatedresponse.totalweight = Math.round(totalweight);
    this.calculatedresponse.totalpayable = Math.round(totalpayable);
    this.calculatedresponse.totaltds = Math.round(totaltds);
    this.calculatedresponse.totalamt = Math.round(totalamt);
  }
  updateCalculationType(type) {
    this.calculationFor = type;
    this.calculatesummary();
  }
  // puritychange(value, index) {
  //   console.log(index);
  //   let pattern = /^\d{1,2}(?:\.\d{1,2})?$/;
  //   let result = pattern.test(value);
  //   if (!result) {
  //     this.calculateinputs.forEach((calval, calkey) => {
  //       if (calkey == index) {
  //         this.calculateinputs[calkey].purity = this.calculateinputs[calkey].purity.substring(0, this.calculateinputs[calkey].purity.length - 1);
  //         console.log(this.calculateinputs[calkey].purity.substring(0, this.calculateinputs[calkey].purity.length - 1));
  //         this.cdRef.detectChanges();
  //       }
  //     });
  //   }
  // }


  validateKeypress(event: any, index: number, type: number): boolean {
    const key = event.key;
    const currentValue = this.calculateinputs[index][type === 1 ? 'weight' : 'rate'] || '';

    if (!/[0-9.]/.test(key)) {
      event.preventDefault();
      return false;
    }

    if (key === '.' && currentValue.indexOf('.') !== -1) {
      event.preventDefault();
      return false;
    }

    const parts = currentValue.split('.');
    const maxDecimals = type === 1 ? 3 : 2;

    if (parts.length === 2 && parts[1].length >= maxDecimals) {
      event.preventDefault();
      return false;
    }

    if (parts[0].length >= 10 && key !== '.') {
      event.preventDefault();
      return false;
    }

    return true;
  }

  preventMinus(event: any) {
    if (event.key === '-' || event.keyCode === 189 || event.keyCode === 109 || event.charCode === 45 || event.data === '-') {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }

}
