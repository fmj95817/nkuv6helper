#!/bin/node
'use strict';
const interfaces = require('os').networkInterfaces;
const exec = require('child_process').exec;
const adds = require('./adds.js');
const platforms = require('./platforms.js');

const args = require('yargs')
    .option('rmPre',{
        describe:'prefix to remove',
        type:'string'})
    .option('pre',{
        describe:'prefix to preserve and prefix of address to add',
        type:'string'})
    .option('loc',{
        describe:'your location, to determine prefix if not assigned',
        type:'string'})
    .option('suf',{
        describe:'suffix of address to add,default is eui64',
        type:'string'})
    .option('dev',{
        describe:'device to perform automatic address modification',
        demand: true,
        type:'string'})
    .help('help')
    .argv;



var options={
    platform:process.platform,
    add:undefined,
    rm:undefined,
    tst:undefined,
    rmPre:args.rmPre,
    pre:args.pre,
    suf:args.suf,
    dev:args.dev,
    ip:undefined
};

function eui64(mac){
    var str=mac.split(':');
    str[0]=(+('0x'+str[0])|0x2).toString(16);
    return str[0]+str[1]+':'+str[2]+'ff'+':'+'fe'+str[3]+':'+str[4]+str[5];
}

function mk_ip(preStr,sufStr){
    var pre=preStr.split(':');
    var suf=sufStr.split(':');
    if(pre[pre.length-1]=='')prestr.pop();
    if(pre.length+suf.length==8)return pre.join(':')+':'+suf.join(':');
    return pre.join(':')+'::'+suf.join(':');
}

(function gen_option(){
    if(!platforms[options.platform]){
        console.error('unsupported platform ',options.platform);
        process.exit(1);
    }
    options.add=platforms[options.platform].add;
    options.rm=platforms[options.platform].rm;
    options.tst=platforms[options.platform].tst;

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

    if(!options.pre){
        console.log('auto address detection start');


    }else{
        process.on('beforeExit',()=>{setTimeout(main,1000)});
        main();
    }

})();

function main(){
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
        console.log('delete address ',ip.address,'on device ',options.dev);
        options.rm(ip.address);
    }
    if(!usable){
        if(!options.ip)options.ip=mk_ip(options.pre,options.suf);
        console.log('adding address 'options.ip,'on device ',options.dev);
        options.add(options.ip,options.dev);
    }
}

// process.on('beforeExit',()=>{setTimeout(main,1000)});