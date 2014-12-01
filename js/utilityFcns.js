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

function getSynapseIndex(component, pre, post){
    for(var i=0; i<component.length; i++){
        if(component[i].pre === pre && component[i].post === post)
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

    var c2 = c||{};

    for (var i in p) {

        if (typeof p[i] === 'object') {
            c2[i] = (p[i].constructor === Array)?[]:{};
            deepCopy(p[i],c2[i]);
        }
        else
            c2[i] = p[i];
    }

  return c2;
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
