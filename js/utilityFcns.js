function getIndex(source, attr, value) {
    alert(source);
	// return index if found
    for(var i=0; i<source.length; i++) {
        if(source[i][attr] === value) {
            return i;
        }
    }
    // return -1 if not found
    return -1;
}

function getCellIndex(component, value){
	for(var i=0; i<component.length; i++){
		if(component[i].name === value)
            return i;
	}
    return -1;
}

function getParamIndex(params, value){
    for(var i=0; i<params.length; i++){
        if(params[i].name === value)
            return i;
    }
    return -1;
}

function deepCopy(p,c) {
 
    var c = c||{}; 

    for (var i in p) {  

        if (typeof p[i] === 'object') {     
            c[i] = (p[i].constructor === Array)?[]:{};     
            deepCopy(p[i],c[i]);   
        } 
        else 
            c[i] = p[i];
    } 

  return c; 
} 

function cloneParam(source) {
  var ret = null;
  var i = 0;
    if(source.className === "izhikevichParam") {
        ret = new izhikevichParam();
        clone(ret, source);
        return ret;
    }
    else if(source.className === "ncsParam") {
        ret = new ncsParam();
        clone(ret, source);
        for(i=0; i<source.channel.length; i++) {
            ret.channel[i] = cloneChan(source.channel[i]);
        }
        return ret;
    }
    else if(source.className === "hodgkinHuxleyParam") {
        ret = new hodgkinHuxleyParam();
        clone(ret, source);
        for(i=0; i<source.channel.length; i++) {
            ret.channel[i] = cloneChan(source.channel[i]);
        }
        return ret;
    }
}
