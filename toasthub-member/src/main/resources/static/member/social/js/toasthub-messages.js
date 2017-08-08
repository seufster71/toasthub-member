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

toastHubMessage.prototype = Object.create(toastHubBase.prototype); 
toastHubMessage.prototype.contructor = esMesssage;

toastHub.registerController("message",new toastHubMessage("message"));

function toastHubMessage(){
	toastHubBase.call(this,instanceName,this);
	this.ajaxFunc = "social";
	this.service = "MESSAGE_SVC";
	this.pageMetaName = "SOCIAL_MESSAGE";
	var self = this;
	
	/////////////////////////////////// init Messages ////////////////////////
	this.init = function(){
		this.initMessages();
	}; // init
	
	this.initMessages = function(){
		var callUrl = toastHub.utils.restUrl + this.ajaxFunc + "/init";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		requestFacade.id = pid;
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status == "ERROR"){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else if (JSONData.status == "INFO"){
					toastHub.utils.applicationInfoMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					toastHubMessagesObj.processMessages(JSONData);
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
	}; // initMessages
	
	this.processMessages = function(JSONData){
		var project = JSONData.project;
	}; // processMessages
	
	this.getMessage = function(){
		
	}; // getMessage
	
	this.processMessage = function(JSONData){
		
	}; // processMessage
	
	
} // Message