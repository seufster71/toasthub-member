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

toastHubLibrary.prototype = Object.create(toastHubBase.prototype);
toastHubLibrary.prototype.constructor = toastHubLibrary;

toastHub.registerController("library",new toastHubLibrary("library"));

function toastHubLibrary(instanceName){
	toastHubBase.call(this,instanceName,this);
	this.ajaxFunc = "member";
	this.service = "LIBRARY_SVC";
	this.pageMetaName = "SOCIAL_LIBRARY";
	this.libraryContainer = null;
	this.libraryCallBack = null;
	this.currentTab = null;
	this.directoryId = null;
	this.access = null;
	this.receiverId = null;
	this.parentId = null;
	this.formArea = null;
	var self = this;

	this.processInit = function(JSONData) {
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:processInit ");
		this.pageFormFields = JSONData.params.sysPageFormFields;
		this.pageLabels = JSONData.params.sysPageLabels;
		this.pageTexts = JSONData.params.sysPageTexts;
		this.currentTab = "MINE";
		var iHTML = "";
		iHTML += "<div id='tabs'><ul>";
				iHTML += "<li><a href='#tabs-1'>"+this.pageTexts.SOCIAL_LIBRARY_MAIN_TAB_MINE.value+"</a></li>";
				iHTML += "<li><a href='#tabs-2'>"+this.pageTexts.SOCIAL_LIBRARY_MAIN_TAB_SHARED.value+"</a></li>";
			iHTML += "</ul>";
			iHTML += "<div id='tabs-1'></div>";
			iHTML += "<div id='tabs-2'></div>";
		iHTML += "</div>";

		toastHub.containerContentObj.innerHTML = iHTML;
		this.makePretty();
		this.processLibraryTab(JSONData);
		
		// form
		this.formArea = document.createElement("DIV");
		this.formArea.id = "form-area";
		toastHub.containerContentObj.appendChild(this.formArea);
		jQuery("#form-area").dialog({ autoOpen: false, modal:true, minWidth:600, width:800 });
	}; // processInitGroups
	
	this.makePretty = function(){
		jQuery('#tabs').tabs({
			select: function(event, ui) { 
				var id = ui.panel.id;
				var myTab = id.split("-");
				switch(parseInt(myTab[1])){
				case 1:
					toastHub.getController("library").currentTab = "MINE";
					toastHub.getController("library").loadLibraryTab();
					break;
				case 2:
					toastHub.getController("library").currentTab = "SHARED";
					toastHub.getController("library").loadLibraryTab();
					break;
				}
		    }
		 });
	}; // makePretty
	
	this.loadLibraryTab = function(){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:loadLibraryTab ");
		var params = toastHub.initParams();
		params.action = "LIST";
		console.log("currentTab " + this.currentTab);
		params.type = this.currentTab;
		params.callBack = function(JSONData){self.processLibraryTab(JSONData);};
		this.callService(params);
	}; // loadLibraryTab
	
	this.processLibraryTab = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:processLibraryTab ");
		var tab = null;
		var iHTML = "";
		if (JSONData.params.type == "MINE"){
			tab = document.getElementById("tabs-1");
			iHTML += "<div class='ui-boxColumn90'><div class='ui-boxHeader'><div class='searchwrapper'>" +
					"<input type='text' class='searchfield' id='mine-searchString' name='mine-searchString' onblur='if (this.value == \"\") {this.value = \"Search...\";}' onfocus='if (this.value == \"Search...\") {this.value = \"\";}' value='Search...'/>" +
					"<input class='searchbutton' type='button' value='Go' onclick='toastHub.getController(\"library\").search();return false;' />" +
					"<img title='Add Directory' alt='Add Directory' src='/dodream/img/icons/16x16/library.png' onclick='toastHub.getController(\"library\").editDirectory();return false;'></img></div>" +
					"</div><div id='mine-list' class='ui-boxContent'></div></div>";
		} else if (JSONData.params.type == "SHARED"){
			tab = document.getElementById("tabs-2");
			iHTML += "<div class='ui-boxColumn90'><div class='ui-boxHeader'><div class='searchwrapper'>" +
					"<input type='text' class='searchfield' id='shared-searchString' name='shared-searchString' onblur='if (this.value == \"\") {this.value = \"Search...\";}' onfocus='if (this.value == \"Search...\") {this.value = \"\";}' value='Search...'/>" +
					"<input class='searchbutton' type='button' value='Go' onclick='toastHub.getController(\"library\").search();return false;' /></div>" +
					"</div><div id='shared-list' class='ui-boxContent'></div></div>";
		} else {
			tab = document.getElementById("tabs-1");
			iHTML = "Error no type send back";
		}
		tab.innerHTML = iHTML;
		this.processDirsAndFiles(JSONData);
	}; // processLibraryTab
	
	this.search = function(){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:search ");
		var params = toastHub.initParams();
		params.action = "LIST";
		
		var searchString = null;
		if (this.currentTab == "MINE"){
			searchString = document.getElementById("mine-searchString").value;
		} else if (this.currentTab == "SHARED"){
			searchString = document.getElementById("shared-searchString").value;
		} else {
			searchString = document.getElementById("mine-searchString").value;
		}
		if (searchString.length < 2){
			return;
		}
		params.searchString = searchString;
		params.type = this.currentTab;
		params.callBack = function(JSONData){self.processDirsAndFiles(JSONData);};
		this.callService(params);
	}; // search
	
	this.processDirsAndFiles = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:processDirsAndFiles ");
		var rows = JSONData.params.directories;
		var iHTML = "";
		if (rows != null && rows.length > 0){
			iHTML += "<ul class='jd-list'>";
			for ( var r = 0; r < rows.length; r++) {
				var row = rows[r];
				var access = "Public open to all";
				if (row.access != null && row.access == "PUBR"){
					access = "Public but request approval";
				} else if (row.access != null && row.access == "PRII"){
					access = "Private";
				}
				if (JSONData.params.type == "MINE"){
					iHTML += "<li class='jd-group-header'><div><img src='/dodream/img/icons/16x16/folder.png' onclick='toastHub.getController(\"library\").getSubDirAndFiles("+row.id+");return false;'>"+row.name+"</img>";
					iHTML += "<img alt='Delete' src='/dodream/img/icons/16x16/basket.png' onclick='toastHub.getController(\"library\").deleteDirectory("+row.id+");return false;'></img>" +
						"<img title='Create' alt='Create' src='/dodream/img/icons/16x16/plus.png' onclick='toastHub.getController(\"library\").createSubDirectory("+row.id+");return false;'></img>" +
						"<img title='Move' alt='Move' src='/dodream/img/icons/16x16/limited-edition.png' onclick='toastHub.getController(\"library\").moveDirectory("+row.id+");return false;'></button></div>" +
						"<div class='jd-subDir' id='sub-directories-"+row.id+"'></div></li>";
				} else if (JSONData.params.type == "SHARED"){
					iHTML += "<li class='jd-group-header'><div><div>Name:"+row.name+"</div><div>Owner:"+row.owner.firstname+" "+row.owner.lastname+"</div>" +
						"<div>Access: "+access+"</div>" +
						"<button type='button' title='leaveGroup' onclick='toastHub.getController(\"library\").leaveGroup("+row.id+");return false;'>Leave Group</button>" +
						"<button type='button' title='createDiscussion' onclick='toastHub.getController(\"library\").editDiscussion(null,"+row.id+");return false;'>Create Discussion</button>" +
						"<button type='button' title='showDiscussion' onclick='toastHub.getController(\"library\").loadDiscussions("+row.id+");return false;'>Show Discussion</button></div>" +
						"<div id='joined-discussions-"+row.id+"'></div></li>";
				} else {
					
				}
			}
			iHTML += "</ul>";
		} else {
			iHTML += "<p>No Directories or Files returned</p>";
		}
		if (JSONData.params.type == "MINE"){
			document.getElementById("mine-list").innerHTML = iHTML;
		} else if (JSONData.params.type == "SHARED"){
			document.getElementById("shared-list").innerHTML = iHTML;
		} else {
			
		}
	}; // processDirsAndFiles
	
	this.getSubDirAndFiles = function(parentId){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:getSubDirAndFiles ");
		var params = toastHub.initParams();
		params.action = "LIST";
		params.type = this.currentTab;
		params.parentId = parentId;
		params.callBack = function(JSONData){self.processSubDirAndFiles(JSONData);};
		this.callService(params);
	}; // loadSubDirAndFiles
	
	this.processSubDirAndFiles = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:processSubDirAndFiles ");
		var dirs = JSONData.params.directories;
		var iHTML = "";
		if (dirs != null && dirs.length > 0){
			iHTML += "<ul class='jd-list'>";
			for (var i = 0,len = dirs.length; i < len; i++) {
				iHTML += "<li class='jd-group-header'><div><img src='/dodream/img/icons/16x16/folder.png' onclick='toastHub.getController(\"library\").getSubDirAndFiles("+dirs[i].id+");return false;'>"+dirs[i].name+"</img>";
				iHTML += "<img alt='Delete' src='/dodream/img/icons/16x16/basket.png' onclick='toastHub.getController(\"library\").deleteDirectory("+dirs[i].id+");return false;'></img>" +
					"<img title='Create' alt='Create' src='/dodream/img/icons/16x16/plus.png' onclick='toastHub.getController(\"library\").createSubDirectory("+dirs[i].id+");return false;'></img>" +
					"<img title='Move' alt='Move' src='/dodream/img/icons/16x16/limited-edition.png' onclick='toastHub.getController(\"library\").moveDirectory("+dirs[i].id+");return false;'></button></div>" +
					"<div class='jd-subDir' id='sub-directories-"+dirs[i].id+"'></div></li>";
			}
			iHTML += "</ul>";
		}
		var files = JSONData.params.files;
		if (files != null && files.length > 0){
			iHTML += "<ul class='jd-list'>";
			for (var i = 0,len = files.length; i < len; i++) {
				iHTML += "<li class='jd-group-header'><div><img src='/dodream/img/icons/16x16/cv.png' onclick=''>"+files[i].title+"</img></li>";
			}
			iHTML += "</ul>";
		}
		document.getElementById("sub-directories-"+JSONData.params.directoryId).innerHTML = iHTML;
	}; // processSubDirAndFiles
	
	this.editDirectory = function(id){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:editDirectory ");
		if (id == null){
			this.openDirectoryForm();
		} else {
			var params = toastHub.initParams();
			params.action = "DIRECTORY_SHOW";
			params.id = id;
			params.callBack = function(JSONData){self.openDirectoryFrom(JSONData);};
			this.callService(params);
		}
	}; // editDirectory
	
	this.openDirectoryForm = function(JSONData){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:openDirectoryForm ");
		var iHTML = "";
		if (JSONData != null && JSONData.params.directory != null){
			this.directory = JSONData.params.directory;
			iHTML += "<div>Modify Directory:  </div>";
		} else {
			iHTML += "<div>Create new Directory:  </div>";
			this.directory = null;
		}

		iHTML += "<div id='wrap-directoryName'>Name: <input type='text' id='directoryName' name='directoryName' size='100'";
		if (this.directory != null && this.directory.name != null){
			iHTML += " value='"+this.directory.name+"' ";
		}
		iHTML += "/></div>";
		iHTML += "<div><input type='button' value='Save' onclick='toastHub.getController(\"library\").validateDirectory();return false;'/></div>";
		iHTML += "<div><input type='button' value='Close' onclick='jQuery(\"#form-area\").dialog(\"close\");return false;'/></div>";
    	document.getElementById('form-area').innerHTML = iHTML;
		jQuery("#form-area").dialog("open");
	}; // openDirectoryForm
	
	this.deleteDirectory = function(id){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:deleteDirectory ");
		var params = toastHub.initParams();
		params.action = "DIRECTORY_DELETE";
		params.id = id;
		params.callBack = function(JSONData){self.loadLibraryTab(JSONData);};
		this.callService(params);
	}; // deleteDirectory
	
	this.validateDirectory = function(){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:validateDirectory ");
		var isValid = true;
		var directoryName = document.getElementById('directoryName');
		if (directoryName != null && directoryName.value == ""){
			isValid = false;
			toastHub.utils.createErrorMessage('directoryName','Missing value');
		} else {
			toastHub.utils.removeErrorMessage('directoryName');
		}
		if (isValid){
			this.saveDirectory();
		}
	}; //validateDirectory
	
	this.saveDirectory = function(){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:saveDirectory ");
		var params = toastHub.initParams();
		params.action = "DIRECTORY_SAVE";
		if (this.parentId != null){
			params.parentId = this.parentId;
		}
		if (this.Directory != null){
			params.Directory = this.directory;
		} else {
			params.Directory = new Object();
		}
    	params.Directory.name = document.getElementById('directoryName').value;
		params.callBack = function(JSONData){self.updateLibraryList(JSONData);};
		this.callService(params);
	}; //saveGroup 
	
	this.updateLibraryList = function(){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:updateLibraryList ");
		this.loadLibraryTab();
		jQuery("#form-area").dialog("close");
	}; //updateGroupList
	
	this.createSubDirectory = function(id){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:createSubDirectory ");
		this.parentId = id;
		this.openDirectoryForm();
	}; //createSubDirectory
	
	
	
	this.openShareDirForm = function(groupId,access){
		toastHub.logSystem.log("DEBUG","toasthub-library:toastHubLibrary:openShareDirForm ");
		this.groupId = groupId;
		this.access = access;
		var iHTML = "<div>Join Group Request: </div>";
		iHTML += "<div id='wrap-groupWhyRequest'>Why do you want to join this group: <textarea id='groupWhyRequest' name='groupWhyRequest' rows='20' cols='50' maxlength='2000'></textarea></div>";
		iHTML += "<div><input type='button' value='Save' onclick='toastHub.getController(\"library\").validateRequestJoinGroup();return false;'/></div>";
		iHTML += "<div><input type='button' value='Close' onclick='jQuery(\"#form-area\").dialog(\"close\");return false;'/></div>";
    	document.getElementById('form-area').innerHTML = iHTML;
		jQuery("#form-area").dialog("open");
		jQuery("#groupWhyRequest").cleditor();
	}; // openShareDirForm
	
	
	
} // Library