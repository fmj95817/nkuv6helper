'use strict';
const exec = require('child_process').exec;
const request = require('http').request;
const execSync = require('child_process').execSync;

module.exports = {
    linux: {
        add: (ip, dev, callback) => {
            // console.log('adding address ',ip,'on device ',dev);
            if (callback) exec('ip -6 address add ' + ip + '/64 dev ' + dev, (e, so, se) => { callback(e, so, se) });
            else exec('ip -6 address add ' + ip + '/64 dev ' + dev);
        },
        rm: (ip, dev, callback) => {
            // console.log('delete address ',ip,'on device ',dev);
            if (callback) exec('ip -6 address del ' + ip + '/64 dev ' + dev, (e, so, se) => { callback(e, so, se) });
            else exec('ip -6 address del ' + ip + '/64 dev ' + dev);
        },
        test: (ip, callback) => {
            request({
                host: '2001:250:401:44::130',
                family: 6,
                localAddress: ip,
                agent: false,
                timeout: 50
            }, () => {
                // console.log('ip usable',ip)
                callback(true);
            }).on('error', () => {
                // console.log('ip unusable',ip)
                callback(false);
            }).setTimeout(50).end();
        }
    },

    macOS: {
        add: (ip, dev, callback) => {
            // console.log('adding address ',ip,'on device ',dev);
            if (callback) exec('ifconfig ' + dev + ' inet6 ' + ip + '/64 add' , (e, so, se) => { callback(e, so, se) });
            else exec('ifconfig ' + dev + ' inet6 ' + ip + '/64 add');
        },
        rm: (ip, dev, callback) => {
            // console.log('delete address ',ip,'on device ',dev);
            if (callback) exec('ifconfig ' + dev + ' inet6 ' + ip + '/64 delete', (e, so, se) => { callback(e, so, se) });
            else exec('ifconfig ' + dev + ' inet6 ' + ip + '/64 delete');
        },
        test: (ip, callback) => {
            request({
                host: '2001:250:401:44::130',
                family: 6,
                localAddress: ip,
                agent: false,
                timeout: 50
            }, () => {
                // console.log('ip usable',ip)
                callback(true);
            }).on('error', () => {
                // console.log('ip unusable',ip)
                callback(false);
            }).setTimeout(50).end();
        }
    },

    win32: {
        add: (ip, dev, callback) => {
            // console.log('adding address ',ip,'on device ',dev);
            if (callback) exec('powershell new-netipaddress  ' + ip + ' -InterfaceAlias ' + dev, (e, so, se) => { callback(e, so, se) }).stdin.end();
            else exec('powershell new-netipaddress  ' + ip + ' -InterfaceAlias ' + dev).stdin.end();
        },
        rm: (ip, dev, callback) => {
            // console.log('delete address ',ip,'on device ',dev);
            if (callback) exec('powershell remove-netipaddress ' + ip + ' -InterfaceAlias ' + dev + ' -confirm:$false', (e, so, se) => { callback(e, so, se) }).stdin.end();
            else exec('powershell remove-netipaddress ' + ip + ' -InterfaceAlias ' + dev + ' -confirm:$false').stdin.end();
        },
        test: (ip, callback) => {
            execSync('powershell get-netipaddress ' + ip);
            request({
                host: 'ipv6.tuna.tsinghua.edu.cn',
                family: 6,
                localAddress: ip,
                agent: false,
                timeout: 50
            }, () => {
                // console.log('ip usable',ip)
                callback(true);
            }).on('error', () => {
                // console.log('ip unusable',ip)
                callback(false);
            }).setTimeout(50).end();
        }
    }
}
