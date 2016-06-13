#!/bin/node

const nets=require('os').networkInterfaces;
const exec = require('child_process').exec;

if(process.getuid){
	if(process.getuid()!=0){
		console.log('ERR:require run as root/sudo');
		process.exit(1);
	}
}
		


function rm_address(){
	var devs=nets();
	for(var dev in devs){
		for(var add of devs[dev]){
			if(add.family!='IPv6')continue;
			if(add.address.search(/2001:250:401:/)==-1)continue;
			if(add.address.search(/2001:250:401:3610/)!=-1){
				continue;
			}
			console.log('delete address '+add.address);
			eval(process.platform+'(\''+add.address+'\',\''+dev+'\')');

		}
	}
	setTimeout(rm_address,100);
	};
rm_address();

function linux(ip,dev){
	exec('ip -6 address del '+ip+'/64 dev '+dev);
}

function win32(ip,dev){
	
}
