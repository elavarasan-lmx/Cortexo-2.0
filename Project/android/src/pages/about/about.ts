import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  aboutusdetails: any[] = [];

  constructor(
    public navCtrl: NavController,
    private commonservice: CommonServiceProvider
  ) {}

  ngAfterViewInit() {
    this.commonservice.getaboutusdetails().subscribe(res => {
      this.aboutusdetails = res['aboutus'];
    });
  }
}
