var esprima = require('esprima');
var random1 = require('randomstring');
var escodegen = require('escodegen');
var HashMap = require('hashmap');
var hmap = new HashMap();
//var scope = 0;

function getToken(){
    //alert("hello");
    hmap.clear();
    var doc = document.getElementById("plainjs").value;
    var parsed = esprima.parse(doc);
    console.log("Parsed Code " );
    console.log(parsed.body);
    //(parsed);
    //console.log(JSON.stringify(parsed.body));
    morphProg(parsed);
    parse_to_reOrder(parsed);
    strSplit(parsed);
    getCode(parsed);
}
function morphProg(x){
        
    x.body.forEach(function(element) {
        
        switch(element.type){
        case "VariableDeclaration": 
            morphVar(element);
            break;
        case "FunctionDeclaration": 
            morphFunc(element);
            popLocal(element.body.body);
            break;
        case "ExpressionStatement":
            if(element.expression.type === "AssignmentExpression"){
                findEle(element);
                parseExp(element.expression.right);
                instructionSub(element.expression.right); 
            }
            else if (element.expression.type === "CallExpression"){
                parseExp(element.expression);
            }
            break;
        case "ReturnStatement" :
            if(element.argument){
                parseExp(element.argument);
            }
            
        }
    }, this);
    console.log("New values inside changVal");
    console.log(x);
    //getCode(x);
}

function morphVar(e){
    var innerElem = e.declarations;
    var oldname;
    //var newname = new Array;
    innerElem.forEach(function(ele){
        if (ele.id.type === "Identifier") {
             oldname = ele.id.name;
            ele.id.name = random1.generate({
                charset: 'alphabetic',
                length: 2
            });
            if(hmap.has(oldname)){
                var arr1 = hmap.get(oldname);
                arr1.push(ele.id.name);
            }
            else {
                var newname = new Array;
                newname.push(ele.id.name);
                hmap.multi(oldname,newname);
            }
        }
       // hmap.multi(oldname,newname);
        console.log(hmap);
        if (ele.init){
            var inrEle = ele.init;
            var arr1;
            var key = hmap.keys();
            switch(inrEle.type){
                case "BinaryExpression":
                    if (hmap.has(inrEle.right.name)){
                    arr1 = hmap.get(inrEle.right.name);
                    inrEle.right.name = arr1[arr1.length-1];
                    console.log("We got it chnged here "+ inrEle.right.name);
                    }
                    parseExp(inrEle);
                    instructionSub(inrEle); 
                    break;
                case "Identifier" :
                    key.forEach( function (k) {
                    var  arr2 = hmap.get(k);
                    if (inrEle.name === k){
                        inrEle.name = arr2[arr2.length-1];
                        console.log("We got it chnged here "+ inrEle.name);
                    }

                    });
                    break;
            }
            
        }
    });
}

function morphFunc(ele){
    if (ele.id.type === "Identifier") {
        var oldn = ele.id.name;
        ele.id.name = random1.generate({
        charset: 'alphabetic',
        length: 2
       });
       if(hmap.has(oldn)){
        var arr1 = hmap.get(oldn);
        arr1.push(ele.id.name);
    }
    else {
        var newname = new Array;
        newname.push(ele.id.name);
        hmap.multi(oldn,newname);
    }
    }
    //to check if has inner vals
    if(ele.body.body != 0){morphProg(ele.body)}
    //parse_to_reOrder(ele.body)
}

function findEle(p) {
      var keys = hmap.keys();
      console.log("FindEle Keys"+ keys+"values :" + hmap.values());
      //keys.forEach(function (k){
        var exp = p.expression
        //var names = hmap.get(k);
        if (hmap.has(exp.left.name)){
            var nArray = hmap.get(exp.left.name);
            exp.left.name = nArray[nArray.length - 1];
         //console.log("We got it chnged here "+ exp.left.name);
        }
        else{
            console.log("assigning new name to:"+exp.left.name);
            var oldn1= exp.left.name;
            exp.left.name = random1.generate({
            charset: 'alphabetic',
            length: 2
           });
           var newname1 = new Array;
           newname1.push(exp.left.name);
           hmap.multi(oldn1,newname1);
        }
            /*if(hmap.has(oldn1)){
                console.log("hmap has"+ oldn1);
                var arr1 = hmap.get(oldn1);
                arr1.push(exp.left.name);
            }
            else{ 
                var newname = new Array;
                newname.push(exp.left.name);
                hmap.multi(oldn1,newname);
            }*/ 
        if (exp.right.right){
            if (hmap.has(exp.right.right.name)){
                var n = hmap.get(exp.right.right.name);
                exp.right.right.name = n[n.length-1]; 
                console.log("Right Side We got it chnged here "+ exp.right.right.name);
            }
        }
}

function parseExp (pExp) {
        var a;
    if(pExp.type === "BinaryExpression"){
        if (pExp.left.type === "BinaryExpression"){
            console.log("parseExp Inside recursive call for " );
            console.log(pExp.left.right.name);
            if (hmap.has(pExp.left.right.name)){
                a = hmap.get(pExp.left.right.name);
                pExp.left.right.name = a[a.length -1];
                console.log(" parseExp: We got it chnged here 2 "+ pExp.left.right.name);
            }
            return parseExp(pExp.left);  
        }
        else{
              if (hmap.has(pExp.left.name)){
                //console.log(pExp.left.name, hmap.get(i));
                a = hmap.get(pExp.left.name);
                pExp.left.name = a[a.length -1];
              }
              if (hmap.has(pExp.right.name)){
                //console.log(pExp.right.name, hmap.get(i));
                a = hmap.get(pExp.right.name);
                pExp.right.name = a[a.length -1];
              }
              //console.log("We got it chnged here "+ exp.left.name); 
        }
    }
    else if (pExp.type === "CallExpression") {
        console.log("Function called :"+ pExp.callee.name);
            if (hmap.has(pExp.callee.name)){
                var fname = hmap.get(pExp.callee.name);
                console.log("Array is " + fname);
                pExp.callee.name = fname[fname.length - 1];
                console.log( "Assigned: " +pExp.callee.name);
            }
    }
    else if (pExp.type === "Identifier") {
        console.log("NEW LOG FOR val"+ pExp.name);
        if (hmap.has(pExp.name)){
            console.log("ARE WE HERE FOR "+ pExp.name);
            var vName = hmap.get(pExp.name);
            console.log("YAY WE GOT "+ vName );
            pExp.name = vName[vName.length - 1];
        }
        
    }
}

function popLocal(elemList){
    //console.log(" pop got "+ elemList);
    var vals = hmap.values();
    elemList.forEach(function(s){
        if (s.type ===  "VariableDeclaration"){
            console.log(" pop got "+ s.declarations[0].id.name);
            //if(hmap.search(s.declarations[0].id.name)){
                console.log("popLocal vals"+vals);
                vals.forEach(function (v){
                    console.log("popLocal now for "+ v)
                    if( v[v.length -1] === s.declarations[0].id.name){
                        var k = hmap.search(v);
                        console.log("popLocalsee here "+k);
                        if (k){
                        var a = hmap.get(k);
                        a.pop();
                        //console.log(a)
                        }
                    }
                })  
        }
        else if (s.type === "FunctionDeclaration"){
            console.log(" pop got "+ s.id.name);
            vals.forEach(function (v){
                console.log("popLocal now for "+ v)
                if( v[v.length -1] === s.id.name){
                    var k = hmap.search(v);
                    console.log("popLocalsee here "+k);
                    if (k){
                    var a = hmap.get(k);
                    a.pop();
                    //console.log(a)
                    }
                }
            })  
        }
    })
}
function getCode(c){
    var newCode = escodegen.generate(c);
    console.log(typeof(newCode))
    console.log("Escodegen : "+ newCode);
    var code = insertFunc(newCode);
    var morph = document.getElementById("metajs");
    morph.value = code;
    console.log(hmap);
    //hmap.clear();
}

function parse_to_reOrder(x){
    var i;
    console.log("Inside parse")
    if(x.body.length > 1){
    for(i = 0 ; i<(x.body.length-1); i++){
        if(x.body[i].type == "VariableDeclaration" && x.body[i+1].type=="VariableDeclaration"
             && x.body[i+1].declarations[0].init.type=="Literal"){
            console.log(i)
            reOrder(x,i,i+1);
        }
    }
    }
}

function strSplit(x){
    var t = x.body[0];
    var convertedString = escodegen.generate(t);
    var i, splitString, original='';
    var morph = document.getElementById("metajs");
    for(i = 0;i < convertedString.length; i = i+3)
    {
    splitString = convertedString.substring(i, i+3);
    console.log(splitString);
    original = original + splitString;
    }
    console.log("original String : "+original);
   morph.value = original;
}

function reOrder(x,i,j){
            var temp = x.body[i];
            x.body[i] = x.body[j];
            x.body[j] = temp;
            console.log("switched")
            console.log(x.body);  
           // getCode(x);
}

function insertFunc(x){
var emptyFunc = "function XyZ() { \n}";
return x.split(";").join(";\n"+emptyFunc)

}

function instructionSub(x){
    var o;
    console.log("Old:")
    console.log(x.right);
    switch(x.operator) {
        case "+" : 
            console.log("hey there")
            x.operator = "-"
            if(x.right.type == "Literal"){
                o = {
                    "type":"UnaryExpression",
                    "operator" : "-",
                     "argument": {"type":"Literal","value":x.right.value,"prefix":"true"}
                };
           }
           else if(x.right.type == "Identifier") {
                o = {
                     "type":"UnaryExpression",
                    "operator" : "-",
                    "argument": {"type":"Identifier","name":x.right.name,"prefix":"true"}
                };
           } 
             break;
        case "-":
            if(x.right.type == "Literal"){
                 o = {
                "type":"UnaryExpression",
                "operator" : "+",
                 "argument": {"type":"Literal","value":x.right.value,"prefix":"true"}
                };
            }
            else if(x.right.type == "Identifier") {
                 o = {
                 "type":"UnaryExpression",
                 "operator" : "+",
                "argument": {"type":"Identifier","name":x.right.name,"prefix":"true"}
                };
            } 
             break;
        
        case "*": 
            x.operator = "/"
            if(x.right.type == "Literal"){
                o = {
                    "type":"BinaryExpression",
                    "operator":"/",
                    "left":{"type":"Literal","value":1},
                    "right":{"type":"Literal","value":x.right.value}
                }
            }
            else{
                 o = {
                    "type":"BinaryExpression",
                    "operator":"/",
                    "left":{"type":"Literal","value":1},
                    "right":{"type":"Identifier","name":x.right.name}
                   }
            }
           
           break;
        case "/":
            if(x.right.type == "Literal"){
                 x.left = {
                    "type":"BinaryExpression",
                    "operator":"*",
                    "left":{"type":"Identifier","name":"xOa"},
                    "right":{"type":"Literal","value":x.left.value}
               }
                o = {
                "type":"BinaryExpression",
                "operator":"*",
                "left":{"type":"Identifier","name":"xOa"},
                "right":{"type":"Literal","value":x.right.value}
               }
            }
            else{
                x.left = {
                "type":"BinaryExpression",
                "operator":"*",
                "left":{"type":"Identifier","name":"xOa"},
                "right":{"type":"Identifier","name":x.left.name}
            }
            o = {
                "type":"BinaryExpression",
                "operator":"*",
                "left":{"type":"Identifier","name":"xOa"},
                "right":{"type":"Identifier","name":x.right.name}
            }
            }
        break;
        case "^":
        if(x.right.type == "Literal"){
            o = {
           "type":"BinaryExpression",
           "operator":"+",
           "left":{"type":"Literal","value":x.right.value/2},
           "right":{"type":"Literal","value": (x.right.value/2)}
          }
          
       }
       else{
            o = {
            "type":"BinaryExpression",
            "operator":"+",
            "left":{"type":"Identifier","name":"("+x.right.name+"/2"},
            "right":{"type":"Identifier","name":x.right.name+"/2)"}
           }
       }
        break;
    }
    x.right = o;
    console.log("New: \n")
    console.log(x.right);
} 


document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('submit');    
    //var objSelect = document.getElementById("dropDown").option;
    if (btn) {
      btn.addEventListener('click', getToken);
      //console.log("Select");
      //console.log(objSelect);
    }
  });