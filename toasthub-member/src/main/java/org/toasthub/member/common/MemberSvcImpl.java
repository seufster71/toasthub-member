/*
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

package org.toasthub.member.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.toasthub.core.common.EntityManagerMainSvc;
import org.toasthub.core.common.UtilSvc;
import org.toasthub.core.general.handler.ServiceProcessor;
import org.toasthub.core.general.model.AppCacheMenuUtil;
import org.toasthub.core.general.model.GlobalConstant;
import org.toasthub.core.general.model.MenuItem;
import org.toasthub.core.general.model.RestRequest;
import org.toasthub.core.general.model.RestResponse;
import org.toasthub.core.menu.MenuSvc;
import org.toasthub.core.preference.model.AppCachePageUtil;
import org.toasthub.security.model.User;
import org.toasthub.security.model.UserContext;
import org.toasthub.security.users.UsersDao;

@Service("MemberSvc")
public class MemberSvcImpl implements ServiceProcessor, MemberSvc {
	
	@Autowired 
	UtilSvc utilSvc;
	
	@Autowired 
	EntityManagerMainSvc entityManagerMainSvc;
	
	@Autowired 
	AppCacheMenuUtil appCacheMenuUtil;
	
	@Autowired 
	@Qualifier("MenuSvc")
	MenuSvc menuSvc;
	
	@Autowired 
	AppCachePageUtil appCachePageUtil;
	
	@Autowired
	@Qualifier("UsersDao")
	UsersDao usersDao;
	
	@Autowired 
	UserContext userContext;

	// Constructors
	public MemberSvcImpl() {}
	
	// Processor
	public void process(RestRequest request, RestResponse response) {
		String action = (String) request.getParams().get(GlobalConstant.ACTION);
		
		this.setupDefaults(request);
		//appCachePage.getPageInfo(request,response);
		
		switch (action) {
		case "INIT":
			request.addParam("appPageParamLoc", "response");
			appCachePageUtil.getPageInfo(request,response);
			this.init(request, response);
			break;
		case "INIT_MENU":
			this.setMenuDefaults(request);
			this.initMenu(request, response);
			break;
		case "INIT_PROFILE":
			request.addParam("appPageParamLoc", "response");
			appCachePageUtil.getPageInfo(request,response);
			this.initProfile(request,response);
			break;
		case "SAVE_PROFILE":
			appCachePageUtil.getPageInfo(request,response);
			this.saveProfile(request,response);
			break;
		default:
			break;
		}
		
	
	}
	
	public void init(RestRequest request, RestResponse response) {
		response.addParam(GlobalConstant.PAGELAYOUT,entityManagerMainSvc.getMemberLayout());
		response.addParam(GlobalConstant.APPNAME,entityManagerMainSvc.getAppName());
		response.addParam(GlobalConstant.HTMLPREFIX, entityManagerMainSvc.getHTMLPrefix());
		// default language code
		if (userContext != null && userContext.getCurrentUser() != null){
			response.addParam("userLang",(userContext.getCurrentUser().getLang()));
		}
	}
	
	public void initMenu(RestRequest request, RestResponse response){
		List<MenuItem> menu = null;
		Map<String,List<MenuItem>> menuList = new HashMap<String,List<MenuItem>>();
		//TODO: NEED to add some separation for app and domain so there is no cross over
		ArrayList<String> mylist = (ArrayList<String>) request.getParam(GlobalConstant.MENUNAMES);
		for (String menuName : mylist) {
			menu = appCacheMenuUtil.getMenu(menuName,(String)request.getParam(GlobalConstant.MENUAPIVERSION),(String)request.getParam(GlobalConstant.MENUAPPVERSION),(String)request.getParam(GlobalConstant.LANG));
			menuList.put(menuName, menu);
		}

		
		String name = "";
		if (userContext != null && userContext.getCurrentUser() != null){
			name = name.concat(userContext.getCurrentUser().getFirstname());
		}
		response.addParam("username", name);
		
		if (!menuList.isEmpty()){
			response.addParam(RestResponse.MENUS, menuList);
		} else {
			utilSvc.addStatus(RestResponse.INFO, RestResponse.SUCCESS, "Menu Issue", response);
		}
	}
	
	public void initProfile(RestRequest request, RestResponse response) {
		try {
			User user = usersDao.findUser(SecurityContextHolder.getContext().getAuthentication().getName());
			response.addParam("item", user);
		
		} catch (Exception e) {
			utilSvc.addStatus(RestResponse.ERROR, RestResponse.ACTIONFAILED, "Profile lookup failed", response);
			e.printStackTrace();
		}
	}
	
	public void saveProfile(RestRequest request, RestResponse response) {
		try {
			
			// validate
			utilSvc.validateParams(request, response);
			
			if ((Boolean) request.getParam(GlobalConstant.VALID) == false) {
				utilSvc.addStatus(RestResponse.ERROR, RestResponse.ACTIONFAILED, "Validation Error", response);
				return;
			}
			// get existing item
			User user = usersDao.findUser(SecurityContextHolder.getContext().getAuthentication().getName());
			request.addParam(GlobalConstant.ITEM, user);
			// marshall
			utilSvc.marshallFields(request, response);
			
			// user
			usersDao.updateUser(request, response);
		
			// refresh user session info
			if (userContext != null && userContext.getCurrentUser() != null){
				userContext.setCurrentUser(user);
			}
			
			utilSvc.addStatus(RestResponse.INFO, RestResponse.SUCCESS, "Save Successful", response);
		} catch (Exception e) {
			utilSvc.addStatus(RestResponse.ERROR, RestResponse.ACTIONFAILED, "Save failed", response);
			e.printStackTrace();
		}
	}
	
	public void setupDefaults(RestRequest request){
		
		if (!request.containsParam(GlobalConstant.MENUAPIVERSION)){
			request.addParam(GlobalConstant.MENUAPIVERSION, "1.0");
		}

		if (!request.containsParam(GlobalConstant.MENUAPPVERSION)){
			request.addParam(GlobalConstant.MENUAPPVERSION, "1.0");
		}
		
	}
	
	public void setMenuDefaults(RestRequest request){
		if (!request.containsParam(GlobalConstant.MENUNAMES)){
			ArrayList<String> myList = new ArrayList<String>();
			myList.add("MEMBER_MENU_LEFT");
			myList.add("MEMBER_MENU_RIGHT");
			request.addParam(GlobalConstant.MENUNAMES, myList);
		}
	}
}