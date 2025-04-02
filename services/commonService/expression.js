let expressionValidation=(obj,element)=>{
    let result="";
    let keyData=Object.keys(obj);
    let expression=element.source;
    let isString="";
    let isNumber="";
    let errorflag=0;

    for (var i = 0; i < expression.length; i++) {
        var char = expression[i];
        if (/[a-zA-Z]/.test(char)) {
            var index = char.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
            let key=keyData[index];
            var replacement = obj[key]; 
            if(Number(replacement))
            {
                isNumber=1;
                result+=eval(Number(replacement))
            }else{
                isString=1;
                result+=replacement;
            }
        } else {
            if(isString==1 && char!='+'){
                errorflag=1;
                break;
            }else{
                result += char;
            }
        }
    } 
    if(errorflag==1){
        return {
            evaluateData:"",
            errorflag:errorflag
        }
    }

    if(isString==1 && isNumber==1)
    {
       errorflag = 1
    }else if(isNumber==1 )
    {
       result=eval(result);
    }else if(isString==1 )
    {
        var inputString =result;
        result= inputString.replace(/\+/g, ' ');
    }
    return {
        evaluateData:result,
        errorflag:errorflag
    }
}

module.exports=expressionValidation;
