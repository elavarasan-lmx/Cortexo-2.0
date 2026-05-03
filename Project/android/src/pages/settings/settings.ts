import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UpdateprofilePage } from "../updateprofile/updateprofile";
import { ChangepasswordPage } from "../changepassword/changepassword";

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  items: any = [];
	itemSelected(item: string) {
		console.log("Selected Item", item);
	}

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.items = [
      { title: 'Update Profile', iconname: 'person', component: UpdateprofilePage },
      { title: 'Change Password', iconname: 'key', component: ChangepasswordPage },
    ];
  }

  openPage(page) {
    this.navCtrl.push(page.component);
	}

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

}
