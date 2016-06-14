#!/bin/node
'use strict';
const nets = require('os').networkInterfaces;
const cp = require('child_process');



const args = require('yargs')
	.boolean(['no_check_root','no_check_admin'])
	.option('r',{
		alias:'rm_prefix',
		demand:true,
		default:'2001:250:401:',
		type:'string'})
	.option('p',{
		alias:'prefix',
		demand:true,
		default:'2001:250:401:3610:',
		type:'string'})
	.argv;

if(args.no_check_root==false&&args.no_check_admin==false){
	if(process.getuid){
		if(process.getuid()!=0){
			console.error('please run as root');
			process.exit(1);
		}
	}
	else{
		cp.exec('sfc',(r,s,e)=>{
			if(s.length<70){
				console.error('please run administritive');
				process.exit(1);
			}
		});
	}
}
function loop(){
	console.log('\x1Bc');
	var devs=nets();
	for(var dev in devs){
		for(var add of devs[dev]){
			if(add.family!='IPv6')continue;
			if(add.address.search(RegExp(args.rm_prefix))==-1)continue;
			if(add.address.search(RegExp(args.prefix))!=-1){
				console.log('using address '+add.address);
				continue;
			}
			console.log('delete address '+add.address);
			eval(process.platform+'(\''+add.address+'\',\''+dev+'\')');

		}
	}

};
process.on('beforeExit',()=>{setTimeout(loop,1000)});



function linux(ip,dev){
	cp.exec('ip -6 address del '+ip+'/64 dev '+dev);
}

function win32(ip){
	cp.exec('powershell remove-netipaddress '+ip+' -confirm:$false');
}

