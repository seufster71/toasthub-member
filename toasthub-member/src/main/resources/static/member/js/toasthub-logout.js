/**
 * @author Edward H. Seufert
 * Copyright (C) 2016 The ToastHub Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

toastHubLogout.prototype = Object.create(toastHubBase.prototype);
// reassign constructor
toastHubLogout.prototype.constructor = toastHubLogout;

toastHub.registerController("logout",new toastHubLogout("logout"));

////////////////////////////////////////////////////// Logout ////////////////////////////////////////////////
function toastHubLogout(instanceName){
	toastHubBase.call(this,instanceName,this);
	this.ajaxFunc = "member";
	this.service = "LOGOUT_SVC";
	var self = this;	
		
	this.initCustom = function(params){
		params.action = "LOGOUT";
	}
	
	this.processInit = function(JSONData) {
		toastHub.logSystem.log("DEBUG","toasthub-logout:toastHubLogout:processInit ");
		var x = document.createElement("div");
		if (JSONData != null && JSONData.params != null && JSONData.params.statusMessage != null) {
			toastHub.utils.applicationMessages(JSONData,true);
		} else {
			x.innerHTML = "Error processing request";
		}
		toastHub.containerContentObj.appendChild(x);
		
	}
	
	
	
	
} // toastHubLogout