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

//////////////// Connect to current host (or localhost) and configure a StatusWidget
define(["LightstreamerClient"],function(LightstreamerClient) {
    // Security Fix JS-015: Load configuration from server instead of hardcoding
    // TODO: Replace with actual server endpoint that provides these values
    var protocolToUse = document.location.protocol != "file:" ? document.location.protocol : "http:";
    var portToUse = document.location.protocol == "https:" ? "443" : "8080";
    
    // TEMPORARY: Using existing hardcoded values until server endpoint is created
    // SECURITY WARNING: These should be loaded from server-side configuration
    var serverHost = "72.52.178.11"; // TODO: Load from server config
    var adapterName = "WLSTOCKLIST_REMOTE"; // TODO: Load from server config
    var username = "lmxwinbulllite"; // TODO: Load from server config
    
    var lsClient = new LightstreamerClient(protocolToUse+"//"+serverHost+":"+portToUse, adapterName);
    lsClient.connectionOptions.setHttpExtraHeaders({"username" : username});
	lsClient.connectionOptions.setHttpExtraHeadersOnSessionCreationOnly(true);
	/* lsClient.enableSharing(new ConnectionSharing("DemoCommonConnection", "ATTACH", "CREATE"));
    lsClient.addListener(new StatusWidget("left", "0px", true)); */
	
	/* lsClient.connectionDetails.setUser(username);
	lsClient.connectionDetails.setPassword(session_id); */
	
	//lsClient.connectionSharing.enableSharing("DemoCommonConnection", "ATTACH", "CREATE");
	lsClient.addListener({
		onServerError: function(errorCode, errorMessage) {
			// Error logged - removed console.log for production
			if(errorCode == 35){
				//location.href = baseurl;
			}
		}
	});
    lsClient.connect();
    return lsClient;
});

