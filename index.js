const os=require('os');
const exec = require('child_process').exec;



function rm_address(){
	var netints=os.networkInterfaces();
	for(var dev in netints){
		for(var add of netints[dev]){
			if(add.family!='IPv6')continue;
			if(add.address.search(/2001:250:401:/)==-1)continue;
			if(add.address.search(/2001:250:401:3610/)!=-1){
				continue;
			}
			console.log('delete address'+add.address);
			eval(process.platform+'(\''+add.address+'\',\''+dev+'\')');

		}
	}
	setTimeout(rm_address,1000);
	};
rm_address();

function linux(ip,dev){
	exec('ip -6 address del '+ip+'/64 dev '+dev);
}

function win32(ip,dev){
	
}
