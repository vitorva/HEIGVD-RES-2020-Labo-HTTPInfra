<?php
$static_app1 = getenv('STATIC_APP1');
$static_app2 = getenv('STATIC_APP2');
$dynamic_app1 = getenv('DYNAMIC_APP1');
$dynamic_app2 = getenv('DYNAMIC_APP2');
?>

<VirtualHost *:80>
	ServerName demo.res.ch
	
	<Location "/balancer-manager/">
		SetHandler balancer-manager
		Require all granted
	</Location>
	ProxyPass /balancer-manager !
	
	<Proxy "balancer://mycluster2">
    BalancerMember 'http://<?php print "$dynamic_app1"?>'
	BalancerMember 'http://<?php print "$dynamic_app2"?>'
	</Proxy>
	
	ProxyPass        "/api/professions/" "balancer://mycluster2"
	ProxyPassReverse "/api/professions/" "balancer://mycluster2"
	
	<Proxy "balancer://mycluster1/">
    BalancerMember 'http://<?php print "$static_app1"?>/'
	BalancerMember 'http://<?php print "$static_app2"?>/'
	</Proxy>
	
	ProxyPass        "/" "balancer://mycluster1/"
	ProxyPassReverse "/" "balancer://mycluster1/"
	
</VirtualHost>