'use strict';
const exec=require('child_process').exec;
const request=require('http').request;
const execSync=require('child_process').execSync;

module.exports={
	linux:{
		add:(ip,dev,callback,payload)=>{
            console.log('adding address ',ip,'on device ',dev);
            if(callback)exec('ip -6 address add '+ip+'/64 dev '+dev,(e,so,se)=>{callback(e,so,se,payload)});
            else exec('ip -6 address add '+ip+'/64 dev '+dev);
        },
        rm:(ip,dev,callback,payload)=>{
            console.log('delete address ',ip,'on device ',dev);
            if(callback)exec('ip -6 address del '+ip+'/64 dev '+dev,(e,so,se)=>{callback(e,so,se,payload)});
            else exec('ip -6 address del '+ip+'/64 dev '+dev);
        },
        test:(callback,payload)=>{
            request({
                host:'2001:250:401:44::130',
                family:6,
                localAddress:payload.ip,
                agent:false,
                timeout:50
            },()=>{
                console.log('ip usable',payload.ip)
                callback(payload,true);
            }).on('error',()=>{
                console.log('ip unusable',payload.ip)
                callback(payload,false);
            }).setTimeout(50).end();
        }
    },
    win32:{
        add:(ip,dev,callback,payload)=>{
            console.log('adding address ',ip,'on device ',dev);
            if(callback)exec('powershell new-netipaddress  '+ip+' -InterfaceAlias '+dev,(e,so,se)=>{callback(e,so,se,payload)}).stdin.end();
            else exec('powershell new-netipaddress  '+ip+' -InterfaceAlias '+dev).stdin.end();
        },
        rm:(ip,dev,callback,payload)=>{
            console.log('delete address ',ip,'on device ',dev);
            if(callback)exec('powershell remove-netipaddress '+ip+' -InterfaceAlias '+dev+' -confirm:$false',(e,so,se)=>{callback(e,so,se,payload)}).stdin.end();
            else exec('powershell remove-netipaddress '+ip+' -InterfaceAlias '+dev+' -confirm:$false').stdin.end();
        },
        test:(callback,payload)=>{
            execSync('powershell get-netipaddress '+payload.ip);
            request({
                host:'2001:250:401:44::130',
                family:6,
                localAddress:payload.ip,
                agent:false,
                timeout:50
            },()=>{
                console.log('ip usable',payload.ip)
                callback(payload,true);
            }).on('error',()=>{
                console.log('ip unusable',payload.ip)
                callback(payload,false);
            }).setTimeout(50).end();
        }
    }
}