/*
author: db168@263.net
data: 	2018-11016
email:
 */
function Wipe(obj){
	this.conID = obj.id;
	this.cas = document.getElementById(this.conID);
	this.context = cas.getContext("2d");
	this._w = obj.width;
	this._h = obj.height;
	this.radius = obj.radius;//涂抹半径
	this.coverType = obj.coverType;//覆盖的是颜色还是图
	this.color = obj.color || "#666";//覆盖的颜色
	this.imgUrl = obj.imgUrl;	//覆盖图
	this.backImgUrl = obj.backImgUrl;//背景图
	this.x1 = 0;
	this.y1 = 0;
	this.x2 = 0;
	this.y2 = 0;
	this.isMouseDown = false;
	this.device = (/android|webos|iPhone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
	// 判断是手机端还是PC端
	this.press = this.device ? "touchstart" : "mousedown";
	this.move = this.device ? "touchmove" : "mousemove";
	this.loosen = this.device ? "touchend" : "mouseup";
	this.callback = obj.callback;
	this.transpercent = obj.transpercent;//用户定义的百分比
	this.drawRect();
	this.operation();
}
// 画线清除
Wipe.prototype.drawT = function(x1,y1,x2,y2){
	if (arguments.length === 2) {
		//画点功能
		this.context.save();
		this.context.beginPath();
		this.context.arc(x1,y1,this.radius,0,2*Math.PI);
		this.context.fillStyle = "red";
		this.context.fill();
		this.context.restore();
	}else if (arguments.length === 4){
		//画线功能
		this.context.save();
		this.context.lineCap = "round";
		this.context.beginPath();
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.lineWidth = this.radius*2;
		this.context.stroke();
		this.context.restore();
	}
}
//drawT画点和画线函数
//参数:如果只有两个参数,函数功能画圆,x1,y1即圆的中心坐标

// 清除画布
Wipe.prototype.clearRect = function(){
	this.context.clearRect(0,0,this._w,this._h);
}
// 获取透明点占整个画布的百分比
// Wipe.prototype.getTransparencyPercent = function(){
// 	var c = 0;
// 	var a = this.context.getImageData(0,0,this._w,this._h);
// 		console.log(a);
// 	for (var j = 0; j < _h; j++) {
// 		for (var i = 0; i < this._w; i++) {
// 			var f = ((this._w*j)+i)*4+3;
// 			if (a.data[f] === 0) {	
// 				c++;
// 			}
// 		}
// 	}
// 	var tmb = c/(_w*_h)*100;
// 	console.log(Math.round(tmb));
// 	if (tmb > 60) {
// 		this.clearRect();
// 	}
// 	isMouseDown = false;
// }
Wipe.prototype.drawRect = function(){
	if (this.coverType === "color") {
		this.context.save();
		this.context.beginPath();
		this.context.fillStyle = "#666";
		this.context.fillRect(0,0,this._w,this._h);
		this.context.globalCompositeOperation = "destination-out";
	}else if (this.coverType === "image") {
		var img = new Image();
		var that = this;
		img.src = this.imgUrl;
		img.onload = function(){
			//context.drawImage(img1,20,20,600,400);
			//裁剪图片
			that.context.drawImage(img,0,0,img.width,img.height,0,0,375,667);
			that.context.globalCompositeOperation = "destination-out";
		}
	}
}
Wipe.prototype.operation = function(){
	var that = this;
	this.cas.addEventListener(that.press,function(evt){
		var event = evt || window.event;
		//获取鼠标在视口的坐标,传递参数到drawPoint
		that.x1 = that.device ? event.touches[0].clientX : event.clientX;
		that.y1 = that.device ? event.touches[0].clientY : event.clientY;
		that.isMouseDown = true;
		that.drawT(that.x1,that.y1);
	},false);
	this.cas.addEventListener(that.move,function(evt){
		if (!that.isMouseDown ) {
			return false;
		}else{
			var event = evt || window.event;
			event.preventDefault();
			event.preventDefault();
			that.x2 = that.device ? event.touches[0].clientX : event.clientX;
			that.y2 = that.device ? event.touches[0].clientY : event.clientY;
			//drawPoint(context,a,b);
			that.drawT(that.x1,that.y1,that.x2,that.y2);
			//每次的结束点变成下一次划线的开始点
			that.x1 = that.x2;
			that.y1 = that.y2;
		}
	},false);
	this.cas.addEventListener(that.loosen,function(){
	var c = 0;
	var a = that.context.getImageData(0,0,that._w,that._h);
		console.log(a);
	for (var j = 0; j < that._h; j++) {
		for (var i = 0; i < that._w; i++) {
			var f = ((that._w*j)+i)*4+3;
			if (a.data[f] === 0) {	
				c++;
			}
		}
	}
	var percent = c/(that._w*that._h)*100;
	console.log(Math.round(percent));
	that.isMouseDown = false;
	console.log( that.transpercent );
	console.log(percent);
	//调用同名的全局函数
	that.callback.call(null,percent);
	//当透明面积超过用户指定的透明面积
	if( percent > that.transpercent){
		that.clearRect();
	}		
	},false);
}