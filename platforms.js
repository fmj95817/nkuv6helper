const exec=require('child_process').exec;
module.exports={
	linux:{
		add:(ip,dev)=>{
            exec('ip -6 address add '+ip+'/64 dev '+dev,(r,so,se)=>{console.log(so)});
        },
        rm:(ip,dev)=>{
            exec('ip -6 address del '+ip+'/64 dev '+dev,(r,so,se)=>{console.log(so)});
        },
        tst:(ip,callback)=>{
            var req=require('dns').request({
                host:2001:250:401:44::130,
                family:6,
                localAddress:ip,
                agent:false
            },(res)=>{
                callback(true);
            }).on('error',(e)=>{
                callback(false);
            }).end();
        }
		},
    win32:{
        add:(ip,dev)=>{
            exec('powershell new-netipaddress  '+ip+' -InterfaceAlias '+dev,(r,so,se)=>{console.log(so)})
            .stdin.end();
        },
        rm:(ip,dev)=>{
            exec('powershell remove-netipaddress '+ip+' -confirm:$false',(r,so,se)=>{console.log(so)})
            .stdin.end();
        },
        tst:undefined
    }
}

module.exports.win32.tst=module.exports.linux.tst;