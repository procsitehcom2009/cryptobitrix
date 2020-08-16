const crypto = cadesplugin;
class Cadescom {

    //Метод возвращает коллекцию сертификатов
    get_certs_map() {
        return new Promise(async(resolve) => {
            let Certs = await this.private_get_store();//объект сертификатов из хранилища
            let Certs_Map = await this.private_get_certs_map(Certs);//коллекция сертификатов
            resolve(Certs_Map);
        });
    }

    //Метод получает id сертификата и массив ссылок на файлы; возвращает коллекцию (название файла; подписанная строка в формате base64)
    get_signed_data(Cert_Id, Files) {
        return new Promise(async(resolve) => {
            let Certs = await this.private_get_store();//объект сертификатов из хранилища
            let Cert = await this.private_get_cert(Certs, Cert_Id);//объект сертификата выбранный по id
            let FilesBase64 = await this.private_get_files_base64(Files);//коллекция файлов в формате base64
            let SignedData = new Map();//коллекция в формате (название файла с расширение ; подписанная строка в формате base64)
            for (let FileBase64 of FilesBase64.keys()) {
                SignedData.set(FileBase64, await this.private_get_signed_data(Cert, FilesBase64.get(FileBase64)));
            }
            resolve(SignedData);
        });
    }

    //Метод для работы с хранилищем сертификатов ; возвращает объект, который содержит сертификаты) 
    private_get_store()
    {
        return new Promise(async(resolve) => {
            let Store = await crypto.CreateObjectAsync('CAdESCOM.Store');//объект хранилища
            Store.Open(crypto.CAPICOM_CURRENT_USER_STORE, crypto.CAPICOM_MY_STORE, crypto.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);
            let Certs = await Store.Certificates;//объект, содержит сертификаты
            Certs = await Certs.Find(crypto.CAPICOM_CERTIFICATE_FIND_TIME_VALID);//в объекте остаются действующие сертификаты
            Store.Close();
            resolve(Certs);
        });
    }

    //Метод получает объект действующих сертификатов ; 
    //  возвращает коллекцию (map) сертификатов в формате (key сертификата в объекте, описание сертификата)
    private_get_certs_map(Certs) {
        return new Promise(async(resolve) => {
            let Count = await Certs.Count;//количество сертификатов в объекте
            let SubjectNames = new Map();//коллекция для хранения сертификатов
            for (let i = 1; i < Count + 1; i++) {
                let Cert = await Certs.Item(i);//объект сертификата
                let SubjectName = await Cert.SubjectName;//инфомрация о сертификате
                SubjectNames.set(i, this.private_subjectname_parser(SubjectName));
            }
            resolve(SubjectNames);
        });
    }

    //Метод разбирает строку; возвращает в формате (CN=Фамилия Имя Отчество СНИЛС=11111111111 ИНН=222222222222)                    
    private_subjectname_parser(data) {
        data = data.split(',');
        return data[0] + data[8] + data[9];
    }

    //Метод получет объект сертификатов и id сертификата; возвращает объект сертификата
    private_get_cert(Certs, Cert_Id) {
        return new Promise(async(resolve) => {
            let Cert = await Certs.Item(Cert_Id);//Объект сертификата
            resolve(Cert);
        });
    }

    //Метод получает массив ссылок на файлы; возвращает данные в формате base64
    private_get_files_base64(Files) {
        return new Promise(async(resolve) => {
            let FilesBase64 = new Map();//коллекция в формате (название файла с расширение ; файл в формате base64)
            for (let i = 0; i < Files.length; i++) {
                FilesBase64.set(Files[i] , await this.private_open_files_base64(Files[i]));
            }
            resolve(FilesBase64);
        });
    }

    //Метод получает ссылку на файл; возвращает файл в формате base64
    private_open_files_base64(File) {
        return new Promise(async(resolve) => {
            let FReader = new FileReader();
            FReader.readAsDataURL(File);
            FReader.onload = function (oFREvent) {
                let header = ";base64,";
                let FileData = oFREvent.target.result;
                resolve(FileData.substr(FileData.indexOf(header) + header.length));
            }
        });
    }

    //Метод получает объект сертификата и файл в формате base64; возвращает подписанную строку в формате base64
    private_get_signed_data(Cert, FileBase64) {
        return new Promise(async(resolve) => {
            let Signer = await crypto.CreateObjectAsync("CAdESCOM.CPSigner");
            await Signer.propset_Certificate(Cert);
            //await oSigner.propset_Options(crypto.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN)
            await Signer.propset_Options(crypto.CAPICOM_CERTIFICATE_INCLUDE_END_ENTITY_ONLY)
            let SignedData = await crypto.CreateObjectAsync("CAdESCOM.CadesSignedData");
            await SignedData.propset_ContentEncoding(crypto.CADESCOM_BASE64_TO_BINARY);
            //await oSignedData.propset_Content(true ? btoa(dataToSign) : dataToSign);
            await SignedData.propset_Content(FileBase64);
            let SignedMessage = await SignedData.SignCades(Signer, crypto.CADESCOM_CADES_BES, true);
            resolve(SignedMessage);
        });
    }
}
