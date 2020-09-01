<?php

class Bitrix24Entity {
    private $method;
    private $params=[];
    private $domain;
    private $access_token;
    
    public function __construct(string $method, array $params){
        $this->method = $method;
        $this->params = $params;
        $this->domain=$_REQUEST['DOMAIN'];
        $this->access_token=$_REQUEST['AUTH_ID'];
    }
    
    protected function call(){
        $queryUrl = 'https://'.$this->domain.'/rest/'.$this->method.'.json';
        $params=$this->params;
        $queryData = http_build_query(array_merge($params,array("auth"=>$this->access_token)));
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
        return $result;
    }
}