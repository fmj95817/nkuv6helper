# nkuv6helper
remove useless extra ipv6 stateless addresses given by the stupid routers.

so that you can access ipv6 net with the correct ipv6 address.

#Options:
  --rmPre   prefix to remove  [string]

  --pre     prefix to preserve and prefix of address to add  [string]


  --loc     your location, to determine prefixs if not assigned  [string]

  --suf     suffix of address to add,default is eui64  [string]

  --dev     device to perform automatic address modification  [required , string] 

  --detect  perform a address detection  [boolean]

  --help    Show help  [boolean]


run **"node index.js --dev"** to see valid devices. device is required for address modefication, to avoid unwanted behavior.

**location supported:**

**2zl,zl,13s**

if you want support for new location please post an issue with your location and usable prefix. prefix can be detect with **"--detect"** option.

address detection will take **more than 2 hours**, with heavy CPU usage. working on this to optimize CPU and time required.

detection relies on server at **2001:250:401:44::130** port 80 running normally. If not you should modify the address in function "test" in file "platforms.js".
