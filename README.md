# nkuv6helper
remove useless extra ipv6 stateless addresses given by the stupid routers.

so that you can access ipv6 net with the correct ipv6 address.

Options:

     -r, --rm_prefix  prefix to remove,
  
                   if assigned , prefix must also be assigned  [string]
  
     -p, --prefix     prefix to preserve and prefix of address to add,
  
                   if assigned , rm_prefix must also be assigned  [string]
  
     -l, --location   your location,
  
                   for decide prefix and rm_prefix automatically  [string]
  
     -s, --suffix     suffix of address to add if no usable address found  [string]
  
     -d, --device     device to perform automatic address deletion,
  
                   will perform on all devices if not assigned  [string]
  
     --help           Show help  [boolean]
  

