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

toastHubChat.prototype = Object.create(toastHubBase.prototype); 
toastHubChat.prototype.contructor = toastHubChat;

toastHub.registerWidget("chat",new toastHubChat("chat"));

function toastHubChat(instanceName){
	toastHubBase.call(this,instanceName,this);
	this.ajaxFunc = "member";
	this.service = "CHAT_SVC";
	this.pageMetaName = "SOCIAL_CHAT";
	this.history = new Array();
	this.openChats = {};
	var self = this;
	
	///////////////////////////////// process Chat
	
	this.processInit = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:processInit");
		var chatDiv = document.createElement("DIV");
		chatDiv.id = "chatDiv";
		if (this.widgetContainer != null){
			this.widgetContainer.appendChild(chatDiv);
		}
		var messageHistoryDiv = document.createElement("DIV");
		messageHistoryDiv.id = "messageHistory";
		chatDiv.appendChild(messageHistoryDiv);
		var chatInput = document.createElement("INPUT");
		chatInput.id = "chatInput";
		chatInput.onkeypress = function(event){ var key = event.keyCode || event.which; if (key==13){self.save();} };
		chatDiv.appendChild(chatInput);
		
		// run check chats for messages for any open chats
		this.checkChatMessages();
		
	}; // processMessages
	
	this.openChatWindow = function(params) {
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:openChatWindow");
		var from = null;
		if (params["Acquaintance"] != null){
			from = params["Acquaintance"];
		} else {
			from = params["message"].from;
		}
		
		this.openChats[from.id] = from; 
		toastHub.logSystem.log("DEBUG","toastHubChat::openChatWindow id " + from.id);
		var chatId = "chatDiv" + from.id;
		var chatDiv = document.createElement("DIV");
		chatDiv.id = chatId;
		toastHub.containerContentObj.appendChild(chatDiv);
		var name = from.firstname + " " + from.lastname;
		jQuery("#"+chatId).dialog({ autoOpen: false, modal:false, minWidth:240, width:240, title: name });
		
		var messageContainer = document.createElement("DIV");
		messageContainer.id = "messageContainer-" + from.id;
		messageContainer.className = "jd-chat-msgtxt";
		chatDiv.appendChild(messageContainer);
	
		var chatInput = document.createElement("INPUT");
		chatInput.id = "chatInput-" + from.id;
		chatInput.onkeypress = function(event){ 
				var key = event.keyCode || event.which; 
				if (key==13){self.sendChat(this);} 
				};
		chatDiv.appendChild(chatInput);
		
		
		var chatBoxObj = new ChatBox(); 
		chatBoxObj.id = from.id;
		//this.openChats = {aquaintanceId:chatBoxObj};
		this.showChatWindow({"chatId":chatId});
		if (params["message"] != null){
			this.updateChatWindow(params);
		}
	}; // openChatWindow
	
	this.showChatWindow = function(params) {
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:showChatWindow");
		jQuery("#"+params["chatId"]).dialog("open");
	};
	
	this.sendChat = function(chatInput) {
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:saveChat id " + chatInput.id);
		var res = chatInput.id.split("-");
		var now = new Date();
		// add to history
		/*var message = document.createElement("DIV");
		message.className = "jd-chat-msgtxt-me";
		message.innerHTML = chatInput.value + " " + now.toLocaleDateString() + " " + now.toLocaleTimeString();
		var messageHistory = document.getElementById("messageContainer-"+res[1]);
		messageHistory.appendChild(message);*/
		// save
		var params = new Object();
		params.AcquaintanceId = res[1];
		params.username = this.openChats[res[1]].username;
		params.message = chatInput.value;
		params.datetime = now.toLocaleDateString() + " " + now.toLocaleTimeString();
		params.action = "SAVE";
		params.callBack = function(JSONData){self.saveCallBack(JSONData);};
		this.callService(params);
		chatInput.value = "";
	};
	
	
	this.checkChatMessages = function(params) {
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:checkChatMessages");
		if (params == null){
			params = new Object();
		}
		params.action = "LIST";
		params.callBack = function(JSONData){self.processList(JSONData);};
		this.callService(params);
		setTimeout(function() {self.checkChatMessages();},10000);
	};
	
	this.processList = function(JSONData) {
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:processList");
		if (JSONData.params["messages"] != null){
			messages = JSONData.params["messages"];
			for ( var i = 0; i < messages.length; i++) {
				if (this.openChats[messages[i].from.id] != null){
					this.updateChatWindow({"message":messages[i]});
				} else {
					this.openChatWindow({"message":messages[i]});
				}
			}
		}
		
	};
	
	this.updateChatWindow = function(params) {
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:updateChatWindow");
		var history = document.getElementById("messageContainer-"+params["message"].from.id);
		var messageWrap = document.createElement("div");
		messageWrap.className = "jd-chat-msgtxt-r1";
		var messageFrom = document.createElement("div");
		messageFrom.innerHTML = "From: "+params["message"].from.firstname;
		messageFrom.className = "jd-chat-title-r1";
		messageWrap.appendChild(messageFrom);
		var message = document.createElement("div");
		message.innerHTML = params["message"].message;
		messageWrap.appendChild(message);
		var messageTime = document.createElement("div");
		messageTime.innerHTML = params["message"].timeSent;
		messageWrap.appendChild(messageTime);
		history.appendChild(messageWrap);
	};
	
	this.saveAdditional = function(requestFacade){
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:saveAdditional");
		var chatInput = document.getElementById("chatInput").value;
		requestFacade.params = {message:chatInput};
	};
	
	this.saveCallBack = function(JSONData) {
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:saveCallBack");
		var history = document.getElementById("messageContainer-"+JSONData.params["AcquaintanceId"]);
		var messageWrap = document.createElement("div");
		messageWrap.className = "jd-chat-msgtxt-me";
		var messageFrom = document.createElement("div");
		messageFrom.innerHTML = "From: "+JSONData.params["message"].from.firstname;
		messageWrap.appendChild(messageFrom);
		var message = document.createElement("div");
		message.innerHTML = JSONData.params["message"].message;
		messageWrap.appendChild(message);
		var messageTime = document.createElement("div");
		messageTime.innerHTML = JSONData.params["message"].timeSent;
		messageWrap.appendChild(messageTime);
		history.appendChild(messageWrap);
	};
	
	this.setContainer = function(container){
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:setContainer");
		this.widgetContainer = container;
	};
	
	this.getMessage = function(){
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:getMessage");
		
	}; // getMessage
	
	this.processMessage = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-chat:toastHubChat:processMessage");
		
	}; // processMessage
	
	
} // toastHubChat

function ChatBox() {
	this.id = null;
	this.messageHistory = new Array();
	
}