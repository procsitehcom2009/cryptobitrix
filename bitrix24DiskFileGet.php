<?php

class bitrix24DiskFileGet extends Bitrix24Entity{
    
    public function __construct(int $id) {
        parent::__construct('disk.file.get',array("id"=>$id));
    }
    
    public function get(){
        $result = $this->call();
        return base64_encode(file_get_contents($result['result']['DOWNLOAD_URL']));
    }
}
