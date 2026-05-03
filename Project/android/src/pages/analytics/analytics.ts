import { Component } from '@angular/core';
import { NavController, Events, Platform } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'page-analytics',
  templateUrl: 'analytics.html',
})
export class AnalyticsPage {
  loader = true;
  iframeSrc: SafeResourceUrl;
  iframeSrc2: SafeResourceUrl;
  iframeSrc3: SafeResourceUrl;
  iframeSrc4: SafeResourceUrl;

  constructor(
    public navCtrl: NavController,
    public events: Events,
    private sanitizer: DomSanitizer,
    private platform: Platform
  ) {
    // Hide loader after 2 seconds
    setTimeout(() => (this.loader = false), 2000);

    // Generate responsive TradingView URLs
    const width = this.platform.width(); // dynamic width
    const height = width * 1.2; // maintain ratio

    // 1. GOLD Technical Analysis
    const url1 = `https://s.tradingview.com/embed-widget/technical-analysis/?locale=in#%7B%22showIntervalTabs%22%3Atrue%2C%22width%22%3A${width}%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%2C%22symbol%22%3A%22TVC%3AGOLD%22%2C%22interval%22%3A%221m%22%2C%22height%22%3A${height}%2C%22utm_source%22%3A%22www.navaratnamaaligai.com%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22technical-analysis%22%7D`;
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url1);

    // 2. GOLD Symbol Overview
    const url2 = `https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=in#%7B%22symbol%22%3A%22TVC%3AGOLD%22%2C%22width%22%3A${width}%2C%22height%22%3A${height}%2C%22dateRange%22%3A%221d%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22%2337a6ef%22%2C%22underLineColor%22%3A%22%23e3f2fd%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Afalse%2C%22largeChartUrl%22%3A%22%22%2C%22utm_source%22%3A%22127.0.0.1%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22mini-symbol-overview%22%7D`;
    this.iframeSrc2 = this.sanitizer.bypassSecurityTrustResourceUrl(url2);

    // 3. SILVER Symbol Overview
    const url3 = `https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=in#%7B%22symbol%22%3A%22TVC%3ASILVER%22%2C%22width%22%3A${width}%2C%22height%22%3A${height}%2C%22dateRange%22%3A%221d%22%2C%22colorTheme%22%3A%22light%22%2C%22trendLineColor%22%3A%22%2337a6ef%22%2C%22underLineColor%22%3A%22%23e3f2fd%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Afalse%2C%22largeChartUrl%22%3A%22%22%2C%22utm_source%22%3A%22127.0.0.1%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22mini-symbol-overview%22%7D`;
    this.iframeSrc3 = this.sanitizer.bypassSecurityTrustResourceUrl(url3);

    // 4. USDINR Symbol Overview - Full featured version
    const config4 = {
      symbols: [["FX_IDC:USDINR|ALL"]],
      chartOnly: false,
      width: width,
      height: height,
      locale: "en",
      colorTheme: "light",
      autosize: false,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      maLineColor: "#2962FF",
      maLineWidth: 1,
      maLength: 9,
      headerFontSize: "small",
      lineWidth: 2,
      lineType: 0,
      dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
      isTransparent: false,
      utm_source: "www.navaratnamaaligai.com",
      utm_medium: "widget",
      utm_campaign: "symbol-overview"
    };

    const encodedConfig = encodeURIComponent(JSON.stringify(config4));
    const url4 = `https://s.tradingview.com/embed-widget/symbol-overview/?locale=en#${encodedConfig}`;
    this.iframeSrc4 = this.sanitizer.bypassSecurityTrustResourceUrl(url4);
  }
}