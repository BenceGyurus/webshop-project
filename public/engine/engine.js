class HTML{
    static div(id, class_Name, data){
        return `<div ${id ? `id = ${id}` : ""} ${class_Name ? `class = ${class_Name}` : ""} >${data}</div>`;
    }
    static h(id, class_Name, data, size){
        return `<h${size ? size : 1} ${id ? `id = ${id}` : ""} ${class_Name ? `class = ${class_Name}` : ""}>${data}</h${size ? size : 1}>`;
    }
    static label(id, class_Name, data, for_This){
        return `<label ${id ? `id = ${id}` : ""} ${class_Name ? `class = ${class_Name}` : ""} ${for_This ? `for = ${for_This}` : ""}>${data}</label>`;
    }
    static input(id, class_Name, value, type, click, disabled){
        return `<input ${type ? `type = ${type}` : "text"} ${id ? `id = ${id}` : ""} ${class_Name ? `class = ${class_Name}` : ""} ${value ? `value = "${value}"` : ""} ${click ? `onclick = "${click}"` : ""} ${disabled === true ? "disabled" : ""}/>`;
    }
    static li(id, class_Name, data, click){
        return `<li ${id ? `id = ${id}` : ""} ${class_Name ? `class = ${class_Name}` : ""} ${click ? `onclick = ${click}` : ""}>${data}</li>`
    }
    static ul(id, class_Name, data){
        return `<ul ${id ? `id = ${id}` : ""} ${class_Name ? `class = ${class_Name}` : ""} >${data}</ul>`
    }
    static select(id, class_Name, data){
        return `<select ${id ? `id = ${id}` : ""} ${class_Name ? `class = ${class_Name}` : ""} >${data}</select>`
    }
    static option(id, class_Name, data, value){
        return `<option ${id ? `id = ${id}` : ""} ${class_Name ? `class = ${class_Name}` : ""} ${value ? `value = ${value}` : ""}>${data}</option>`
    }
    static img(id, class_Name, src){
        return `<img ${id ? `id = "${id}"` : ""}${class_Name ? `class = "${class_Name}"` : ""} src = "${src}"><img/>`
    }
}
function element(element_Data, id){
    get_Element(id).innerHTML = element_Data;
}
function create_From_Json(){

}
function random_Id(length){
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];  
    length = length ? length : 10;
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}
function add_Value(value, id){           //to the inputs
    get_Element(id).value = value;
}

function get_Element(id){
    return document.getElementById(id)
}

function show_Element(id){
    get_Element(id).style.display = "block";
}

function hide_Element(id){
    get_Element(id).style.display = "none";
}

function get_Value(id){
    return get_Element(id).value;
}