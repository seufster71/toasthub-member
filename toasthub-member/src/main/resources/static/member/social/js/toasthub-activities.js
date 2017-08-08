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

toastHubActivity.prototype = Object.create(toastHubBase.prototype);
toastHubActivity.prototype.constructor = toastHubActivity;

toastHub.registerController("activities",new toastHubActivity("activities"));

function toastHubActivity(instanceName){
	toastHubBase.call(this,instanceName,this);
	this.ajaxFunc = "member";
	this.service = "ACTIVITIES_SVC";
	this.pageMetaName = "SOCIAL_ACTIVITIES";
	this.activityArea = null;
	this.assignedTaskArea = null;
	var self = this;
	
	this.processInit = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-activities:toastHubActivity:processInit ");
		if (JSONData.params.showActivities){
			this.activityArea = document.createElement('div');
			this.activityArea.setAttribute("id","activity-area");
			this.activityArea.setAttribute("class","ui-boxColumn50");
			toastHub.containerContentObj.appendChild(this.activityArea);
			this.loadActivities();
		}
		if (JSONData.params.showAssignedTasks){
			this.assignedTaskArea = document.createElement('div');
			this.assignedTaskArea.setAttribute("id","assignedTask-area");
			this.assignedTaskArea.setAttribute("class","ui-boxColumn50");
			toastHub.containerContentObj.appendChild(this.assignedTaskArea);
			this.loadAssignedTasks();
		}
		if (JSONData.params.showInvestments){
			this.investmentsArea = document.createElement('div');
			this.investmentsArea.setAttribute("id","investments-area");
			this.investmentsArea.setAttribute("class","ui-boxColumn50");
			toastHub.containerContentObj.appendChild(this.investmentsArea);
			this.loadInvestments();
		}
		if (JSONData.params.showProjects){
			this.projectsArea = document.createElement('div');
			this.projectsArea.setAttribute("id","projects-area");
			this.projectsArea.setAttribute("class","ui-boxColumn50");
			toastHub.containerContentObj.appendChild(this.projectsArea);
			this.loadProjects();
		}
		
	}; // processInit
	
	this.loadActivities = function(){
		toastHub.logSystem.log("DEBUG","toasthub-activities:toastHubActivity:loadActivities ");
    	var params = toastHub.initParams();
		params.action = "LIST";
		params.callBack = function(JSONData){self.processActivities(JSONData);};
		this.callService(params);
	}; // loadActivities
	
	this.processActivities = function(JSONData) {
		toastHub.logSystem.log("DEBUG","toasthub-activities:toastHubActivity:processActivities ");
		var activities = JSONData.params.activities;
		var iHTML = "<ul>";
		for (var a in activities){
			if (activities.hasOwnProperty(a)) {
				var activity = activities[a];
				iHTML += "<li>"+activity.user.firstname+" "+activity.value+"</li>";
			}
		}
		iHTML += "</ul>";
		toastHub.getController("activity").activityArea.innerHTML = iHTML;
	}; // processActivities
	
	this.loadAssignedTasks = function(){
		toastHub.logSystem.log("DEBUG","toasthub-activities:toastHubActivity:loadAssignedTasks ");
		var params = toastHub.initParams();
		params.action = "TASK_LIST";
		params.callBack = function(JSONData){self.processAssignedTasks(JSONData);};
		this.callService(params);
	}; // loadAssignedTasks
	
	this.processAssignedTasks = function(JSONData) {
		var assignedTasks = JSONData.parama.assignedTasks;
		var iHTML = "<ul>";
		for (var a in assignedTasks){
			if (assignedTasks.hasOwnProperty(a)) {
				var task = assignedTasks[a];
				iHTML += "<li>"+task.user.firstname+" "+task.value+"</li>";
			}
		}
		iHTML += "</ul>";
		toastHub.getController("activity").assignedTaskArea.innerHTML = iHTML;
	}; // processAssignedTasks
	
	this.loadText = function(){
		toastHub.utils.containerContentObj.innerHTML = "you hit back button";
	}; // loadText
	
} // Activity
