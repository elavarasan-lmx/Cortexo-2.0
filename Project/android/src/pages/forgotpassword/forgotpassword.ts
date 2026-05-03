import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, AlertController, Events } from 'ionic-angular';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
/**
 * Generated class for the ForgotpasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-forgotpassword',
  templateUrl: 'forgotpassword.html',
})
export class ForgotpasswordPage {
	public forgotpwdForm: FormGroup;
	public username: AbstractControl;
	public submitted: boolean = false;
	isDisabled: boolean = false;
	errorMessage: string = '';
	public authorization: any = [];
	public errormsg: string = '';
	
	constructor(public navCtrl: NavController, public navParams: NavParams, public builder: FormBuilder, private toastCtrl: ToastController, public loadingCtrl: LoadingController, private commonservice: CommonServiceProvider, public alertCtrl: AlertController, public events: Events) {
    this.forgotpwdForm = builder.group( {
      'username': ['', Validators.compose( [Validators.required, Validators.minLength( 10 )] )],
    });
    this.username = this.forgotpwdForm.controls['username'];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotpasswordPage');
  }

  public onSubmit( values: Object ): void {
		this.submitted = true;
		if(this.forgotpwdForm.valid){
			this.errorMessage = 'Please wait';
			//this.isDisabled = true;
			let loader = this.loadingCtrl.create({
				content: "Please wait..."
			});
			loader.present();
			let forgotData = {
				
			}
			let forgotpwdData = Object.assign({}, forgotData, values);

			this.commonservice.forgotPassword( JSON.stringify( forgotpwdData ) ).then( result => {				
				console.log(result.success);				
					if(result.success == true) {
						const alert = this.alertCtrl.create({
							title: 'Customer request',
							subTitle: result.message,
							buttons: [
								{
									text: 'Ok',
									handler: data => {
										this.events.publish( 'tab:changed', "LoginPage" );
										this.navCtrl.setRoot(LoginPage, {});
									}
								}
							]
						});
						alert.present();
						this.errorMessage = result.message;
						this.isDisabled = false;
						loader.dismiss();

					}else{
						const alert = this.alertCtrl.create({
						  title: 'Customer request',
						  subTitle: result.message,
						  buttons: ['OK']
						});
						alert.present();
						this.isDisabled = false;
						loader.dismiss();
					}
			}, error => {
				this.isDisabled = false;
				loader.dismiss();
			});
		}
	}
}
