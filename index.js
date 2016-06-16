#!/bin/node
'use strict';
const nets = require('os').networkInterfaces;
const cp = require('child_process');
const adds = require('./adds.js');


const args = require('yargs')
	.boolean(['no_check_root','no_check_admin'])
	.option('r',{
		alias:'rm_prefix',
		describe:'prefix to remove,\n if assigned , prefix must also be assigned',
		type:'string'})
	.option('p',{
		alias:'prefix',
		describe:'prefix to preserve and prefix of address to add,\n if assigned , rm_prefix must also be assigned',
		type:'string'})
	.option('l',{
		alias:'location',
		describe:'your location,\n for dicide prefix and rm_prefix automaticlly',
		type:'string'})
	.option('s',{
		alias:'suffix',
		describe:'suffix of address to add if no usable address found',
		type:'string'})
	.option('d',{
		alias:'device',
		describe:'device to perform automatic address deletion,\n will perform on all devices if not assigned',
		type:'string'})
	.help('help')
	.argv;
//check for root
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
var rm_prefix;
var prefix;
//prepare address
if(args.rm_prefix&&args.prefix){
	if(args.prefix.split(':').length!=5){
		console.err('prefix must be 64 bit and end with \':\'');
		process.exit(1);
	}
	console.log('using frefix ',args.prefix);
	rm_prefix=args.rm_prefix;
	prefix=args.prefix;
}
else if(args.location){
	rm_prefix=adds[args.location].rm_prefix;
	prefix=adds[args.location].prefix;
}else{
	rm_prefix=adds[adds.default].rm_prefix;
	prefix=adds[adds.default].prefix;
}

//initialze routine
//select whitch device to perform , or perform on all devices.


var usable=false;
var select_dev='';
if(args.device){
	select_dev=args.device;
	for(var add of devs[select_dev]){
		if(add.family!='IPv6')continue;
		if(add.address.search(RegExp(rm_prefix))==-1)continue;
		if(add.address.search(RegExp(prefix))!=-1){
			console.log('using address '+add.address);
			usable=true;
			continue;
		}
		console.log('delete address '+add.address);
		eval(process.platform+'_rm(\''+add.address+'\',\''+dev+'\')');
	}
	process.on('beforeExit',()=>{setTimeout(loop_spec,1000)});
}
else{
	var devs=nets();
	for(var dev in devs){
		for(var add of devs[dev]){
			if(add.family!='IPv6')continue;
			if(add.address.search(RegExp(rm_prefix))==-1)continue;
			if(add.address.search(RegExp(prefix))!=-1){
				console.log('using address '+add.address);
				usable=true;
				continue;
			}
			console.log('delete address '+add.address);
			if(''==select_dev)select_dev=dev;
			eval(process.platform+'_rm(\''+add.address+'\',\''+dev+'\')');
		}
	}
	process.on('beforeExit',()=>{setTimeout(loop,1000)});
}

if(usable==false){
	var address;
	
	if(''==select_dev){
		console.err('cannot find proper net deivce , please manually assign one by -d or --device');
	}
	if(args.suffix){
		if(args.suffix.split(':').length!=4){
			console.err('suffix must be 64 bit long');
			process.exit(1);
		}
		address=prefix+args.suffix;
	}
	else{
		address=prefix+eui64(nets()[select_dev][0].mac);
	}
	console.log('add address '+address);
	eval(process.platform+'_add(\''+address+'\',\''+dev+'\')');
}
var eui64=eui64_u;
function eui64_l(mac){
	let str=mac.split(':');
	return str[0]+str[1]+':'+str[2]+'ff'+':'+'fe'+str[3]+':'+str[4]+str[5];
}

function eui64_u(mac){
	let str=mac.split(':');
	str[0]=(+('0x'+str[0])|0x2).toString(16);
	return str[0]+str[1]+':'+str[2]+'ff'+':'+'fe'+str[3]+':'+str[4]+str[5];
}

/*loop functions below*/



function linux_add(ip,dev){
	cp.exec('ip -6 address add '+ip+'/64 dev '+dev);
}

function win32_add(ip,dev){
	console.log('not implemented');
	process.exit(1);
}

function linux_rm(ip,dev){
	cp.exec('ip -6 address del '+ip+'/64 dev '+dev);
}

function win32_rm(ip){
	cp.exec('powershell remove-netipaddress '+ip+' -confirm:$false');
}




function loop(){
	console.log('\x1Bc');
	var devs=nets();
	for(var dev in devs){
		for(var add of devs[dev]){
			if(add.family!='IPv6')continue;
			if(add.address.search(RegExp(rm_prefix))==-1)continue;
			if(add.address.search(RegExp(prefix))!=-1){
				console.log('using address '+add.address);
				continue;
			}
			console.log('delete address '+add.address);
			eval(process.platform+'_rm(\''+add.address+'\',\''+dev+'\')');

		}
	}

};


function loop_spec(){
	console.log('\x1Bc');
	var devs=nets();
	for(var add of devs[select_dev]){
		if(add.family!='IPv6')continue;
		if(add.address.search(RegExp(rm_prefix))==-1)continue;
		if(add.address.search(RegExp(prefix))!=-1){
			console.log('using address '+add.address);
			continue;
		}
		console.log('delete address '+add.address);
		eval(process.platform+'_rm(\''+add.address+'\',\''+select_dev+'\')');
	}
};


