import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { LoadingController } from "ionic-angular";
// import { Socket, SocketIoModule, SocketIoConfig } from "ng-socket-io";
import { Observable } from "rxjs/Observable";
import { Subscription as Sub } from "rxjs/Subscription";
import "rxjs/Rx";
import "rxjs/add/observable/interval";
declare var io: any;
import * as CryptoJS from 'crypto-js';
/*
  Generated class for the LiveratesProvider provider.
  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

declare var baserateapiurl: any;
declare var socketurl: any;
declare var flag_settings: any;
declare var bcurl: any;
declare var bcclient: any;
declare var bcusername: any;
declare var bcpassword: any;
declare var bcupdatetime: any;
declare var app_header_chk: any;
declare var rateFeed: any;
declare var polling: any;

@Injectable()
export class LiveratesProvider {
  fncallback: any;
  rfcallback: any;
  lsClient: any;
  subscription: any;
  sub: Sub;
  bcupdatetime: any;
  private refreshInterval: any = null;
  private isLoading = false;
  private ws: WebSocket;
  private nativeRateObserver: any;
  private nativeBufferedData: string = null;
  private wsReconnectTimer: any = null;
  private wsReconnectAttempts: number = 0;
  private wsMaxReconnectDelay: number = 30000;  // Max 30s between retries
  private wsBaseReconnectDelay: number = 1000;   // Start with 1s

  // Observer storage — survives socket reconnection
  private commodityUpdateObservers: any[] = [];
  private commodityUpdatesObservers: any[] = [];
  private rpanelObservers: any[] = [];
  private marqueeObservers: any[] = [];
  private newsObservers: any[] = [];
  private mainSocketListenersAttached: boolean = false;

  // Cache for merged full rate state (native WebSocket sends partial updates)
  // Seed with default market-open status (type 4) since native WS may not send it
  // Format: type\tsubId\t-\tmarketOpen\tcustomMsgFlag\tmsgText
  private mergedRateCache: any = {
    '4|status': ['4', '4', '-', '1', '0', ''].join('\t')
  };


  // Socket Config
  socket_data: any;
  config: any = {
    url: socketurl,
    options: {
      transports: polling === 1 ? ['websocket', 'polling'] : ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      timeout: 20000
    }
  };

  // rate Socket
  configRateSocket: any = {
    url: bcurl,
    options: {
      path: "/ratesocket/socket.io",
      transports: polling === 1 ? ['websocket', 'polling'] : ['websocket'],
      auth: {
        token: CryptoJS.SHA256('logiMax@916#socket').toString()
      },
      upgrade: false,
      reconnection: true,
      timeout: 20000,
      jsonp: false
    }
  };

  socket: any;
  rateSocket: any;

  constructor(public http: Http, private loadingCtrl: LoadingController) {
    if (flag_settings == 0) {
      this.getsettingData();
    }
    else {
      if (!this.refreshInterval) {
        this.refreshInterval = setInterval(() => {
          this.refreshData();
        }, bcupdatetime);
      }

      this.socket = io(this.config.url, this.config.options);
      this.attachSocketLogging(this.socket, 'mainSocket(constructor)');
      if (rateFeed === 3) {
        console.log('Initializing rateSockets (constructor) with URL:', JSON.stringify(this.configRateSocket.url));
        this.rateSocket = io(this.configRateSocket.url, this.configRateSocket.options);

        this.rateSocket.on('connect', () => {
          console.log('rateSocket (constructor) connected successfully');
        });

        this.rateSocket.on('connect_error', (err) => {
          console.log('rateSocket (constructor) connect_error:', JSON.stringify(err));
        });
      } else if (rateFeed === 4) {
        this.connectNativeWebSocket();
      }
    }
  }
  public getRateUpdatesNative() {
    let observable = new Observable(observer => {
      this.nativeRateObserver = observer;
      // Emit buffered data that arrived before subscription
      if (this.nativeBufferedData) {
        observer.next(this.nativeBufferedData);
        this.nativeBufferedData = null;
      }
    });
    return observable;
  }

  // Symbol mapping: short name → [contractSymbol, displayName]
  private symbolMap: any = {
    'G': ['SPOT-GOLD', 'GOLD($)'],
    'S': ['SPOT-SILVER', 'SILVER($)'],
    'I': ['SPOT-INR', 'INR(₹)']
  };

  // Commodity mapping: name → contractSymbol (built dynamically from getsettings)
  private contractMap: any = {};

  // Cache for high/low/close values per symbol (handles partial updates)
  private nativeRateCache: any = {};

  /**
   * Transforms pipe-delimited native WebSocket data into the tab-delimited
   * format expected by baserateInit.
   *
   * The server may send partial updates (bid|ask only) when high/low haven't
   * changed, so we cache the last known high/low per symbol.
   *
   * Input:  2|GOLD|161625|161814|162512|159320
   * Output: 2\tGOLDAPR\tGOLD\t161625\t161814\t162512\t159320\t161625\t\t\t-
   */
  private transformNativeData(raw: string): void {
    const lines = raw.trim().split('\n');
    lines.forEach(line => {
      const parts = line.trim().split('|');
      const type = parts[0];

      if (type === '1' || type === '2') {
        const symbol = parts[1];
        const bid = parts[2] || '';
        const ask = parts[3] || '';

        // Handle partial updates: server sends only bid|ask when high/low unchanged
        let high = parts[4] || '';
        let low = parts[5] || '';

        const cacheKey = type + '_' + symbol;

        if (!high && !low && this.nativeRateCache[cacheKey]) {
          // Partial update — use cached high/low
          high = this.nativeRateCache[cacheKey].high || '';
          low = this.nativeRateCache[cacheKey].low || '';
        }

        // Store close from first tick, then keep it; use bid as initial fallback
        let close = '';
        if (this.nativeRateCache[cacheKey] && this.nativeRateCache[cacheKey].close) {
          close = this.nativeRateCache[cacheKey].close;
        } else {
          close = bid;
        }

        // Update cache
        this.nativeRateCache[cacheKey] = { high, low, close, bid, ask };

        let contractSymbol: string;
        let displayName: string;

        if (this.symbolMap[symbol]) {
          contractSymbol = this.symbolMap[symbol][0];
          displayName = this.symbolMap[symbol][1];
        } else if (this.contractMap[symbol]) {
          contractSymbol = this.contractMap[symbol];
          displayName = symbol;
        } else {
          contractSymbol = symbol;
          displayName = symbol;
        }

        const row = [type, contractSymbol, displayName, bid, ask, high, low, close, '', '', '-'].join('\t');
        // Store in merged cache keyed by type|contractSymbol
        this.mergedRateCache[type + '|' + contractSymbol] = row;

      } else if (type === '3') {
        // Commodity rates: 3|com_id|bid|ask
        // baserateInit expects: [0]=type, [1]=com_id, [2]=placeholder, [3]=bid, [4]=ask
        const comId = parts[1];
        const bid = parts[2] || '-';
        const ask = parts[3] || '-';
        const row = [type, comId, '-', bid, ask].join('\t');
        this.mergedRateCache[type + '|' + comId] = row;

      } else if (type === '4') {
        // Market status raw: 4|subId|marketOpen|customMsgFlag|msgText
        // baserateInit expects: [0]=type, [1]=?, [2]=?, [3]=marketOpen, [4]=customMsgFlag, [5]=msgText
        const subId = parts[1] || '4';
        const marketOpen = parts[2] || '0';
        const customMsgFlag = parts[3] || '0';
        const msgText = parts[4] || '';
        const row = [type, subId, '-', marketOpen, customMsgFlag, msgText].join('\t');
        this.mergedRateCache['4|status'] = row;

      }
    });
  }

  /**
   * Returns the full merged rate state — all cached rows joined by newline.
   * Ordered: type 1 (base), type 2 (current), type 3 (commodity), type 4 (market status)
   */
  public getFullMergedState(): string {
    const keys = Object.keys(this.mergedRateCache);
    // Sort by type so baserateInit processes them in order: 1, 2, 3, 4
    keys.sort((a, b) => {
      const typeA = parseInt(a.split('|')[0]);
      const typeB = parseInt(b.split('|')[0]);
      return typeA - typeB;
    });
    return keys.map(k => this.mergedRateCache[k]).join('\n');
  }

  /**
   * Returns cached rate state if real data exists (more than just the default market status seed).
   * Returns null if no rate data has been received yet.
   */
  public getCachedState(): string | null {
    const keys = Object.keys(this.mergedRateCache);
    // Only return if we have more than the default '4|status' seed
    if (keys.length <= 1) return null;
    return this.getFullMergedState();
  }


  public getcommodityupdatetimecallback() {
    let observable = new Observable(observer => {
      this.commodityUpdateObservers.push(observer);
      this.attachMainSocketListeners();
    })
    return observable;
  }
  public getcommodityupdatescallback() {
    let observable = new Observable(observer => {
      this.commodityUpdatesObservers.push(observer);
      this.attachMainSocketListeners();
    })
    return observable;
  }
  public getrpanelrateupdatescallback() {
    let observable = new Observable(observer => {
      this.rpanelObservers.push(observer);
      this.attachMainSocketListeners();
    })
    return observable;
  }
  public getmarqueeupdatescallback() {
    let observable = new Observable(observer => {
      this.marqueeObservers.push(observer);
      this.attachMainSocketListeners();
    })
    return observable;
  }
  public getnewsupdatescallback() {
    let observable = new Observable((observer) => {
      this.newsObservers.push(observer);
      this.attachMainSocketListeners();
    });
    return observable;
  }

  /**
   * Attaches all main socket event listeners to the CURRENT this.socket.
   * Called on first subscription and after every reconnect() to ensure
   * observers always receive data from the active socket instance.
   */
  private attachMainSocketListeners(): void {
    if (!this.socket) return;

    // Remove old listeners to prevent duplicates
    this.socket.off("wltradeupdate:App\\Events\\WLTradeStatusUpdate");
    this.socket.off("maharajupdatecommodity:App\\Events\\MAHARAJCommodityUpdates");
    this.socket.off("maharajupdaterpanel:App\\Events\\MAHARAJRpanelUpdates");
    this.socket.off("maharajupdatemarquee:App\\Events\\MAHARAJMarqueeUpdates");
    this.socket.off("maharajupdatenews:App\\Events\\MAHARAJNewsUpdates");

    // Trade status updates
    this.socket.on("wltradeupdate:App\\Events\\WLTradeStatusUpdate", (data) => {
      console.log('socket event: WLTradeStatusUpdate', JSON.stringify(data));
      if (data.updatedata !== 'undefined') {
        let tradingstatus = data.updatedata;
        tradingstatus.forEach(function (value, key) {
          if (value.client == localStorage.getItem('MAHARAJ_client')) {
            localStorage.setItem('MAHARAJ_trade_enable', value.trade_enable);
          }
        });
      }
      this.commodityUpdateObservers.forEach(obs => {
        try { obs.next(data.updatedata); } catch (e) { }
      });
    });

    // Commodity updates
    this.socket.on("maharajupdatecommodity:App\\Events\\MAHARAJCommodityUpdates", (data) => {
      console.log('socket event: CommodityUpdates');
      this.commodityUpdatesObservers.forEach(obs => {
        try { obs.next(data.updatedata); } catch (e) { }
      });
    });

    // R-panel rate updates
    this.socket.on("maharajupdaterpanel:App\\Events\\MAHARAJRpanelUpdates", (data) => {
      this.rpanelObservers.forEach(obs => {
        try { obs.next(data.updatedata); } catch (e) { }
      });
    });

    // Marquee updates
    this.socket.on("maharajupdatemarquee:App\\Events\\MAHARAJMarqueeUpdates", (data) => {
      this.marqueeObservers.forEach(obs => {
        try { obs.next(data.updatedata.mrq_text); } catch (e) { }
      });
    });

    // News updates
    this.socket.on("maharajupdatenews:App\\Events\\MAHARAJNewsUpdates", (data) => {
      console.log('socket event: NewsUpdates');
      this.newsObservers.forEach(obs => {
        try { obs.next(data.updatedata); } catch (e) { }
      });
    });

    this.mainSocketListenersAttached = true;
    console.log('attachMainSocketListeners: all listeners bound to current socket');
  }

  public refreshData() {
    if (this.isLoading) return;
    this.isLoading = true;

    const payload = {
      client: bcclient,
      username: bcusername,
      password: bcpassword
    };

    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (app_header_chk == 1) {
      headers.append("X-Api-Key", "MAHARAJ@Logimax#");
    }
    const options = new RequestOptions({ headers });
    if (rateFeed == 0 || rateFeed == 1 || rateFeed == 2) {
      this.http.post(bcurl, JSON.stringify(payload), options)
        .toPromise()
        .then(response => {
          this.rfcallback(response['_body']);
        })
        .catch(err => {
          console.error("API error:", JSON.stringify(err));
        })
        .then(() => {
          this.isLoading = false;
        });
    }
  }
  getrfcallback(fn) {
    this.rfcallback = fn;
  }

  public getcommodities() {
    return this.http
      .get(BaseURL + "index.php/C_booking/getcommodities")
      .map((res) => res.json());
  }

  public getmarqueetext() {
    return this.http
      .get(BaseURL + "index.php/C_booking/getmarqueetext")
      .map((res) => res.json());
  }

  public getmjdmarates() {
    return this.http
      .get(BaseURL + "api/getmjdmarates.php")
      .map((res) => res.json());
  }
  public getcjarates() {
    return this.http.get(BaseURL + 'api/getcjarates.php?version=1').map(res => res.json());
  }
  public getnews() {
    return this.http.get(BaseURL + 'index.php/C_booking/getmobileappevents').map(res => res.json());
  }
  public getvideo() {
    return this.http.get(BaseURL + 'index.php/C_booking/getmobileappvideos').map(res => res.json());
  }
  public getlbmarates() {
    return this.http.get(BaseURL + 'api/lbmarates.php?version=1').map(res => res.json());
  }
  public getsettingData(): any {
    console.log(1);
    var my_Date = new Date();
    return this.http
      .get(BaseURL + "api/getsettings.php" + "?nocache=" + my_Date.getUTCSeconds())
      .map((response) => {
        let result = response.json();
        bcurl = result.bcurl;
        bcclient = result.bcclient;
        bcusername = result.bcusername;
        bcpassword = result.bcpassword;
        bcupdatetime = result.bcupdatetime;
        app_header_chk = result.app_header_chk;
        rateFeed = result.rateFeed;

        this.refreshData();
        setInterval(() => this.refreshData(), bcupdatetime);
        this.socket = io(this.config.url, this.config.options);
        this.attachSocketLogging(this.socket, 'mainSocket(settings)');
        if (rateFeed == 3) {
          this.rateSocket = io(this.configRateSocket.url, this.configRateSocket.options);
        } else if (rateFeed == 4) {
          this.connectNativeWebSocket();
        }
      }).toPromise();
  }

  public reconnect() {
    console.log('LiveratesProvider: reconnect() called');

    // 1. Disconnect existing socket.io sockets
    if (this.socket) {
      try { this.socket.disconnect(); } catch (e) { console.log('socket disconnect error', e); }
    }
    if (this.rateSocket) {
      try { this.rateSocket.disconnect(); } catch (e) { console.log('rateSocket disconnect error', e); }
    }

    // 2. Close existing native WebSocket
    if (this.ws) {
      try { this.ws.close(); } catch (e) { console.log('ws close error', e); }
      this.ws = null;
    }

    // 3. Clear existing polling interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    // 4. Re-create everything
    this.isLoading = false;

    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, bcupdatetime);

    // Reset reconnect state for clean start
    this.wsReconnectAttempts = 0;
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer);
      this.wsReconnectTimer = null;
    }

    this.config.url = socketurl;
    this.socket = io(this.config.url, this.config.options);
    this.attachSocketLogging(this.socket, 'mainSocket(reconnect)');
    // Re-attach all event listeners to the NEW socket instance
    this.attachMainSocketListeners();

    if (rateFeed === 3) {
      this.configRateSocket.url = bcurl;
      this.rateSocket = io(this.configRateSocket.url, this.configRateSocket.options);
      this.rateSocket.on('connect', () => console.log('rateSocket reconnected'));
      this.rateSocket.on('connect_error', (err) => console.log('rateSocket reconnect_error:', JSON.stringify(err)));
    } else if (rateFeed === 4) {
      this.connectNativeWebSocket();
    }

    // 5. Trigger an immediate data refresh
    this.refreshData();
    console.log('LiveratesProvider: reconnect() completed');
  }

  public getRateUpdates() {
    let observable = new Observable(observer => {
      this.rateSocket.on("rateUpdate", function (data) {
        console.log(JSON.stringify(data.rate));
        observer.next(data.rate);
      });
    })
    return observable;
  }

  /**
   * Centralized native WebSocket connection with auto-reconnect.
   * Uses exponential backoff: 1s, 2s, 4s, 8s ... up to 30s max.
   */
  private connectNativeWebSocket(): void {
    // Clean up any existing connection
    if (this.ws) {
      try { this.ws.close(); } catch (e) { }
      this.ws = null;
    }

    console.log('NativeWebSocket: connecting to', bcurl, '(attempt', this.wsReconnectAttempts + 1 + ')');
    this.ws = new WebSocket(bcurl, ['98aa523f3eca1469f2b8115c78579b88c3a2dacaa043be7f87fad20ce7c2a8a3']);

    this.ws.onopen = () => {
      console.log('NativeWebSocket: connected successfully');
      this.wsReconnectAttempts = 0; // Reset backoff on successful connection
    };

    this.ws.onmessage = (event) => {
      this.transformNativeData(event.data);
      const fullState = this.getFullMergedState();
      if (this.rfcallback) {
        this.rfcallback(fullState);
      }
    };

    this.ws.onerror = (error) => {
      console.log('NativeWebSocket: error:', JSON.stringify(error));
    };

    this.ws.onclose = (event) => {
      console.log('NativeWebSocket: closed (code:', event.code, 'reason:', event.reason, ')');
      // Auto-reconnect with exponential backoff
      this.scheduleWsReconnect();
    };
  }

  /**
   * Schedules a WebSocket reconnection with exponential backoff.
   */
  private scheduleWsReconnect(): void {
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer);
    }

    const delay = Math.min(
      this.wsBaseReconnectDelay * Math.pow(2, this.wsReconnectAttempts),
      this.wsMaxReconnectDelay
    );
    this.wsReconnectAttempts++;

    console.log('NativeWebSocket: scheduling reconnect in', delay + 'ms (attempt', this.wsReconnectAttempts + ')');
    this.wsReconnectTimer = setTimeout(() => {
      this.connectNativeWebSocket();
    }, delay);
  }

  /**
   * Attaches lifecycle logging to a socket.io instance for debugging.
   */
  private attachSocketLogging(socket: any, label: string): void {
    socket.on('connect', () => {
      console.log(label + ': connected');
    });
    socket.on('disconnect', (reason) => {
      console.log(label + ': disconnected — reason:', reason);
      // If server disconnected us, socket.io won't auto-reconnect; force it
      if (reason === 'io server disconnect') {
        console.log(label + ': server forced disconnect, reconnecting...');
        socket.connect();
      }
    });
    socket.on('reconnect', (attemptNumber) => {
      console.log(label + ': reconnected after', attemptNumber, 'attempts');
    });
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(label + ': reconnect attempt #' + attemptNumber);
    });
    socket.on('reconnect_error', (error) => {
      console.log(label + ': reconnect_error:', JSON.stringify(error));
    });
    socket.on('reconnect_failed', () => {
      console.log(label + ': reconnect_failed — all attempts exhausted');
    });
    socket.on('connect_error', (err) => {
      console.log(label + ': connect_error:', JSON.stringify(err));
    });
  }

}
export const BaseURL = 'http://www.maharajgoldsmith.com/';
