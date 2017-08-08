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

toastHubGroups.prototype = Object.create(toastHubBase.prototype);
toastHubGroups.prototype.constructor = toastHubGroups;

toastHub.registerController("groups",new toastHubGroups("groups"));
toastHub.scriptRepo.requireOnce({jspath:"../../js/toasthub-form.js"});

function toastHubGroups(instanceName){
	toastHubBase.call(this,instanceName,this);
	this.ajaxFunc = "member";
	this.service = "GROUP_SVC";
	this.pageMetaName = "SOCIAL_GROUP";
	this.chooseGroupContainer = null;
	this.chooseGroupCallBack = null;
	this.currentTab = null;
	this.groupId = null;
	this.access = null;
	this.receiverId = null;
	this.tabIndex = new Object();
	this.tabArray = new Array();
	var self = this;
	
	this.processInit = function(JSONData) {
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:processInit");
		this.pageFormFields = JSONData.params.sysPageFormFields;
		this.pageLabels = JSONData.params.sysPageLabels;
		this.pageTexts = JSONData.params.sysPageTexts;
		this.currentTab = "MYGROUPS";
		
		// tabs layout
		this.tabIndex.id = "tabs-1";
		this.tabIndex.name = "ONSHORE";
		var divTabs = document.createElement("DIV");
		divTabs.id = "tabs";
		toastHub.containerContentObj.appendChild(divTabs);
		var divTabsUL = document.createElement("UL");
		divTabs.appendChild(divTabsUL);
		var divTabsLI1 = document.createElement("LI");
		divTabsLI1.innerHTML = "<a href='#tabs-1'>"+this.pageTexts.SOCIAL_GROUP_MAIN_TAB_MYGROUPS.value+"</a>";
		divTabsUL.appendChild(divTabsLI1);
		var divTabsLI2 = document.createElement("LI");
		divTabsLI2.innerHTML = "<a href='#tabs-2'>"+this.pageTexts.SOCIAL_GROUP_MAIN_TAB_JOINED.value+"</a>";
		divTabsUL.appendChild(divTabsLI2);
		var divTabsLI3 = document.createElement("LI");
		divTabsLI3.innerHTML = "<a href='#tabs-3'>"+this.pageTexts.SOCIAL_GROUP_MAIN_TAB_AVAILGROUPS.value+"</a>";
		divTabsUL.appendChild(divTabsLI3);
		var divTabsLI4 = document.createElement("LI");
		divTabsLI4.innerHTML = "<a href='#tabs-4'>"+this.pageTexts.SOCIAL_GROUP_MAIN_TAB_INVITES.value+"</a>";
		divTabsUL.appendChild(divTabsLI4);
		var divTabsLI5 = document.createElement("LI");
		divTabsLI5.innerHTML = "<a href='#tabs-5'>"+this.pageTexts.SOCIAL_GROUP_MAIN_TAB_REQUESTS.value+"</a>";
		divTabsUL.appendChild(divTabsLI5);
		
		var divTab1 = document.createElement("DIV");
		divTab1.id = "tabs-1";
		divTabs.appendChild(divTab1);
		this.tabArray["tabs-1"] = "MYGROUPS";
		
		var divTab2 = document.createElement("DIV");
		divTab2.id = "tabs-2";
		divTabs.appendChild(divTab2);
		this.tabArray["tabs-2"] = "JOINED";
		
		var divTab3 = document.createElement("DIV");
		divTab3.id = "tabs-3";
		divTabs.appendChild(divTab3);
		this.tabArray["tabs-3"] = "AVAILGROUPS";
		
		var divTab4 = document.createElement("DIV");
		divTab4.id = "tabs-4";
		divTabs.appendChild(divTab4);
		//this.fillTab(divTab4,"DRAFT");
		this.tabArray["tabs-4"] = "INVITES";
		
		var divTab5 = document.createElement("DIV");
		divTab5.id = "tabs-5";
		divTabs.appendChild(divTab5);
		this.tabArray["tabs-5"] = "REQUESTS";
		
		toastHub.containerContentObj.appendChild(divTabs);
		var formArea = document.createElement("DIV");
		formArea.id = "form-area";
		toastHub.containerContentObj.appendChild(formArea);
		var acquaintance = document.createElement("DIV");
		acquaintance.id = "acquaintance";
		toastHub.containerContentObj.appendChild(acquaintance);
		var subMenuArea = document.createElement("DIV");
		subMenuArea.id = "sub-menu-area";
		toastHub.containerContentObj.appendChild(subMenuArea);
		jQuery("#form-area").dialog({ autoOpen: false, modal:true, minWidth:600, width:800 });
		jQuery("#acquaintance").dialog({ autoOpen: false, modal:true, minWidth:600, width:800 });
		jQuery("#sub-menu-area").dialog({ autoOpen: false, modal:true, minWidth:600, width:800 });
		
		this.tabSelect();
		this.processGroupsTab(JSONData);
	}; // processInitGroups
	
	this.tabSelect = function(){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:tabSelect");
		jQuery('#tabs').tabs({
			beforeActivate: function(event, ui) { 
				toastHub.logSystem.log("DEBUG","ajax groups:tabSelect:makeSelect");
				var id = ui.newPanel.attr('id');
				self.tabIndex.id = id;
				var myTab = id.split("-");
				switch(parseInt(myTab[1])){
				case 1:
					self.currentTab = "MYGROUPS";
					self.loadGroupsTab();
					break;
				case 2:
					self.currentTab = "JOINED";
					self.loadGroupsTab();
					break;
				case 3:
					self.currentTab = "AVAILGROUPS";
					self.loadGroupsTab();
					break;
				case 4:
					self.currentTab = "INVITES";
					self.loadGroupsTab();
					break;
				case 5:
					self.currentTab = "REQUESTS";
					self.loadGroupsTab();
					break;
				}
		    }
		 });
	}; // tabSelect
	
	this.loadGroupsTab = function(){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:loadGroupsTab");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "LIST";
		params.tab = this.currentTab;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.processGroupsTab(JSONData);
						};
		this.callService(params);
	}; // loadGroupsTab
	
	this.processGroupsTab = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:processGroupsTab ");
		if (JSONData.params["tab"] == "MYGROUPS"){
			var tab = document.getElementById("tabs-1");
			tab.innerHTML = null;
			toastHub.utils.boxRenderer({tab:tab,
				boxType:"column90",
				searchFieldId:"mygroup-searchString",
				searchFieldName:"mygroup-searchString",
				searchFieldOnBlur:function(){ if (this.value == "") { this.value = "Search...";} },
				searchFieldOnFocus:function(){ if (this.value == "Search...") { this.value = "";} },
				searchFieldValue:"Search...",
				searchButtonOnClick:function(){self.searchGroups();return false;},
				searchButtonValue:"Go",
				menuValue:"Add Group",
				menuOnClick:function(){self.editGroup();return false;},
				contentId:"mygroup-list"
					});
		} else if (JSONData.params["tab"] == "JOINED"){
			var tab = document.getElementById("tabs-2");
			tab.innerHTML = null;
			box = toastHub.utils.boxRenderer({tab:tab,
				boxType:"column90",
				searchFieldId:"joined-searchString",
				searchFieldName:"joined-searchString",
				searchFieldOnBlur:function(){ if (this.value == "") { this.value = "Search...";} },
				searchFieldOnFocus:function(){ if (this.value == "Search...") { this.value = "";} },
				searchFieldValue:"Search...",
				searchButtonOnClick:function(){self.searchGroups();return false;},
				searchButtonValue:"Go",
				menuValue:"Add Group",
				menuOnClick:function(){self.editGroup();return false;},
				contentId:"joined-list"
					});
		} else if (JSONData.params["tab"] == "AVAILGROUPS"){
			var tab = document.getElementById("tabs-3");
			tab.innerHTML = null;
			box = toastHub.utils.boxRenderer({tab:tab,
				boxType:"column90",
				searchFieldId:"availgroup-searchString",
				searchFieldName:"availgroup-searchString",
				searchFieldOnBlur:function(){ if (this.value == "") { this.value = "Search...";} },
				searchFieldOnFocus:function(){ if (this.value == "Search...") { this.value = "";} },
				searchFieldValue:"Search...",
				searchButtonOnClick:function(){self.searchGroups();return false;},
				searchButtonValue:"Go",
				menuValue:"Add Group",
				menuOnClick:function(){self.editGroup();return false;},
				contentId:"availgroup-list"
					});
		} else if (JSONData.params["tab"] == "INVITES"){
			var tab =document.getElementById("tabs-4");
			tab.innerHTML = null;
			box = toastHub.utils.boxRenderer({tab:tab,
				boxType:"column50",
				searchFieldId:"sentInvite-searchString",
				searchFieldName:"sentInvite-searchString",
				searchFieldOnBlur:function(){ if (this.value == "") { this.value = "Search...";} },
				searchFieldOnFocus:function(){ if (this.value == "Search...") { this.value = "";} },
				searchFieldValue:"Search...",
				searchButtonOnClick:function(){self.searchGroups();return false;},
				searchButtonValue:"Go",
				menuValue:"Add Group",
				menuOnClick:function(){self.editGroup();return false;},
				contentId:"sentinvite-list"
					});
			box = toastHub.utils.boxRenderer({tab:tab,
				boxType:"column50",
				searchFieldId:"receiveInvite-searchString",
				searchFieldName:"receiveInvite-searchString",
				searchFieldOnBlur:function(){ if (this.value == "") { this.value = "Search...";} },
				searchFieldOnFocus:function(){ if (this.value == "Search...") { this.value = "";} },
				searchFieldValue:"Search...",
				searchButtonOnClick:function(){self.searchGroups();return false;},
				searchButtonValue:"Go",
				menuValue:"Add Group",
				menuOnClick:function(){self.editGroup();return false;},
				contentId:"receiveinvite-list"
					});
		} else if (JSONData.params["tab"] == "REQUESTS"){
			var tab =document.getElementById("tabs-5");
			tab.innerHTML = null;
			box = toastHub.utils.boxRenderer({tab:tab,
				boxType:"column50",
				searchFieldId:"sentRequest-searchString",
				searchFieldName:"sentRequest-searchString",
				searchFieldOnBlur:function(){ if (this.value == "") { this.value = "Search...";} },
				searchFieldOnFocus:function(){ if (this.value == "Search...") { this.value = "";} },
				searchFieldValue:"Search...",
				searchButtonOnClick:function(){self.searchGroups();return false;},
				searchButtonValue:"Go",
				menuValue:"Add Group",
				menuOnClick:function(){self.editGroup();return false;},
				contentId:"sentrequest-list"
					});
			box = toastHub.utils.boxRenderer({tab:tab,
				boxType:"column50",
				searchFieldId:"receiveRequest-searchString",
				searchFieldName:"receiveRequest-searchString",
				searchFieldOnBlur:function(){ if (this.value == "") { this.value = "Search...";} },
				searchFieldOnFocus:function(){ if (this.value == "Search...") { this.value = "";} },
				searchFieldValue:"Search...",
				searchButtonOnClick:function(){self.searchGroups();return false;},
				searchButtonValue:"Go",
				menuValue:"Add Group",
				menuOnClick:function(){self.editGroup();return false;},
				contentId:"receiverequest-list"
					});
		} else {
			tab = document.getElementById("tabs-1");
			tab.innerHTML = "Error no data sent back";
		}
		if (JSONData.params["tab"] == "INVITES" || JSONData.params["tab"] == "REQUESTS"){
			this.processIRGroups(JSONData,"SENT");
			this.processIRGroups(JSONData,"RECEIVED");
		} else {
			this.processGroups(JSONData);
		}
	}; // processGroupsTab
	
	this.searchGroups = function(){
		toastHub.logSystem.log("DEBUG","es-group:toastHubGroups:searchGroups ");
		var params = toastHub.initParams();	
		var searchString = null;
		if (this.currentTab == "MYGROUPS"){
			searchString = document.getElementById("mygroup-searchString").value;
		} else if (this.currentTab == "JOINED"){
			searchString = document.getElementById("joined-searchString").value;
		} else if (this.currentTab == "AVAILGROUPS") {
			searchString = document.getElementById("availgroup-searchString").value;
		} else if (this.currentTab == "INVITE"){
			searchString = document.getElementById("sentInvite-searchString").value;
		} else if (this.currentTab == "REQUEST"){
			searchString = document.getElementById("sentRequest-searchString").value;
		} else {
			searchString = document.getElementById("mygroup-searchString").value;
		}
		if (searchString.length < 2){
			return;
		}
		params.search = searchString;
		params.action = "LIST";
		params.tab = this.currentTab;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.processGroups(JSONData);
						};
		this.callService(params);
	}; // searchGroups
	
	this.processGroups = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:processGroups ");
		var rows = JSONData.params.groups;
		var container = null;
		var tab = JSONData.params["tab"];
		if (tab == "MYGROUPS"){
			container = document.getElementById("mygroup-list");
		} else if (tab == "JOINED"){
			container = document.getElementById("joined-list");
		} else if (tab == "AVAILGROUPS") {
			container = document.getElementById("availgroup-list");
		} else {
		}
		
		if (rows != null && rows.length > 0){
			var ul = document.createElement("UL");
			ul.className = "jd-group";
			container.appendChild(ul);
			for ( var r = 0; r < rows.length; r++) {
				var row = rows[r];
				var access = "Public open to all";
				if (row.access != null && row.access == "PUBR"){
					access = "Public but request approval";
				} else if (row.access != null && row.access == "PRII"){
					access = "Private";
				}
				var li = document.createElement("LI");
				li.className = "jd-group-header";
				container.appendChild(li);
				var outerDiv = document.createElement("DIV");
				li.appendChild(outerDiv);
				var nameDiv = document.createElement("DIV");
				nameDiv.innerHTML = "Name: "+row.name;
				outerDiv.appendChild(nameDiv);
				var ownerDiv = document.createElement("DIV");
				ownerDiv.innerHTML = "Owner: "+row.owner.firstname+" "+row.owner.lastname;
				outerDiv.appendChild(ownerDiv);
				var accessDiv = document.createElement("DIV");
				accessDiv.innerHTML = "Access: "+access;
				outerDiv.appendChild(accessDiv);
				if (tab == "MYGROUPS"){
					if (row.access != null && row.access == "PRII"){
						var sendButton = document.createElement("BUTTON");
						sendButton.type = "button";
						sendButton.title = "sendInvite";
						sendButton.onclick = (function(id,access){ return function(){ self.openPrivateInviteGroupForm(id,access);}; })(row.id,row.access);
						sendButton.innerHTML = "Send Invite";
						outerDiv.appendChild(sendButton);
					}
					var deleteButton = document.createElement("BUTTON");
					deleteButton.type = "button";
					deleteButton.title = "deleteGroup";
					deleteButton.onclick = (function(id){ return function(){ self.deleteGroup(id);}; })(row.id);
					deleteButton.innerHTML = "Delete Group";
					outerDiv.appendChild(deleteButton);
					var createButton = document.createElement("BUTTON");
					createButton.type = "button";
					createButton.title = "createDiscussion";
					createButton.onclick = (function(id){ return function(){ self.editDiscussion(null,id);}; })(row.id);
					createButton.innerHTML = "Create Discussion";
					outerDiv.appendChild(createButton);
					var showButton = document.createElement("BUTTON");
					showButton.type = "button";
					showButton.title = "showDiscussion";
					showButton.onclick  = (function(id){ return function(){ self.loadDiscussions(id);}; })(row.id);
					showButton.innerHTML = "Show Discussion";
					outerDiv.appendChild(showButton);
					var discussionList = document.createElement("DIV");
					discussionList.id = "mygroup-discussions-"+row.id;
					li.appendChild(discussionList);
				} else if (tab == "JOINED"){
					var leaveButton = document.createElement("BUTTON");
					leaveButton.type = "button";
					leaveButton.title = "leaveGroup";
					leaveButton.onclick = (function(id){ return function(){ self.leaveGroup(id);}; })(row.id);
					leaveButton.innerHTML = "Leave Group";
					outerDiv.appendChild(leaveButton);
					var createButton = document.createElement("BUTTON");
					createButton.type = "button";
					createButton.title = "createDiscussion";
					createButton.onclick = (function(id){ return function(){ self.editDiscussion(null,id);}; })(row.id);
					createButton.innerHTML = "Create Discussion";
					outerDiv.appendChild(createButton);
					var showButton = document.createElement("BUTTON");
					showButton.type = "button";
					showButton.title = "showDiscussion";
					showButton.onclick  = (function(id){ return function(){ self.loadDiscussions(id);}; })(row.id);
					showButton.innerHTML = "Show Discussion";
					outerDiv.appendChild(showButton);
					var discussionList = document.createElement("DIV");
					discussionList.id = "joined-discussions-"+row.id;
					li.appendChild(discussionList);
				} else if (tab == "AVAILGROUPS"){
					var joinButton = document.createElement("BUTTON");
					joinButton.type = "button";
					joinButton.title = "joinGroup";
					joinButton.onclick = (function(id,access){ return function(){ self.openRequestJoinGroupForm(id,access);}; })(row.id,row.access);
					joinButton.innerHTML = "Join";
					outerDiv.appendChild(joinButton);
				} else {
					
				}
			}
		} else {
			var empty = document.createElement("P");
			empty.innerHTML = "No groups returned";
			container.appendChild(empty);
		}
	}; // processGroups
	
	this.processIRGroups = function(JSONData,type){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:processIRGroups ");
		var rows = null;
		var tab = JSONData.params["tab"];
		if (tab == "INVITES" && type == "SENT"){
			rows = JSONData.groupSentInvites;
		} else if (tab == "INVITES" && type == "RECEIVED"){
			rows = JSONData.groupReceiveInvites;
		} else if (tab == "REQUESTS" && type == "SENT"){
			rows = JSONData.groupSentRequests;
		} else if (tab == "REQUESTS" && type == "RECEIVED"){
			rows = JSONData.groupReceiveRequests;
		}
		var iHTML = "";
		if (rows != null && rows.length > 0){
			iHTML += "<ul class='jd-group'>";
			for ( var r = 0; r < rows.length; r++) {
				var row = rows[r];
				if (tab == "INVITES" && type == "SENT"){
					iHTML += "<li class='jd-group-header'><div><div>Group Name:"+row.groupName+"</div><div>To:"+row.receiver.firstname+" "+row.receiver.lastname+"</div>" +
						"<div>Status: "+row.status+"</div><div>Message: "+row.message+"</div>";
					if(row.status != null && row.status == "PEND"){
						iHTML += "<button type='button' title='CancelInvite' onclick='toastHub.getController(\"groups\").cancelJoin("+row.id+",\"PRII\");return false;'>Cancel Invite</button>";
					} else {
						iHTML += "<button type='button' title='deleteInvite' onclick='toastHub.getController(\"groups\").deleteJoin("+row.id+",\"PRII\");return false;'>Delete Invite</button>";
					}
					iHTML += "</div></li>";
				} else if (tab == "INVITES" && type == "RECEIVED"){
					iHTML += "<li class='jd-group-header'><div><div>Group Name:"+row.groupName+"</div><div>From:"+row.receiver.firstname+" "+row.receiver.lastname+"</div>" +
						"<div>Status: "+row.status+"</div><div>Message: "+row.message+"</div>";
					if(row.status != null && row.status == "PEND"){
						iHTML += "<button type='button' title='AcceptInvite' onclick='toastHub.getController(\"groups\").acceptJoin("+row.id+",\"PRII\");return false;'>Accept Invite</button>";
						iHTML += "<button type='button' title='RejectInvite' onclick='toastHub.getController(\"groups\").rejectJoin("+row.id+",\"PRII\");return false;'>Reject Invite</button>";
					}
					iHTML += "</div></li>";
				} else if (tab == "REQUESTS"){
					iHTML += "<li class='jd-group-header'><div><div>Group Name:"+row.groupName+"</div><div>Sender:"+row.sender.firstname+" "+row.sender.lastname+"</div>" +
						"<div>Status: "+row.status+"</div><div>Message: "+row.message+"</div>";
					if (row.status != null && row.status == "PEND" && type == "SENT"){
						iHTML += "<button type='button' title='CancelJoin' onclick='toastHub.getController(\"groups\").cancelJoin("+row.id+",\"PUBR\");return false;'>Cancel</button>";
					} else if (row.status != null && row.status == "PEND" && type == "RECEIVED"){
							iHTML += "<button type='button' title='AcceptJoin' onclick='toastHub.getController(\"groups\").acceptJoin("+row.id+",\"PUBR\");return false;'>Accept</button>" +
							"<button type='button' title='RejectJoin' onclick='toastHub.getController(\"groups\").rejectJoin("+row.id+",\"PUBR\");return false;'>Reject</button>";
					} else {
						iHTML += "<button type='button' title='DeleteRequest' onclick='toastHub.getController(\"groups\").deleteJoin("+row.id+",\"PUBR\");return false;'>Delete Request</button>";
					}
					iHTML += "</div></li>";
				} else {
					
				}
			}
			iHTML += "</ul>";
		} else {
			iHTML += "<p>No Invites returned</p>";
		}
		if (tab == "INVITES" && type == "SENT"){
			document.getElementById("sentinvite-list").innerHTML = iHTML;
		} else if (tab == "INVITES" && type == "RECEIVED"){
			document.getElementById("receiveinvite-list").innerHTML = iHTML;
		} else if (tab == "REQUESTS" && type == "SENT") {
			document.getElementById("sentrequest-list").innerHTML = iHTML;
		} else if (tab == "REQUESTS" && type == "RECEIVED"){
			document.getElementById("receiverequest-list").innerHTML = iHTML;
		}
	}; // processIRGroups
	
	this.editGroup = function(groupId){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:editGroup ");
		if (groupId == null){
			this.openGroupForm();
		} else {
			jQuery("#statusAjax").toggle();
			var params = toastHub.initParams();	
			params.action = "SHOW";
			params.id = groupId;
			params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
								self.openGroupForm(JSONData);
							};
			this.callService(params);
		}
	}; // editGroup
	
	this.openGroupForm = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:openGroupForm ");
		var iHTML = "";
		if (JSONData != null && JSONData.group != null){
			this.group = JSONData.group;
			iHTML += "<div>Modify Group:  </div>";
		} else {
			iHTML += "<div>Create new Group:  </div>";
			this.group = null;
		}

		iHTML += "<div id='wrap-groupName'>Name: <input type='text' id='groupName' name='groupName' size='25'";
		if (this.group != null && this.group.name != null){
			iHTML += " value='"+this.group.name+"' ";
		}
		iHTML += "/></div>";
		iHTML += "<div id='wrap-groupDescription'>Description: <textarea id='groupDescription' name='groupDescription' rows='20' cols='50' maxlength='2000'>";
		if (this.group != null && this.group.description != null){
			iHTML += this.group.description;
		}
		iHTML += "</textarea></div>";
		var accessPUBO = "";
		var accessPUBR = "";
		var accessPRII = "";
		if (this.group != null){ 
			if (this.group.access == "PUBR"){
				accessPUBR = "checked";
			} else if (this.group.access == "PRII") {
				accessPRII = "checked";
			} else {
				accessPUBO = "checked";
			} 
		}
		iHTML += "<div>Access:<br/><input type='radio' name='accessGroup' value='PUBO' "+accessPUBO+"/> Public open to all <br/>" +
				"<input type='radio' name='accessGroup' value='PUBR' "+accessPUBR+"/> Public with Request Access Required <br/>" +
				"<input type='radio' name='accessGroup' value='PRII' "+accessPRII+"/> Private Invite only </div>";
		
		iHTML += "<div><input type='button' value='Save' onclick='toastHub.getController(\"groups\").validateGroup();return false;'/></div>";
		iHTML += "<div><input type='button' value='Close' onclick='jQuery(\"#form-area\").dialog(\"close\");return false;'/></div>";
    	document.getElementById('form-area').innerHTML = iHTML;
		jQuery("#form-area").dialog("open");
		//jQuery("#wrap-groupDescription").cleditor();
	}; // createGroupForm
	
	this.deleteGroup = function(groupId){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:deleteGroup ");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "DELETE";
		params.id = groupId;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.loadGroupsTab(JSONData);
						};
		this.callService(params);
	}; // deleteGroup
	
	this.openRequestJoinGroupForm = function(groupId,access){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:openRequestJoinGroupForm ");
		this.groupId = groupId;
		this.access = access;
		var iHTML = "<div>Join Group Request: </div>";
		iHTML += "<div id='wrap-groupWhyRequest'>Why do you want to join this group: <textarea id='groupWhyRequest' name='groupWhyRequest' rows='20' cols='50' maxlength='2000'></textarea></div>";
		iHTML += "<div><input type='button' value='Save' onclick='toastHub.getController(\"groups\").validateRequestJoinGroup();return false;'/></div>";
		iHTML += "<div><input type='button' value='Close' onclick='jQuery(\"#form-area\").dialog(\"close\");return false;'/></div>";
    	document.getElementById('form-area').innerHTML = iHTML;
		jQuery("#form-area").dialog("open");
		jQuery("#groupWhyRequest").cleditor();
	}; // openRequestJoinGroupForm
	
	this.validateRequestJoinGroup = function(){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:validateRequestJoinGroup ");
		var isValid = true;
		var groupWhyRequest = document.getElementById('groupWhyRequest');
		if (groupWhyRequest != null && groupWhyRequest.value == ""){
			isValid = false;
			toastHub.utils.createErrorMessage('groupWhyRequest','Missing value');
		} else {
			toastHub.utils.removeErrorMessage('groupWhyRequest');
		}
		if (isValid){
			this.joinSaveGroup();
		}
	}; // validateRequestGroup
	
	this.joinSaveGroup = function(){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:joinSaveGroup ");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "JOIN";
		params.groupId = this.groupId;
		params.access = this.access;
		if (this.access == "PUBR"){
			params.groupPublicRequest = new Object;
			params.groupPublicRequest.message = document.getElementById('groupWhyRequest').value;
		} else if (this.access == "PRII"){
			params.receiverId = this.receiverId;
			params.groupPrivateInvite = new Object;
			params.groupPrivateInvite.message = document.getElementById('inviteMessage').value;
		}
		params.callBack = function(JSONData){
							toastHub.utils.clearErrorMessages();
							toastHub.utils.applicationSuccessMessage(JSONData);
							self.updateGroupList(JSONData);
						};
		this.callService(params);
	}; // joinGroup
	
	this.leaveGroup = function(groupId){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:leaveGroup ");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "LEAVE";
		params.groupId = groupId;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.updateGroupList(JSONData);
						};
		this.callService(params);
	}; // leaveGroup
	
	this.cancelJoin = function(groupJoinId,access){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:cancelJoin ");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "JOIN_CANCEL";
		params.groupJoinId = groupJoinId;
		params.access = access;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.updateGroupList(JSONData);
						};
		this.callService(params);
	}; // cancelJoin
	
	this.acceptJoin = function(groupJoinId,access){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:acceptJoin ");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "JOIN_ACCEPT";
		params.groupJoinId = groupJoinId;
		params.access = access;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.updateGroupList(JSONData);
						};
		this.callService(params);
	}; // acceptJoin
	
	this.rejectJoin = function(groupJoinId,access){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:rejectJoin ");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "JOIN_REJECT";
		params.groupJoinId = groupJoinId;
		params.access = access;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.updateGroupList(JSONData);
						};
		this.callService(params);
	}; // rejectJoin
	
	this.deleteJoin = function(groupJoinId,access){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:deleteJoin ");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "JOIN_DELETE";
		params.groupJoinId = groupJoinId;
		params.access = access;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.updateGroupList(JSONData);
						};
		this.callService(params);
	}; // deleteJoin
	
	this.validateGroup = function(){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:validateGroup ");
		var isValid = true;
		var groupName = document.getElementById('groupName');
		if (groupName != null && groupName.value == ""){
			isValid = false;
			toastHub.utils.createErrorMessage('groupName','Missing value');
		} else {
			toastHub.utils.removeErrorMessage('groupName');
		}
		var groupDescription = document.getElementById('groupDescription');
		if (groupDescription != null && groupDescription.value == ""){
			isValid = false;
			toastHub.utils.createErrorMessage('groupDescription','Missing value');
		} else {
			toastHub.utils.removeErrorMessage('groupDescription');
		}
		if (isValid){
			this.saveGroup();
		}
	}; //validateGroup
	
	this.saveGroup = function(){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:saveGroup ");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "JOIN_DELETE";
		if (this.group != null){
			params.group = this.group;
		} else {
			params.group = new Object();
		}
    	params.group.name = document.getElementById('groupName').value;
    	params.group.description = document.getElementById('groupDescription').value;
    	var accessValue = "PUBO";
		var accessObj = document.getElementsByName('accessGroup');
		for (var i = 0; i < accessObj.length; i++){
			if (accessObj[i].checked){
				accessValue = accessObj[i].value;
				break;
			}
		}
		params.group.access = accessValue;
		params.callBack = function(JSONData){
							toastHub.utils.clearErrorMessages();
							toastHub.utils.applicationSuccessMessage(JSONData);
							self.updateGroupList(JSONData);
						};
		this.callService(params);
	}; //saveGroup 
	
	this.updateGroupList = function(){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:updateGroupList ");
		this.loadGroupsTab();
		jQuery("#form-area").dialog("close");
	}; //updateGroupList
	
	this.openPrivateInviteGroupForm = function(groupId,access){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:openPrivateInviteGroupForm ");
		this.groupId = groupId;
		this.access = access;
		var iHTML = "<div>Private Invite: </div>";
		iHTML += "<div id='wrap-receiver'>To: <input type='text' readonly='readonly' name='inviteReceiver' id='inviteReceiver' onclick='toastHub.getController(\"acquaintance\").openChooseAcquaintanceForm(\"acquaintance\",\"toastHub.getController(\"groups\").addAcquaintance\")'";
		iHTML += "/></div>";
		iHTML += "<div id='wrap-inviteMessage'>Message: <textarea id='inviteMessage' name='inviteMessage' rows='20' cols='50' maxlength='2000'></textarea></div>";
		iHTML += "<div><input type='button' value='Save' onclick='toastHub.getController(\"groups\").validatePrivateInviteGroup();return false;'/></div>";
		iHTML += "<div><input type='button' value='Close' onclick='jQuery(\"#form-area\").dialog(\"close\");return false;'/></div>";
    	document.getElementById('form-area').innerHTML = iHTML;
		jQuery("#form-area").dialog("open");
		jQuery("#groupWhyRequest").cleditor();
	}; // openRequestJoinGroupForm
	
	this.addAcquaintance = function(id,name){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:addAcquaintance ");
		this.receiverId = id;
		console.log("got id "+ id);
		document.getElementById('inviteReceiver').value = name;
	}; // addAcquaintance
	
	this.validatePrivateInviteGroup = function(){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:validatePrivateInviteGroup ");
		var isValid = true;
		var message = document.getElementById('inviteMessage');
		if (message != null && message.value == ""){
			isValid = false;
			toastHub.utils.createErrorMessage('inviteMessage','Missing value');
		} else {
			toastHub.utils.removeErrorMessage('inviteMessage');
		}
		if (this.receiverId == null){
			isValid = false;
			toastHub.utils.createErrorMessage('inviteReceiver','Missing value');
		} else {
			toastHub.utils.removeErrorMessage('inviteReceiver');
		}
		if (isValid){
			this.joinSaveGroup();
		}
	}; //validateGroup
	
/////////////////////////////////////////////////////////////// Discussions
	
	this.editDiscussion = function(discussionId,groupId){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:editDiscussion ");
		this.groupId = groupId;
		if (discussionId == null){
			this.openDiscussionForm();
		} else {
			jQuery("#statusAjax").toggle();
			var params = toastHub.initParams();	
			params.action = "DISCUSSION_SHOW";
			params.discussionId = discussionId;
			params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
								self.openDiscussionFrom(JSONData);
							};
			this.callService(params);
		}
		
	}; // editDiscussion
	
	this.openDiscussionForm = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-groups:toastHubGroups:openDiscussionForm ");
		var iHTML = "";
		if (JSONData != null && JSONData.discussion != null){
			this.discussion = JSONData.discussion;
			iHTML += "<div>Modify Discussion:  </div>";
		} else {
			iHTML += "<div>Create new Discussion:  </div>";
			this.discussion = null;
		}

		iHTML += "<div id='wrap-discussionSubject'>Subject: <input type='text' id='discussionSubject' name='discussionSubject' size='25'";
		if (this.discussion != null && this.discussion.subject != null){
			iHTML += " value='"+this.discussion.subject+"' ";
		}
		iHTML += "/></div>";
		iHTML += "<div id='wrap-discussionMessage'>Discription: <textarea id='discussionMessage' name='discussionMessage' rows='20' cols='50' maxlength='2000'>";
		if (this.discussion != null && this.discussion.messageShort != null){
			iHTML += this.discussion.messageShort;
			if (this.discussion.message != null){
				iHTML += this.discussion.message;
			}
		}
		iHTML += "</textarea></div>";
		
		iHTML += "<div><input type='button' value='Save' onclick='toastHub.getController(\"groups\").validateDiscussion();return false;'/></div>";
		iHTML += "<div><input type='button' value='Close' onclick='jQuery(\"#form-area\").dialog(\"close\");return false;'/></div>";
    	document.getElementById('form-area').innerHTML = iHTML;
		jQuery("#form-area").dialog("open");
		//jQuery("#discussionMessage").cleditor();
	}; // openDiscussionForm
	
	this.validateDiscussion = function(){
		var isValid = true;
		var discussionSubject = document.getElementById('discussionSubject');
		if (discussionSubject != null && discussionSubject.value == ""){
			isValid = false;
			toastHub.utils.createErrorMessage('discussionSubject','Missing value');
		} else {
			toastHub.utils.removeErrorMessage('discussionSubject');
		}
		var discussionMessage = document.getElementById('discussionMessage');
		if (discussionMessage != null && discussionMessage.value == ""){
			isValid = false;
			toastHub.utils.createErrorMessage('discussionMessage','Missing value');
		} else {
			toastHub.utils.removeErrorMessage('discussionMessage');
		}
		if (isValid){
			this.saveDiscussion();
		}
	}; // validateDiscussion
	
	this.saveDiscussion = function(){
		toastHub.logSystem.log("DEBUG","ajax groups:saveDiscussion");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "DISCUSSION_SAVE";
		params.groupId = this.groupId;
		if (this.discussion != null){
			params.discussion = this.discussion;
		} else {
			params.discussion = new Object();
		}
    	params.discussion.subject = document.getElementById('discussionSubject').value;
    	params.discussion.message = document.getElementById('discussionMessage').value;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							toastHub.utils.applicationSuccessMessage(JSONData);
							self.updateDiscussionList();
						};
		this.callService(params);
	}; // saveDiscussion
	
	this.updateDiscussionList = function(){
		this.loadDiscussions(this.groupId);
		jQuery("#form-area").dialog("close");
	}; //updateDiscussionList
	
	this.loadDiscussions = function(groupId){
		toastHub.logSystem.log("DEBUG","ajax groups:loadDiscussion");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "DISCUSSION_LIST";
		params.groupId = groupId;
		params.tab = this.currentTab;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.processDiscussions(JSONData);
						};
		this.callService(params);
	}; // loadDiscussions
	
	this.processDiscussions = function(JSONData){
		var rows = JSONData.discussions;
		var container = null;
		if (JSONData.type == "MYGROUPS"){
			container = document.getElementById("mygroup-discussions-"+JSONData.groupId);
		} else if (JSONData.type == "JOINED"){
			container = document.getElementById("joined-discussions-"+JSONData.groupId);
		} else {
			container = document.getElementById("availgroup-discussions-"+JSONData.groupId);
		}
		container.innerHTML = "";
		if (rows != null && rows.length > 0){
			var ul = document.createElement("UL");
			ul.className = "jd-group";
			container.appendChild(ul);
			for ( var r = 0; r < rows.length; r++) {
				var row = rows[r];
				var li = document.createElement("LI");
				li.className = "jd-group-sub";
				li.id = "discussion-"+row.id;
				ul.appendChild(li);
				var outerDiv = document.createElement("DIV");
				li.appendChild(outerDiv);
				var subjectDiv = document.createElement("DIV");
				subjectDiv.innerHTML = "Subject:"+row.subject;
				outerDiv.appendChild(subjectDiv);
				var messageDiv = document.createElement("DIV");
				messageDiv.id = "discussion-msg-"+row.id;
				var myMessageShort = "";
				if (row.messageShort != null){
					myMessageShort = row.messageShort;
				}
				var message = document.createTextNode("Message: "+myMessageShort);
				messageDiv.appendChild(message);
				var viewMore = document.createElement("A");
				viewMore.href = "#";
				viewMore.onclick = (function(id){ return function(){self.loadDiscussionMessage(id); return false;};})(row.id);
				viewMore.innerHTML = "View more...";
				messageDiv.appendChild(viewMore);
				outerDiv.appendChild(messageDiv);
				
				var ownerDiv = document.createElement("DIV");
				ownerDiv.innerHTML = "Owner:"+row.owner.firstname+" "+row.owner.lastname;
				outerDiv.appendChild(ownerDiv);
				var deleteDiscussion = document.createElement("BUTTON");
				deleteDiscussion.type = "button";
				deleteDiscussion.title = "deleteDiscussion";
				deleteDiscussion.onclick = (function(id){ return function(){self.deleteDiscussion(id);return false; }; })(row.id);
				deleteDiscussion.innerHTML = "Delete Discussion";
				outerDiv.appendChild(deleteDiscussion);
				var createComment = document.createElement("BUTTON");
				createComment.type = "button";
				createComment.title = "createComment";
				createComment.onclick = (function(id){ return function(){self.openCommentForm(id);return false; }; })(row.id);
				createComment.innerHTML = "Create Comment";
				outerDiv.appendChild(createComment);
				var loadComments = document.createElement("BUTTON");
				loadComments.type = "button";
				loadComments.title = "loadComments";
				loadComments.onclick = (function(id){ return function(){self.loadComments(id);return false; }; })(row.id);
				loadComments.innerHTML = "Show Comments";
				outerDiv.appendChild(loadComments);
				var comment = document.createElement("DIV");
				comment.id = "comments-"+row.id;
				outerDiv.appendChild(comment);
			}
			
		} else {
			var noValues = document.createTextNode("No discussions returned");
			container.appendChild(noValues);
		}
	}; //processDiscussions
	
	this.deleteDiscussion = function(discussionId){
		toastHub.logSystem.log("DEBUG","ajax groups:deleteDiscussion");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "DISCUSSION_DELETE";
		params.discussionId = discussionId;
		params.tab = this.currentTab;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
								jQuery('#discussion-'+JSONData.discussionId).remove();
						};
		this.callService(params);
	}; // deleteDiscussion
	
	this.loadDiscussionMessage = function(discussionId){
		toastHub.logSystem.log("DEBUG","ajax groups:loadDiscussionMessage");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "DISCUSSION_MESSAGE";
		params.discussionId = discussionId;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
								self.processDiscussionMessage(JSONData);
						};
		this.callService(params);
	}; // loadDiscussionMessage
	
	this.processDiscussionMessage = function(JSONData){
		var discussionObj = document.getElementById('discussion-msg-'+JSONData.discussion.id);
		discussionObj.innerHTML = "Message: "+JSONData.discussion.messageShort+JSONData.discussion.message;
	}; // processDiscussionMessage
////////////////////////////////////////////////////////////// Discussion Comments ////////////////////////////////////////
	
	this.editComment = function(commentId,discussionId){
		this.discussionId = discussionId;
		if (commentId == null){
			this.openCommentForm();
		} else {
			toastHub.logSystem.log("DEBUG","ajax groups:editComment");
			jQuery("#statusAjax").toggle();
			var params = toastHub.initParams();	
			params.action = "DISCUSSION_COMMENT_SHOW";
			params.commentId = commentId;
			params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
									self.openCommentForm(JSONData);
							};
			this.callService(params);
		}
		
	}; // editComment
	
	this.openCommentForm = function(JSONData){
		toastHub.logSystem.log("DEBUG","ajax groups:openCommentForm");
		var form = toastHub.getWidget("form");
		form.renderForm(JSONData);
		
		var container = document.getElementById('form-area');
		container.innerHTML = "";
		var headerDiv = document.createElement("DIV");
		if (JSONData != null && JSONData.dicussionComment != null){
			this.comment = JSONData.discussionComment;
			headerDiv.innerHTML = "Modify Comment:  ";
			container.appendChild(headerDiv);
		} else {
			headerDiv.innerHTML = "Create new Comment:  ";
			container.appendChild(headerDiv);
			this.comment = null;
		}
		var contentWrapDiv = document.createElement("DIV");
		contentWrapDiv.id = "wrap-commentMessage";
		contentWrapDiv.appendChild(document.createTextNode("Comment: "));
		container.appendChild(contentWrapDiv);
		var commentMessage = document.createElement("textarea");
		commentMessage.id = "commentMessage"
		commentMessage.name = "commentMessage";
		commentMessage.rows = "20";
		commentMessage.cols = "50";
		commentMessage.maxlength = "2000";
		contentWrapDiv.appendChild(commentMessage);
		if (this.comment != null && this.comment.messageShort != null){
			commentMessage.value = this.comment.messageShort;
			if (this.comment.message != null){
				commentMessage.value = this.comment.messageShort + "" + this.comment.message;
			}
		}
		this.renderButton({container:container,value:"Save",onclick:function(){self.validateComment();return false;}});
		this.renderButton({container:container,value:"Close",onclick:function(){jQuery("#form-area").dialog("close");return false;}})
		jQuery("#form-area").dialog("open");
	}; // openCommentForm
	
	this.renderButton = function(params){
		var wrapper = document.createElement("DIV");
		var input = document.createElement("INPUT");
		input.type = "button";
		input.value = params.value;
		input.onclick = params.onclick;
		wrapper.appendChild(input);
		params.container.appendChild(wrapper);
	};
	
	this.validateComment = function(){
		var isValid = true;
		var commentMessage = document.getElementById('commentMessage');
		if (commentMessage != null && commentMessage.value == ""){
			isValid = false;
			toastHub.utils.createErrorMessage('commentMessage','Missing value');
		} else {
			toastHub.utils.removeErrorMessage('commentMessage');
		}
		if (isValid){
			this.saveComment();
		}
	}; // validateComment
	
	this.saveComment = function(){
		toastHub.logSystem.log("DEBUG","ajax groups:saveComment");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "DISCUSSION_COMMENT_SAVE";
		params.discussionId = this.discussionId;
		if (this.comment != null){
			params.discussionComment = this.comment;
		} else {
			params.discussionComment = new Object();
		}
    	params.discussionComment.message = document.getElementById('commentMessage').value;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
								toastHub.utils.applicationSuccessMessage(JSONData);
								self.updateCommentList();
						};
		this.callService(params);
	}; // saveDiscussion
	
	this.updateCommentList = function(){
		this.loadComments(this.discussionId);
		jQuery("#form-area").dialog("close");
	}; //updateCommentList
	
	this.loadComments = function(discussionId){
		toastHub.logSystem.log("DEBUG","ajax groups:loadComments");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "DISCUSSION_COMMENT_LIST";
		params.discussioinId = discussionId;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.processComments(JSONData);
						};
		this.callService(params);
	}; // loadComments
	
	this.processComments = function(JSONData){
		var rows = JSONData.discussionComments;
		var iHTML = "";
		if (rows != null && rows.length > 0){
			iHTML += "<ul class='jd-group'>";
			for ( var r = 0; r < rows.length; r++) {
				var row = rows[r];
					iHTML += "<li class='jd-group-sub' id='comment-"+row.id+"'><div><div id='comment-msg-"+row.id+"'>Comment:"+row.messageShort+"<a href='#' onclick='toastHub.getController(\"groups\").loadCommentMessage("+row.id+");return false;'> View More...</a></div><div>Owner:"+row.owner.firstname+" "+row.owner.lastname+"</div><button type='button' title='deleteComment' onclick='toastHub.getController(\"groups\").deleteComment("+row.id+");return false;'>Delete Comment</button></li>";
			}
			iHTML += "</ul>";
		} else {
			iHTML += "<p>No comments returned</p>";
		}
		document.getElementById("comments-"+JSONData.discussionId).innerHTML = iHTML;
	}; //processComments
	
	this.deleteComment = function(commentId){
		toastHub.logSystem.log("DEBUG","ajax groups:deleteComment");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "DISCUSSION_COMMENT_DELETE";
		params.commentId = commentId;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							jQuery('#comment-'+JSONData.commentId).remove();
						};
		this.callService(params);
	}; // deleteComment

	this.loadCommentMessage = function(commentId){
		toastHub.logSystem.log("DEBUG","ajax groups:loadCommentMessage");
		jQuery("#statusAjax").toggle();
		var params = toastHub.initParams();	
		params.action = "DISCUSSION_COMMENT_MESSAGE";
		params.commentId = commentId;
		params.callBack = function(JSONData){toastHub.utils.clearErrorMessages();
							self.processCommentMessage(JSONData);
						};
		this.callService(params);
	}; // loadCommentMessage
	
	this.processCommentMessage = function(JSONData){
		var commentObj = document.getElementById('comment-msg-'+JSONData.discussionComment.id);	
		commentObj.innerHTML = "Comment: "+JSONData.discussionComment.messageShort+JSONData.discussionComment.message;
	}; // processCommentMessage
	
} // Groups