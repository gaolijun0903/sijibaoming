new Vue({
	el:'#app',
	data:{
		citylocation:null,  //所在城市
		telnumInput:null,   //输入的手机号，后台接口返回后赋值
	  	msgcodeInput:null,   //输入的短信验证码
	  	imgcodeInput:null,  //输入的图形验证码
	  	imgcodeSrc:'https://market.yongche.com/activity/Webuser/getCaptcha?',   //图形验证码地址
	  	//needMsgcode:false, //是否需要短信验证码，false-不需要，true-需要，默认手机号是后台带来的信息，不需要短信验证码
	  	needImgcode:true, //是否需要图形验证码：false-不需要， true-需要 ，默认不需要图形验证码
	  	counttime:60,  //获取短信验证码倒计时
	  	isActive:true,  //获取短信验证码，是否倒计时状态，  true-不倒计时，false-倒计时状态
	  	ableToClick:true,  //获取短信验证码,按钮是否可点击，阻止连续点击
	  	isShowrule:false,  //是否展示规则
	  	showToast:false,  //吐司提示框的展示与否  false-不展示，true-展示
	  	toastMsg:'', //吐司提示信息
	  	numArr:[4,7,0,0,0,0]
	},
	computed:{
		ablegetmsgcode:function(){  //获取短信验证码按钮状态
			return (this.checkTelnum()) ? 'able' : 'disable';    //手机号不合格，按钮置灰，不可点击
		},
		ableSubmit:function(){  //提交按钮的状态  able--->红色可点击，disable-->灰色不可点击
			if(this.needImgcode){
				return (this.checkTelnum()  && this.msgcodeInput && this.imgcodeInput) ? 'able' : 'disable';
			}
			return (this.checkTelnum() && this.msgcodeInput ) ? 'able' : 'disable';
		}
	},
	mounted:function(){
		this.initData();
	},
	methods:{
		initData:function (){
	  		console.log('init')
	  		var vm = this;
	  		setTimeout(function(){
	  			vm.citylocation = '北京'
	  			
	  		},200)
		  		
	  		/*$.ajax({
	  			type:"(get)",
	  			url:"",
	  			//dataType:'jsonp',
	  			//xhrFields: {
                //    withCredentials: true
                //},
                //crossDomain: true,
                success:function(data) {
                	alert(data)
                },
                error:function(err){
                    vm.showToastFn(err.msg)
                }
	  		});*/
	  		
		},
		getImgCode:function(){//获取图片验证码
			this.imgcodeSrc =  'https://market.yongche.com/activity/Webuser/getCaptcha?t='+new Date().getTime();
			console.log(this.imgcodeSrc);
		},
		getmsgcode:function(){//获取短信验证码
			if(!this.ableToClick){//是否可点击，阻止连续点击
				return 
			}
			if(!this.checkTelnum()){
				this.showToastFn('请输入正确的手机号');
				return false;
			}
			if(this.needImgcode && !this.imgcodeInput){  //需要图形验证码,并且图形验证码为空
				this.showToastFn('请输入图形验证码');
                return false;
			}
			this.ableToClick = false;
			this.sendMsgcode();//发送短信验证码
		},
		sendMsgcode:function(){
			console.log('发送短信验证码')
			console.log(this.telnumInput)
			console.log(this.imgcodeInput)
			var vm = this;
			$.ajax({
                type:'get',
                url:'https://market.yongche.com/activity/Webuser/getCode?cellphone='+this.telnumInput+'&captcha='+this.imgcodeInput,
                dataType:'jsonp',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success:function(data) {
                    console.log(data);
                    if(data.code==401){//需要图形验证码，图形验证码展示
                        vm.needImgcode = true;
                        vm.ableToClick = true; //可以再次请求获取验证码
                    }else if(data.code == 200){ //无需图形验证码，开始短信验证码倒计时
						vm.msgcodeCountdown();
                    }else if(data.code == 429) {
                    	vm.ableToClick = true;
                        if(vm.needImgcode){
                           vm.getImgCode();
                        }
                        alert('请求次数过多,请稍后重试')
                    }else if(data.code == 400){
                        vm.showToastFn('图形验证码错误');
                        vm.ableToClick = true;
                        vm.needImgcode = true;
                        if(data.isUpdate ){
                            vm.getImgCode();
                        }
                    }else if(data.code == 449) {
                        vm.showToastFn('请求太频繁');
                        vm.ableToClick = true;
                        if(vm.needImgcode){
                            vm.getImgCode();
                        }
                    }
                },
                error:function(err){
                    vm.showToastFn(err.msg)
                }
            })
		},
		msgcodeCountdown:function(){//短信验证码发送后，倒计时
			var vm = this;
			vm.isActive = false;
            var countdown = setInterval(function(){
                if (vm.counttime <= 0) {
                	vm.counttime = 60;
                	vm.isActive = true;
                	vm.ableToClick = true;
                    clearInterval(countdown);
                    return 
                }
                vm.counttime--;
            }, 1000);
		},
		checkTelnum:function(){  //检测手机号是否合法
			if(!(/^1(3[0-9]|4[57]|5[0-35-9]|7[0135678]|8[0-9]|6[8])\d{8}$/.test(this.telnumInput))){
                return false;
            }
            return true;
		},
		showRule:function(){
			this.isShowrule = !this.isShowrule;
		},
		selectOnecity:function(){
			
		},
		submitInfo:function(){
			console.log('立即加入')
		},
		showToastFn:function(msg){
			var vm = this;
			vm.showToast = true;
     		vm.toastMsg = msg;
     		setTimeout(function(){
     			vm.showToast = false;
     		},2000)
		}
	}
})
