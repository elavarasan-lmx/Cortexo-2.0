/*
  Copyright (c) Lightstreamer Srl

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// Lightstreamer Portfolio Demo
// Table Management

//////////////// Portfolio Table Management

// the current portfolio should be chosen by the user according to the user profile;
// in this sample, user authentication is not included and a single portfolio is
// shared among all the connected users
//var liverateId = "Item";

// portfolio contents; provided by the PORTFOLIO_ADAPTER in COMMAND mode
var fieldList = ["GOLD-C", "GOLD-F", "MGOLD-C", "MGOLD-F", "SILVER-C", "SILVER-F", "MSILVER-C", "MSILVER-F", "SPOT-GOLD",  "SPOT-SILVER", "SPOT-INR"];

var cfieldsList = ["desc", "bid", "ask", "high", "low", "ltp"];

// cell highlighting time (milliseconds)
var hotTime = 500;

// fade effect (can be activated with trailing "fade=ON" in URL
var doFade = (location.search.indexOf("fade=ON") > -1);
var fadeTime = 300;

// will contain a reference to the DynaGrid instance
var portfolioGrid = null;

//////////////// Grid Sort Management

var initialSort = "desc";
var direction = false; // true = decreasing; false = increasing; null = no sort

//////////////// Subscription and Grid setup

require([ baseurl + "assets/js/lsClient.js","Subscription", "DynaGrid", "StaticGrid"], function(lsClient,Subscription, DynaGrid,  StaticGrid) {
  
		var grid = new StaticGrid("bidaskrates",true);
		grid.setNodeTypes(["div","span","img","a"]);
		grid.setAutoCleanBehavior(true,false);
			grid.addListener({
			  onVisualUpdate: function(key,info) {
				if (info == null) {
				  //cleaning
				  return;
				}
				var cold = (key.substring(4) % 2 == 1) ? "" : "";
			info.forEachChangedField(function(fieldName, val) {
				if(key == "SPOT-GOLD" || key == "SPOT-INR" || key == "SPOT-SILVER"){
					//info.setCellValue(fieldName, isNaN(val) ? val : ((val % 1) != 0) ? parseFloat(val).toFixed(2) : val);
					info.setCellValue(fieldName, isNaN(val) ? val : parseFloat(val).toFixed(2));
				}
				var lastPrice = info.getChangedFieldValue(fieldName);
				  if (lastPrice !== null && fieldName !== 'updatetime') {
					var prevPrice = grid.getValue(key,fieldName);
						if (prevPrice != null && lastPrice > prevPrice) {
							// console.log(prevPrice);
							//info.setAttribute("#2636f2",cold,"backgroundColor");
							// info.setAttribute("1em",null,"borderRadius");
							info.setAttribute("#39BD00",cold,"color");
						} else if (prevPrice != null && lastPrice < prevPrice) {
							//info.setAttribute("#FF0000",cold,"backgroundColor");
							// info.setAttribute("1em",null,"borderRadius");
							info.setAttribute("#FF0000",cold,"color");
						}else {
							info.setAttribute("",cold,"backgroundColor");
							// info.setAttribute(0,null,"borderRadius");
							info.setAttribute("",cold,"color");
						}
				  } 
				//formatDecimalField(info, fieldName);
			});	
	    }
		});
        var subscription = new Subscription("MERGE",grid.extractItemList(),grid.extractFieldList());
        subscription.addListener(grid);
        subscription.setDataAdapter("WLQUOTE_ADAPTER");
		subscription.setRequestedSnapshot("yes");
		subscription.setRequestedMaxFrequency(1);
        lsClient.subscribe(subscription);
});

