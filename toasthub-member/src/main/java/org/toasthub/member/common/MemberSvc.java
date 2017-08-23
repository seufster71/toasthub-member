package org.toasthub.member.common;

import org.toasthub.core.general.model.RestRequest;
import org.toasthub.core.general.model.RestResponse;

public interface MemberSvc {

	public void init(RestRequest request, RestResponse response);
	public void initMenu(RestRequest request, RestResponse response);
	
}
