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
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
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
import org.toasthub.core.preference.model.PrefCacheUtil;
import org.toasthub.security.model.MyUserPrincipal;
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
	PrefCacheUtil prefCacheUtil;
	
	@Autowired
	@Qualifier("UsersDao")
	UsersDao usersDao;
	
	@Autowired 
	UserContext userContext;
	
	@Autowired
	HttpServletRequest servletRequest;
	@Autowired
	HttpServletResponse servletResponse;


	// Constructors
	public MemberSvcImpl() {}
	
	// Processor
	public void process(RestRequest request, RestResponse response) {
		String action = (String) request.getParams().get(GlobalConstant.ACTION);
		this.setupDefaults(request);
		

		switch (action) {
		case "INIT":
			request.addParam(PrefCacheUtil.PREFPARAMLOC, PrefCacheUtil.RESPONSE);
			prefCacheUtil.getPrefInfo(request,response);
			
			// get menus
			if (request.containsParam(GlobalConstant.MENUNAMES)){
				this.initMenu(request, response);
			}
			response.setStatus(RestResponse.SUCCESS);
			break;
		case "INIT_MENU":
			this.setMenuDefaults(request);
			this.initMenu(request, response);
			break;
		case "INIT_PROFILE":
			request.addParam(PrefCacheUtil.PREFPARAMLOC, PrefCacheUtil.RESPONSE);
			prefCacheUtil.getPrefInfo(request,response);
			this.initProfile(request,response);
			break;
		case "SAVE_PROFILE":
			prefCacheUtil.getPrefInfo(request,response);
			this.saveProfile(request,response);
			break;
		case "CHECK":
			response.addParam("USER", ((MyUserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUser());
			utilSvc.addStatus(RestResponse.INFO, RestResponse.SUCCESS, "Alive", response);
			break;
		case "LOGOUT":
			logout(request, response);
			break;
		default:
			break;
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
		
		if (!menuList.isEmpty()){
			response.addParam(RestResponse.MENUS, menuList);
		} else {
			utilSvc.addStatus(RestResponse.INFO, RestResponse.SUCCESS, "Menu Issue", response);
		}
	}
	
	protected void initProfile(RestRequest request, RestResponse response) {
		try {
			User user = usersDao.findUser(SecurityContextHolder.getContext().getAuthentication().getName());
			response.addParam(GlobalConstant.ITEM, user);
		
		} catch (Exception e) {
			utilSvc.addStatus(RestResponse.ERROR, RestResponse.ACTIONFAILED, "Profile lookup failed", response);
			e.printStackTrace();
		}
	}
	
	protected void saveProfile(RestRequest request, RestResponse response) {
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
	
	protected void setupDefaults(RestRequest request){
		
		if (!request.containsParam(GlobalConstant.MENUAPIVERSION)){
			request.addParam(GlobalConstant.MENUAPIVERSION, "1.0");
		}

		if (!request.containsParam(GlobalConstant.MENUAPPVERSION)){
			request.addParam(GlobalConstant.MENUAPPVERSION, "1.0");
		}
		
	}
	
	protected void setMenuDefaults(RestRequest request){
		if (!request.containsParam(GlobalConstant.MENUNAMES)){
			ArrayList<String> myList = new ArrayList<String>();
			myList.add("MEMBER_MENU_LEFT");
			myList.add("MEMBER_MENU_RIGHT");
			request.addParam(GlobalConstant.MENUNAMES, myList);
		}
	}
	
	protected void logout(RestRequest request, RestResponse response) {
		// invalidate user context and terminate session
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null) {
			new SecurityContextLogoutHandler().logout(servletRequest, servletResponse, auth);
		}
		utilSvc.addStatus(RestResponse.INFO, RestResponse.SUCCESS, "Good Bye", response);
		// log user activity
		
	}
}