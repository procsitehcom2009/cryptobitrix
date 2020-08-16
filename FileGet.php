<?php
$id=$_POST["file_id"];
$domain=$_POST["domain"];
$auth_id=$_POST["auth_id"];
$method='disk.file.get';
$queryUrl = 'https://'.$domain.'/rest/'.$method.'.json';
$params=["id"=>$id];
$queryData = http_build_query(array_merge($params,array("auth"=>$auth_id)));
$curl = curl_init();
curl_setopt_array($curl,array(
	CURLOPT_SSL_VERIFYPEER=>0,
	CURLOPT_POST=>1,
	CURLOPT_HEADER=>0,
	CURLOPT_RETURNTRANSFER=>1,
	CURLOPT_URL=>$queryUrl,
	CURLOPT_POSTFIELDS=>$queryData,
));
$result = json_decode(curl_exec($curl), true);
curl_close($curl);
$return = base64_encode(file_get_contents($result['result']['DOWNLOAD_URL']));
echo $return;
?>