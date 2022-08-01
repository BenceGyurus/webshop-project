function ajax(method, url, callback, data){
    let req = new XMLHttpRequest();
    req.onreadystatechange = ()=>{
        if (req.status == 200 && req.readyState == 4){
            callback ? callback(req.responseText) : console.log("There is no callback function");
        }
    }
    req.open(method, url);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(data ? data : "");
}