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

toastHubWatch.prototype = Object.create(toastHubBase.prototype); 
toastHubWatch.prototype.contructor = toastHubWatch;

toastHub.registerWidget("watch",new toastHubWatch("watch"));
toastHub.scriptRepo.requireOnce({jspath:"js/toasthub-acquaintance.js"});
toastHub.scriptRepo.requireOnce({jspath:"js/toasthub-chat.js"});

function toastHubWatch(instanceName){
	toastHubBase.call(this,instanceName,this);
	this.ajaxFunc = "member";
	this.service = "WATCH_SVC";
	this.pageMetaName = "SOCIAL_WATCH";
	this.history = new Array();
	this.watchGroups = null;
	this.currentWatchGroupIdx = 0;
	var self = this;
	
	///////////////////////////////// process Watch
	
	this.initContent = function(){
		toastHub.logSystem.log("DEBUG","ajax es-base:initContent");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		
		params.action = "INIT";
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.processInit(JSONData);
						};
		this.callService(params);

	}; // initContent
	
	this.processInit = function(JSONData){
		var mainDiv = document.createElement("DIV");
		mainDiv.id = "watchMainDiv";
		if (this.widgetContainer != null){
			this.widgetContainer.appendChild(mainDiv);
		}
		
		var acquaintance = document.createElement("DIV");
		acquaintance.id = "watch-acquaintance";
		toastHub.containerContentObj.appendChild(acquaintance);
		jQuery("#watch-acquaintance").dialog({ autoOpen: false, modal:true, minWidth:600, width:800 });
		
		var watchInput = document.createElement("INPUT");
		watchInput.id = "watchInput";
		watchInput.onkeypress = function(event){ var key = event.keyCode || event.which; if (key==13){self.save();} };
		mainDiv.appendChild(watchInput);
		var params = new Object();
		params.action = "INIT";
		this.checkWatchGroup(params);
		toastHub.getWidget("chat").checkChatMessages();
	}; // processMessages
	
	this.processList = function(JSONData) {
		// show default group list
		this.drawWatchGroups(JSONData.params);
		this.drawList(JSONData.params);
	}; //processList
	
	this.startChatCheck = function() {
		toastHub.getWidget("chat").checkChatMessages();
	}; // startChatCheck
	
	this.drawWatchGroups = function(params){
		this.watchGroups = params["watchGroups"];
		if (this.watchGroups != null && this.currentWatchGroupIdx != null){
			var gDiv = document.createElement("DIV");
			gDiv.id = "watchgroup-"+this.watchGroups[this.currentWatchGroupIdx].id;
			gDiv.className = "jd-watchlist-group";
			gDiv.innerHTML = this.watchGroups[this.currentWatchGroupIdx].description;
			this.widgetContainer.appendChild(gDiv);
			var addSpan = document.createElement("span");
			gDiv.appendChild(addSpan);
			addSpan.className = 'jd-btn';
			addSpan.onclick = function(){ toastHub.getController("acquaintance").openChooseAcquaintanceForm("watch-acquaintance",function(id,name){self.addAcquaintance(id, name);}); };
			var addIcon = document.createElement("span");
			addIcon.className = 'jd-icon-36 jd-icon-gear-36';
			addSpan.appendChild(addIcon);
		}
	}; // drawWatchGroups
	
	this.addAcquaintance = function(id,name){
		var watchGroupId = this.watchGroups[this.currentWatchGroupIdx].id;
		toastHub.logSystem.log("DEBUG","ajax es-watch:addAcquaintance id " + id + " to watchgroup " + this.watchGroups[this.currentWatchGroupIdx].id);
		var params = new Object();
		params.aquaintanceId = id;
		params.watchGroupId = watchGroupId;
		params.subAction = "SaveWatchGroupMember";
		params.action = "SAVE";
		params.callBack = function(JSONData){self.saveCallBack(JSONData);};
		this.callService(params);
		this.save(requestFacade);
	}; // addAcquaintance
	
	this.drawList = function(params){
		var acquaintances = params["members"];
		if (acquaintances != null) {
			for ( var i = 0; i < acquaintances.length; i++) {
				var acquaintance = acquaintances[i];
				var mDiv = document.createElement("DIV");
				this.widgetContainer.appendChild(mDiv);
				mDiv.id = "watchAcquaintance-"+acquaintance.id;
				if (acquaintance.chatStatus != null && acquaintance.chatStatus == "ONLINE"){
					mDiv.className = "jd-watchlist-online";
				} else {
					mDiv.className = "jd-watchlist-offline";
				}
				mDiv.innerHTML = acquaintance.firstname + " " + acquaintance.lastname;
				mDiv.onclick = (function(a){ return function(){ toastHub.getWidget("chat").openChatWindow({"Acquaintance":a});};  })(acquaintance);
			}
		}
	}; // drawList
	
	this.saveAdditional = function(requestFacade){
		var chatInput = document.getElementById("chatInput").value;
		requestFacade.params = {message:chatInput};
	};
	
	this.saveCallBack = function(JSONData) {
		toastHub.logSystem.log("DEBUG","ajax es-watch:saveCallBack ");
		if (params == null){
			params = new Object();
		}
		params.action = "LIST";
		params.callBack = function(JSONData){self.processList(JSONData);};
		this.callService(params);
	};
	
	this.setContainer = function(container){
		this.widgetContainer = container;
	};
	
	this.checkWatchGroup = function(params) {
		toastHub.logSystem.log("DEBUG","toastHubWatch::checkWatchGroup");
		if (params != null) {
			params.type = "INIT";
			params.action = "LIST";
			params.callBack = function(JSONData){self.processList(JSONData);};
			this.callService(params);
		} else {
			var params = new Object();
			params.type = "MEMBERS";
			params.watchGroupId = this.currentWatchGroupIdx;
			params.action = "LIST";
			params.callBack = function(JSONData){self.processList(JSONData);};
			this.callService(params);
		}
		setTimeout(function() {self.checkWatchGroup();},50000);
	};
	
	this.getMessage = function(){
		
	}; // getMessage
	
	this.processMessage = function(JSONData){
		
	}; // processMessage
	
	
} // Message