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

toastHubIndex.prototype = Object.create(toastHubIndex.prototype);
toastHubIndex.prototype.constructor = toastHubIndex;

toastHub.registerController("index",new toastHubIndex("index"));
toastHub.scriptRepo.requireOnce({jspath:"js/toasthub-watch.js"});

function toastHubIndex(instanceName){
	toastHubBase.call(this,instanceName,this);
	this.ajaxFunc = "member";
	this.service = "DASHBOARD_SVC";
	this.pageMetaName = "SOCIAL_DASHBOARD";
	this.headerArea = null;
	this.dashBoardArea = null;
	this.activityArea = null;
	this.assignedTaskArea = null;
	this.investmentArea = null;
	this.projectArea = null;
	this.messageArea = null;
	this.groupArea = null;
	this.eternalArea = null;
	this.bottleArea = null;
	this.currentFocus = null;
	var self = this;
	
	/////////////////////////////////// init ///////////////////////
	this.initContent = function(container){
		toastHub.logSystem.log("DEBUG","index:initContent");
		
		var centerCol = document.createElement('div');
		centerCol.className = "jd-center-col";
		centerCol.innerHTML = "TEST ";
		centerCol.id = "centerCol";
		toastHub.containerContentObj.appendChild(centerCol);
		var rightCol = document.createElement('div');
		rightCol.className = "jd-right-col";
		toastHub.containerContentObj.appendChild(rightCol);
		
		var watchList = document.createElement('div');
		watchList.className = "jd-right-col-widget";
		rightCol.appendChild(watchList);
		var watchObj = toastHub.getWidget("watch");
		watchObj.setContainer(watchList);
		watchObj.initContent();
		
	};
	
	this.processInit = function(JSONData){
		var pageText = JSONData.pageText;
		if (JSONData.portals.length == 0){
			// no portals - must create one
			var iHTML = "You have no Portals. Click Ok to select from available list";
			iHTML += "<button title='Okay' value='Okay' onclick='esDashBoardObj.openAvailablePortalList();jQuery(\"#wizard-message\").dialog(\"close\");return false;'>Ok</button>";
	    	document.getElementById('wizard-message').innerHTML = iHTML;
	    	jQuery("#wizard-message").dialog("open");
		} else {
			this.headerArea = document.createElement('div');
			this.headerArea.setAttribute("id","dashboard-header-area");
			this.headerArea.setAttribute("class","ui-box90");
			this.headerArea.innerHTML = "DashBoard header <img id='menuLanes' align='right' title='Options Menu' alt='Options Menu' src='"+toastHub.utils.imageDir+"note_add.png' onclick='esDashBoardObj.getDashBoardMenu();return false;'/>";
			toastHub.containerContentObj.appendChild(this.headerArea);
			this.dashBoardArea = document.createElement('div');
			this.dashBoardArea.setAttribute("id","dashboard-body-area");
			toastHub.containerContentObj.appendChild(this.dashBoardArea);
			this.loadPortals(JSONData);
		}
	}; // processInit
	
	this.reloadAllPortals = function(){
		var callUrl = toastHub.utils.restUrl + "social/dashboard/list";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		requestFacade.timestamp = new Date().getTime();
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status != null && JSONData.status == false){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					esDashBoardObj.loadPortals(JSONData);
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
	}; // reloadAllPortals
	
	this.processReloadAllPortals = function(JSONData){
		var pageText = JSONData.pageText;
		if (JSONData.portals.length == 0){
			// no portals - must create one
			var iHTML = "You have no Portals. Click Ok to select from available list";
			iHTML += "<button title='Okay' value='Okay' onclick='esDashBoardObj.openAvailablePortalList();jQuery(\"#wizard-message\").dialog(\"close\");return false;'>Ok</button>";
	    	document.getElementById('wizard-message').innerHTML = iHTML;
	    	jQuery("#wizard-message").dialog("open");
		} else {
			this.dashBoardArea.innerHTML = "";
			this.loadPortals(JSONData);
		}
	}; // processReloadAllPortals
	
	this.loadPortals = function(JSONData){
		var portals = JSONData.portals;
		for (var p = 0; portals.length > p; p++){
			switch(portals[p].name){
			case "ACTIVITIES":
				this.activityArea = document.createElement('div');
				this.activityArea.setAttribute("id","activity-area");
				this.activityArea.setAttribute("class","ui-boxColumn50");
				this.dashBoardArea.appendChild(this.activityArea);
				this.getActivities();
				break;
			case "GROUPS":
				this.groupArea = document.createElement('div');
				this.groupArea.setAttribute("id","group-area");
				this.groupArea.setAttribute("class","ui-boxColumn50");
				this.dashBoardArea.appendChild(this.groupArea);
				this.getGroups();
				break;
			case "ASSIGNEDTASKS":
				this.assignedTaskArea = document.createElement('div');
				this.assignedTaskArea.setAttribute("id","assignedTask-area");
				this.assignedTaskArea.setAttribute("class","ui-boxColumn50");
				this.dashBoardArea.appendChild(this.assignedTaskArea);
				//this.getAssignedTasks();
				break;
			case "PROJECTS":
				this.projectArea = document.createElement('div');
				this.projectArea.setAttribute("id","project-area");
				this.projectArea.setAttribute("class","ui-boxColumn50");
				this.dashBoardArea.appendChild(this.projectArea);
				//this.getProjects();
				break;
			case "INVESTMENTS":
				this.investmentArea = document.createElement('div');
				this.investmentArea.setAttribute("id","investment-area");
				this.investmentArea.setAttribute("class","ui-boxColumn50");
				this.dashBoardArea.appendChild(this.investmentArea);
				//this.getInvestments();
				break;
			case "MESSAGES":
				this.messageArea = document.createElement('div');
				this.messageArea.setAttribute("id","message-area");
				this.messageArea.setAttribute("class","ui-boxColumn50");
				this.dashBoardArea.appendChild(this.messageArea);
				//this.getMessages();
				break;
			case "ETERNALBOOKS":
				this.eternalArea = document.createElement('div');
				this.eternalArea.setAttribute("id","eteranlBook-area");
				this.eternalArea.setAttribute("class","ui-boxColumn50");
				this.dashBoardArea.appendChild(this.eternalArea);
				//this.getEternalBooks();
				break;
			case "BOTTLES":
				this.bottleArea = document.createElement('div');
				this.bottleArea.setAttribute("id","bottle-area");
				this.bottleArea.setAttribute("class","ui-boxColumn50");
				this.dashBoardArea.appendChild(this.bottleArea);
				toastHub.getDashboard("BOTTLES").drawDashboard(this.bottleArea);
				break;
			}
		}
	}; //loadPortals
	
	this.openAvailablePortalList = function(){
		var callUrl = toastHub.utils.restUrl + "social/dashboard/portal/list";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		requestFacade.timestamp = new Date().getTime();
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status != null && JSONData.status == false){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					esDashBoardObj.processAvailablePortalList(JSONData);
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
		
	}; //openAvailablePortalList
	
	this.processAvailablePortalList = function(JSONData){
		var portals = JSONData.availablePortals;
		var iHTML = "";
			// list	
		iHTML += "<ul class='ui-list-menu'>";
		iHTML += "<li onclick='esProjectObj.addPortal(\"ALL\");jQuery(\"#list-area\").dialog(\"close\");return false;'>Add All Portals</li>";
			for (var p = 0; portals.length > p; p++){
				iHTML += "<li onclick='esDashBoardObj.addPortal("+portals[p].id+");jQuery(\"#list-area\").dialog(\"close\");return false;'>"+portals[p].name+"</li>";
			}
			iHTML += "<li onclick='jQuery(\"#list-area\").dialog(\"close\");return false;'>Cancel</li>";
			iHTML += "</ul>";
			document.getElementById('list-area').innerHTML = iHTML;
		jQuery("#list-area").dialog("open");
	}; // processAvailablePortalList
	
	this.addPortal = function(availablePortalId){
		var callUrl = toastHub.utils.restUrl + "social/dashboard/portal/save";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		if (availablePortalId == "ALL"){
			requestFacade.allPortals = true;
		} else {
			var availablePortal = new Object();
			availablePortal.id = availablePortalId;;
			requestFacade.availablePortal = availablePortal;
		}
		requestFacade.timestamp = new Date().getTime();
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status != null && JSONData.status == false){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					esDashBoardObj.reloadAllPortals();
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
	}; //addPortal
	
	
	////////////////////////////////////////////////// Activities
	
	this.getActivities = function(){
		var callUrl = toastHub.utils.restUrl + "social/activity/dashboard";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		requestFacade.timestamp = new Date().getTime();
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			context: this,
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status != null && JSONData.status == false){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					this.processActivities(JSONData);
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
		
	}; // getActivities
	
	this.processActivities = function(JSONData) {
		var activities = JSONData.activities;
		var iHTML = "<div class='ui-boxHeader'>Activities</div><div class='ui-boxContent'>";
		if (activities != null && activities.length > 0){
			iHTML += "<ul>";
			for (var a = 0; activities.length > a; a++){
				iHTML += "<li>"+activities[a].user.firstname+" "+activities[a].messageShort+"</li>";
			}
			iHTML += "</ul>";
		} else {
			iHTML += "No Activities";
		}
		iHTML += "</div>";
		this.activityArea.innerHTML = iHTML;
	}; // processActivities
	
	////////////////////////////////////////////// Groups
	
	this.getGroups = function(){
		var callUrl = toastHub.restUrl + "member/social/group/dashboard";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		requestFacade.timestamp = new Date().getTime();
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			context: this,
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status != null && JSONData.status == false){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					this.processGroups(JSONData);
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
		
	}; // getGroups
	
	this.processGroups = function(JSONData) {
		var groups = JSONData.groups;
		var iHTML = "<div class='ui-boxHeader'>Groups</div><div class='ui-boxContent'>";
		if (groups != null && groups.length > 0){
			iHTML += "<ul>";
			for (var g = 0; groups.length > g; g++){
				iHTML += "<li>"+groups[g].name+" "+groups[g].description+"</li>";
			}
			iHTML += "</ul>";
		} else {
			iHTML += "No Groups";
		}
		iHTML += "</div>";
		this.groupArea.innerHTML = iHTML;
	}; // processGroups
	
	//////////////////////////////////////////////  Assigned Tasks
	
	this.getAssignedTasks = function(){
		var callUrl = toastHub.utils.restUrl + "project/dashboard";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		requestFacade.timestamp = new Date().getTime();
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			context: this,
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status != null && JSONData.status == false){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					this.processAssignedTasks(JSONData);
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
		
	}; // getAssignedTasks
	
	this.processAssignedTasks = function(JSONData) {
		var assignedTasks = JSONData.assignedTasks;
		var iHTML = "<div class='ui-boxHeader'>Assigned Tasks</div><div class='ui-boxContent'>";
		if (assignedTasks != null && assignedTasks.length > 0){
			iHTML += "<ul>";
			for (var a = 0; assignedTasks.length > a; a++){
				iHTML += "<li><div>Task Name: "+assignedTasks[a].task.title+" Role: "+assignedTasks[a].role.roleName+"</div>";
				iHTML += "<div>Start Date: "+assignedTasks[a].task.startDate+" End Date: "+assignedTasks[a].task.endDate+"</div>";
				iHTML += "<div>Estimated Hours: "+assignedTasks[a].task.totalWorkHoursEstimate+" Complete: "+assignedTasks[a].task.percentComplete+"%</div>";
				iHTML += "<div>Current Status: "+assignedTasks[a].statuses[0].status+"</div></li>";
			}
			iHTML += "</ul>";
		} else {
			iHTML += "No assigned tasks";
		}
		iHTML += "</div>";
		this.assignedTaskArea.innerHTML = iHTML;
	}; // processAssignedTasks
	
	
	//////////////////////////////////////////////// Projects
	
	this.getProjects = function(){
		var callUrl = toastHub.utils.restUrl + "project/status";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		requestFacade.timestamp = new Date().getTime();
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			context: this,
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status != null && JSONData.status == false){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					this.processProjects(JSONData);
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
		
	}; // getProjects
	
	this.processProjects = function(JSONData) {
		var projects = JSONData.projects;
		var iHTML = "<div class='ui-boxHeader'>Projects</div><div class='ui-boxContent'>";
		if (projects != null && projects.length > 0){
			iHTML += "<ul>";
			for (var i = 0; projects.length > i; i++){
				iHTML += "<li><div>Name: "+projects[i].name+"</div><div>Percent Complete: "+projects[i].precentComplete+"</div><div>End Date: "+projects[i].endDate+"</div></li>";
			}
			iHTML += "</ul>";
		} else {
			iHTML += "No projects";
		}
		iHTML += "</div>";
		this.projectArea.innerHTML = iHTML;
	}; // processAssignedTasks
	
	
	//////////////////////////////////////////////// Investments
	
	this.getInvestments = function(){
		var callUrl = toastHub.utils.restUrl + "investment/status";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		requestFacade.timestamp = new Date().getTime();
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			context: this,
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status != null && JSONData.status == false){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					this.processInvestments(JSONData);
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
		
	}; // getInvestments
	
	this.processInvestments = function(JSONData) {
		var investments = JSONData.investments;
		var iHTML = "<div class='ui-boxHeader'>Investments</div><div class='ui-boxContent'>";
		if (investments != null && investments.length > 0){
			iHTML += "<ul>";
			for (var i = 0; investments.length > i; i++){
				iHTML += "<li>"+investments[i].user.firstname+" "+investments[i].value+"</li>";
			}
			iHTML += "</ul>";
		} else {
			iHTML += "No Investments";
		}
		iHTML += "</div>";
		this.investmentArea.innerHTML = iHTML;
	}; // processInvestments
	
	
	//////////////////////////////////////////////// Messages
	
	this.getMessages = function(){
		var callUrl = toastHub.utils.restUrl + "social/message/dashboard";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		requestFacade.timestamp = new Date().getTime();
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			context: this,
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status != null && JSONData.status == false){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					this.processMessages(JSONData);
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
		
	}; // getMessages
	
	this.processMessages = function(JSONData) {
		var messages = JSONData.messages;
		var iHTML = "<div class='ui-boxHeader'>Messages</div><div class='ui-boxContent'>";
		if (messages != null && messages.length > 0){
			iHTML += "<ul>";
			for (var u = 0; messages.length > i; i++){
				iHTML += "<li>"+messages[i].user.firstname+" "+messages[i].value+"</li>";
			}
			iHTML += "</ul>";
		} else {
			iHTML += "No messages";
		}
		iHTML += "</div>";
		this.messageArea.innerHTML = iHTML;
	}; // processMessage
	
	
	//////////////////////////////////////////////// Eternals
	
	this.getEternalBooks = function(){
		var callUrl = toastHub.restUrl + this.ajaxFunc + "/eternal/book/list";
		var requestFacade = new Object();
		requestFacade.clientType = toastHub.utils.clientType;
		requestFacade.lang = toastHub.utils.lang;
		requestFacade.timestamp = new Date().getTime();
		jQuery.ajax({ type: "POST",
			url: callUrl,
			data: JSON.stringify(requestFacade),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			context: this,
			success: function(JSONData){
				if (JSONData == null){
					toastHub.utils.serverErrorMessage();
				} else if (JSONData.status == "ERROR"){
					toastHub.utils.applicationErrorMessage(JSONData);
				} else if (JSONData.status == "INFO"){
					toastHub.utils.applicationInfoMessage(JSONData);
				} else {
					toastHub.utils.clearErrorMessages();
					this.processEternalBooks(JSONData);
				}
				//closeStatusDialog();
			},
			error: toastHub.utils.errorMessage
		});
	}; // getEternalBooks
	
	this.processEternalBooks = function(JSONData) {
		var eternalBooks = JSONData.eternalBooks;
		var iHTML = "<div class='ui-boxHeader'>Eternal Books</div><div class='ui-boxContent'>";
		if (eternalBooks != null && eternalBooks.length > 0){
			iHTML += "<ul>";
			for (var i = 0; eternalBooks.length > i; i++){
				iHTML += "<li>"+eternalBooks[i].user.firstname+" "+eternalBooks[i].value+"</li>";
			}
			iHTML += "</ul>";
		} else {
			iHTML += "No Eternal Books";
		}
		iHTML += "</div>";
		this.eternalArea.innerHTML = iHTML;
	}; // processEternalBooks
	
	
	
	this.getDashBoardMenu = function(){
		var iHTML = "";
		iHTML += "<ul class='ui-list-menu'>";
		iHTML += "<li onclick='esDashBoardObj.openAvailablePortalList();jQuery(\"#sub-menu-area\").dialog(\"close\");return false;'>Add Portals</li>";
		iHTML += "<li onclick='jQuery(\"#sub-menu-area\").dialog(\"close\");return false;'>Cancel</li>";
		iHTML += "</ul>";
    	document.getElementById('sub-menu-area').innerHTML = iHTML;
    	jQuery("#sub-menu-area").dialog("open");
	}; // getDashBoardMenu
	
	//////////////////////////////////////////////////// UTILS
	this.loadText = function(){
		toastHub.utils.containerContentObj.innerHTML = "you hit back button";
	}; // loatText
	
} // DashBoard
