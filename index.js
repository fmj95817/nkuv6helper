#!/bin/node
'use strict';
const interfaces = require('os').networkInterfaces;
const args = require('yargs')
    .options({
        rmPre:{
            describe:'prefix to remove',
            type:'string'},
        pre:{
            describe:'prefix to preserve and prefix of address to add',
            type:'string'},
        loc:{
            describe:'your location, to determine prefixs if not assigned',
            type:'string'},
        suf:{
            describe:'suffix of address to add,default is eui64',
            type:'string'},
        dev:{
            describe:'device to perform automatic address modification',
            demand: true,
            choices:Object.keys(interfaces())},
        detect:{
            describe:'perform a address detection',
            type:'boolean'

        }
    })
    .help('help')
    .argv;

const adds = require('./adds.js');
const platforms = require('./platforms.js');

function eui64_universal(mac){
    var str=mac.split(':');
    str[0]=(+('0x'+str[0])|0x2).toString(16);
    return str[0]+str[1]+':'+str[2]+'ff'+':'+'fe'+str[3]+':'+str[4]+str[5];
}

var eui64=eui64_universal;

function mk_ip(preStr,sufStr){
    var pre=preStr.split(':');
    var suf=sufStr.split(':');
    if(pre[pre.length-1]=='')prestr.pop();
    if(pre.length+suf.length==8)return pre.join(':')+':'+suf.join(':');
    return pre.join(':')+'::'+suf.join(':');
}

function subnets(pre){
    // return ['2001:250:401:3610','2001:250:401:3513','2001:250:401:3611','2001:250:401:3514','2001:250:401:3612','2001:250:401:3613','2001:250:401:3614','2001:250:401:3914'];
    var ret=Array.from({length:65536},(v,k)=>{return pre+k.toString(16)});
    var rand,tmp;
    for (var cIndex = 65535; cIndex >0; cIndex--) {//Fisher-Yate shuffle
        rand=(Math.random()*(cIndex+1))|0;//x|0 do the same thing as Math.floor(x)
        tmp=ret[cIndex];
        ret[cIndex]=ret[rand];
        ret[rand]=tmp;
    }
    return ret;
}

//inistalize routine goes here

var options={
    platform:process.platform,
    add:undefined,
    rm:undefined,
    test:undefined,
    rmPre:args.rmPre,
    pre:args.pre,
    suf:args.suf,
    dev:args.dev,
    ip:undefined
};

(function gen_option(){
    if(!platforms[options.platform]){
        console.error('unsupported platform ',options.platform);
        process.exit(1);
    }
    options.add=platforms[options.platform].add;
    options.rm=platforms[options.platform].rm;
    options.test=platforms[options.platform].test;

    if(!options.suf){
        let ips=interfaces();
        options.suf=eui64(ips[options.dev][0].mac);
    }

    if(args.loc){
        let location=adds[args.loc];
        if(location){
            if(!options.rmPre)options.rmPre=location.rmPre;
            if(!options.pre)options.pre=location.pre;
        }else{
            console.log('unknown location');
        }
    }

    if(!options.rmPre)options.rmPre='2001:250:401:';
    if(!options.pre){
        if(!args.detect){
            console.log('prefix not assigned. Do you want to detect prefix?\nrun with option \"--detect\" for a auto detection');
            process.exit(1);
        }
        let ips=interfaces();
        for(var ip of ips[options.dev])if(ip.address.search(RegExp(options.rmPre))!=-1)options.rm(ip.address,options.dev);
        process.on('beforeExit',()=>{process.nextTick(()=>{detect(options.rmPre,options.suf)})});
    }else process.on('beforeExit',()=>{setTimeout(main,500)});
})();

function detect(rmPre,suf) {
    if(!options.subnets)options.subnets=subnets(rmPre);
    if(options.pre){
        process.removeAllListeners('beforeExit');
        process.on('beforeExit',()=>{setTimeout(main,500)});
        delete options.subnets;
        main();
        return;
    }
    var pre,ip;
    for(var i=8;i>0;i--){
        // pre=options.subnets.shift();
        // ip=mk_ip(pre,suf);
        // options.add(ip,options.dev,(e,so,se,payload)=>{
        //     options.test((payload,usable)=>{
        //         if(usable)options.pre=payload.pre;
        //         else options.rm(payload.ip,options.dev);
        //     },payload)
        // },{pre:pre,ip:ip});

        if(options.subnets.length==0)return;
        pre=options.subnets.pop();
        ip=mk_ip(pre,suf);
        options.add(ip,options.dev,(e,so,se,payload)=>{
            options.test((payload,usable)=>{
                if(usable)options.pre=payload.pre;
                else options.rm(payload.ip,options.dev);
            },payload)
        },{pre:pre,ip:ip});
    }
    console.log('remaining',options.subnets.length);
}
function main(){
    if(!options.pre)return;
    var ips=interfaces();
    var usable=false;
    for(var ip of ips[options.dev]){
        if(ip.family!='IPv6')continue;
        if(ip.address.search(RegExp(options.rmPre))==-1)continue;
        if(ip.address.search(RegExp(options.pre))!=-1){
            console.log('using address ',ip.address,'on device ',options.dev);
            usable=true;
            continue;
        }
        options.rm(ip.address,options.dev);
    }
    if(!usable){
        if(!options.ip)options.ip=mk_ip(options.pre,options.suf);
        options.add(options.ip,options.dev);
    }
}