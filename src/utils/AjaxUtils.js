/**
 * Created by eladcohen on 15/01/2017.
 */
export class AjaxUtil{

    static createCors(method, url){
        let xhr = new XMLHttpRequest();
        if("withCredentials" in xhr){
            xhr.open(method, url, true);
        }else if (typeof XDomainRequest != "undefined") {
            //support for IE
            xhr = new XDomainRequest();
            xhr.open(method, url);
        }else{
            xhr = null;
        }
        return xhr;
    }

    static getData(method, url, data, responseCallback){
        let xhr = this.createCors(method, url);
        if(!xhr){
            throw "cannot make request to " + url + " not supported";
        }

        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function(){
            let text = xhr.responseText;
            let response = JSON.parse(text);
            responseCallback(response);
        };

        xhr.error = function(){
            console.log("error ")
        };

        //make the actual call
        xhr.send(JSON.stringify(data));
    }

    static loadFile(type, url){
        let loader = null;
        //create loader by the type
        switch (type){
            case "js":
                loader = document['createElement']('script');
                loader.async = true;
                loader.type = 'text/javascript';
                loader.src = url;
                break;
            case "css":
                loader = document['createElement']('link');
                loader.rel = 'stylesheet';
                loader.type = 'text/css';
                loader.href = url;
                break;
            default:
                throw "unknown type " + type;
        }
        document.getElementsByTagName("head")[0]['appendChild'](loader);
    }
}
