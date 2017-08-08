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

memberLayout.prototype = Object.create(toastHubMemberLayout.prototype);
memberLayout.prototype.constructor = memberLayout;

toastHub.registerLayout("memberLayout",new memberLayout("memberLayout"));

function memberLayout(instanceName){
	toastHubMemberLayout.call(this,instanceName,this);
	this.controllerName = "memberlayout";
	var self = this;
	
	// Override the default setup
	this.navRendererDraw = function(JSONData) {
		toastHub.logSystem.log("DEBUG","memberLayout::navRendererDraw");
		
		var menuRight = JSONData.params.MENUS.MEMBER_MENU_RIGHT;
		var topParams = {container:self.topRightMenuContainer,menuName:"MEMBER_MENU_RIGHT",menu:menuRight,menuToggle:function() {self.menuToggle();}};
		var topMenu = new ToastHubTopMenu();
		topMenu.render(topParams);
		
		var buttonToggle = document.createElement("BUTTON");
		buttonToggle.type = "button";
		buttonToggle.className = "navbar-toggle";
		buttonToggle.setAttribute("data-toggle", "collapse");
		buttonToggle.setAttribute("data-target", "#bs-example-navbar-collapse-1");
		
		buttonToggle.innerHTML = "<span class='sr-only'>Toggle navigation</span> Menu <i class='fa fa-bars'></i>"
		self.leftSideMenuContainer.appendChild(buttonToggle);
		
		var logo = document.createElement("A");
		logo.className = "navbar-brand page-scroll";
		logo.href = "#page-top";
		logo.innerHTML = "Cborgcust";
		self.leftSideMenuContainer.appendChild(logo);
	}; // navHeaderDraw
	
	this.footerRenderer = function(params){
		toastHub.logSystem.log("DEBUG","memberLayout::footerRenderer");
		var footer = document.createElement("FOOTER");
		toastHub.body.appendChild(footer);
		
		var container = document.createElement("DIV");
		container.className = "row";
		footer.appendChild(container);
		
		var col1 = document.createElement("DIV");
		col1.className = "col-md-4";
			var copyright = document.createElement("SPAN");
			copyright.className = "copyright";
			copyright.innerHTML = "Copyright &copy; Cborgtech 2017";
			col1.appendChild(copyright);
		container.appendChild(col1);
		
		var col2 = document.createElement("DIV");
		col2.className = "col-md-4";
			var ul1 = document.createElement("UL");
			ul1.className = "list-inline social-buttons";
			col2.appendChild(ul1);
			var li1 = document.createElement("LI");
			li1.innerHTML = "<a href='#'><i class='fa fa-twitter'></i></a>";
			ul1.appendChild(li1);
			var li2 = document.createElement("LI");
			li2.innerHTML = "<a href='#'><i class='fa fa-facebook'></i></a>";
			ul1.appendChild(li2);
			var li3 = document.createElement("LI");
			li3.innerHTML = "<a href='#'><i class='fa fa-linkedin'></i></a>";
			ul1.appendChild(li3);
		container.appendChild(col2);
			
		var col3 = document.createElement("DIV");
		col3.className = "col-md-4";
			var ul2 = document.createElement("UL");
			ul2.className = "list-inline quicklinks";
			col3.appendChild(ul2);
			var li31 = document.createElement("LI");
			li31.innerHTML = "<a href='#'>Privacy Policy</a>";
			ul2.appendChild(li31);
			var li32 = document.createElement("LI");
			li32.innerHTML = "<a href='#'>Terms of Use</a>";
			ul2.appendChild(li32);
		container.appendChild(col3);	

	}; // footerRenderer
	
}; // mmeberLayout




