
/*

function get_s_by_h_m_s(sessionTime){
	var temp = sessionTime.split(':');
	var h = parseInt(temp[0]);
	var m = parseInt(temp[1]);
	var s = parseInt(temp[2]);
	return 3600*h+m*60+s;
}


function removeClient(courseId){
	var formdata=new FormData();
	formdata.append("rawStatus", "Desktop");
	formdata.append("courseId", courseId);
	formdata.append("attemptId", Date.parse(new Date()));
	
	$.ajax({
		type: "POST",
		url:"http://wsxy.chinaunicom.cn/api/learner/play/removeClient",
		data:formdata,
		async: 0,
		contentType: false,
		processData: false,
		success: function(resp) {
			if(resp){
				console.debug('resp=',resp);
			}
		}
	});
}


params={
courseId:49153262,
classRoomId:49660265,
rocId:38708147,
location:500,
sessionTime:28*60+30,
uuid:'8e17a7f0-0274-4af9-bd4f-4b25bc596626'
}


*/

function get_h_m_s_by_s(sessionTime){
	var h=(Array(2).join('0') + Math.floor(sessionTime/3600)).slice(-2);
	sessionTime=sessionTime%3600;
	var m=(Array(2).join('0') + Math.floor(sessionTime/60)).slice(-2);	
	var s=(Array(2).join('0') + sessionTime%60).slice(-2);
	return h+':'+m+':'+s;
}

function get_I_timestamp(){
	var dd = new Date(); 
    var y = dd.getFullYear(); 
    var m = dd.getMonth()+1;//获取当前月份的日期 
    var d = dd.getDate(); 
	var ymd = y+'/'+m+'/'+d+' 10:30:00';
	var timestamp = new Date(ymd).getTime();
	return timestamp;
}
function get_uuid(){
	return '8e17a7f0-0274-4af9-bd4f-4b25bc596626';
	for (var t = [], n = 0; n < 36; n++)
		t[n] = "0123456789abcdef".substr(Math.floor(16 * Math.random()), 1);
	return t[14] = "4",
	t[19] = "0123456789abcdef".substr(3 & t[19] | 8, 1),
	t[8] = t[13] = t[18] = t[23] = "-",
	t.join("");
}

function get_params_by_detailId(detailId){
	var params={};
	$.ajax({
		type : "GET",
		async: 0,
		contentType: "application/json;charset=UTF-8",
		url : "http://wsxy.chinaunicom.cn/api/learner/offering-courses/"+detailId,
		data : null,
		success : function(resp) {
			params['classRoomId']=resp.offeringId;
			params['courseId']=resp.courseId;
			params['sessionTime']=parseInt(resp.duration)*60+2;
			params['location']=0;//Math.floor(parseFloat(resp.progress)/100*params['sessionTime']);
			params['_location']=0;
			params['uuid']=get_uuid();
			params['timestamp']=1593252230000;//Date.parse(new Date())-1000*60*10;
		}
	});
	$.ajax({
		type : "GET",
		async: 0,
		contentType: "application/json;charset=UTF-8",
		url : "http://wsxy.chinaunicom.cn/api/learner/play/course/"+params['courseId']+"/outline",
		data : null,
		success : function(resp) {
			params['rocId']=resp[0].id;
		}
	});	
	console.debug('params=',params);
	return params;	
}


function touch_history(params){		
	$.ajax({
		type : "GET",
		async: 0,
		contentType: "application/json;charset=UTF-8",
		url : "http://wsxy.chinaunicom.cn/api/learner/play/rco/"+params.rocId+"/history",
		data : {
			'rawStatus': 'incomplete',
			'credit': 'no-credit',
			'attemptToken': params['uuid'],
			'learnerAttemptId': params.timestamp,
			'course.id': params.courseId,
			'classroom.id': params.classRoomId,
			'rco.id': params.rocId,
			'sessionTime': get_h_m_s_by_s(params.sessionTime),
		},
		success : function(resp) {
		}
	});	
}

function fresh_progress(){
	try{
		$('.progress-box .ant-btn.ant-btn-primary').click()
	}catch(err){console.debug('fresh_progress error:', err.message);}
}
function attention(){
	try{
		$('.info-btn .course-button').text('正在刷课...');
		$('.info-btn .course-button')..attr('disabled',true); 
	}catch(err){console.debug('fresh_progress error:', err.message);}
}
function save_my_course(params){
	var formdata=new FormData();
	formdata.append("rawStatus", "incomplete");
	formdata.append("credit", "no-credit");
	formdata.append("attemptToken", params.uuid);
	formdata.append("learnerAttemptId", params.timestamp);//Date.parse(new Date()));
	formdata.append("course.id", params.courseId);
	formdata.append("classroom.id", params.classRoomId);
	formdata.append("rco.id", params.rocId);	
	formdata.append("sessionTime", get_h_m_s_by_s(params.location));
	formdata.append("terminalType", "PC");
	formdata.append("location", params.location+.108657);
		
	$.ajax({
		type: "POST",
		url:"http://wsxy.chinaunicom.cn/api/learner/play/course/"+params.courseId+"/save",
		data:formdata,
		async: 0,
		contentType: false,
		processData: false,
		success: function(resp) {			
			if(params.location<=params.sessionTime){				
				fresh_progress();
				params.location+=30;
				setTimeout(function(){save_my_course(params);}, 15*1000);
			}else{
				console.debug('done');
				return;				
			}
		},error: function() {
			setTimeout(function(){save_my_course(params);}, 5*1000);
		}
	});	
};

function get_points(course_id){
	if(!course_id){return};
	course_id=course_id+'';
	var msg='';
	$.ajax({
		type : "POST",
		async: 0,
		contentType: "application/json;charset=UTF-8",
		url : "http://wsxy.chinaunicom.cn/api/learner/unicom/points/add/courese/"+course_id,
		data : null,
		success : function(resp) {
			console.debug('resp=',resp);
			msg='课程完成，金币领取成功';
		},
		error : function(resp){
			msg=resp.responseJSON.message;
			console.debug('resp', msg);
		}
	});
	return msg;
};


function init(){
	var detailId=window.location.href.split('detail/')[1];
	var params=get_params_by_detailId(detailId);
	if(params){
		attention();
		touch_history(params);
		save_my_course(params);
	}	
}

init();


