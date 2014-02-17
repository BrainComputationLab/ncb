//test models
var testChannel1 = new voltageGatedIonChannel();
var testChannel2 = new calciumDependantChannel();
var testParam = new izhikevichParam();
var testParam2 = new izhikevichParam();
var test2Param = new ncsParam(testChannel1);
var test3Param = new hodgkinHuxleyParam(testChannel2);
var a1 = new particleVariableConstants();
var b1 = new particleVariableConstants();
var testParticle = new voltageGatedParticle(a1, b1);
var testChannel3 = new voltageGatedChannel(testParticle);
var test4Param = new hodgkinHuxleyParam(testChannel3);
var myModels = [
    new modelParameters('I_Cell_1', 'Izhikevich', testParam, 'Database'),
    new modelParameters('I_Cell_2', 'Izhikevich', testParam, 'Personal'),
    new modelParameters('I_Cell_3', 'Izhikevich', testParam, 'Personal'), 
    new modelParameters('I_Cell_4', 'Izhikevich', testParam, 'Database'),
    new modelParameters('I_Cell_4', 'Izhikevich', testParam, 'Personal'),
    new modelParameters('NCS_Cell_1', 'NCS', test2Param, 'Personal'),
    new modelParameters('HH_Cell_1', 'HodgkinHuxley', test3Param, 'Database'),
    new modelParameters('HH_Cell_3_testparticles', 'HodgkinHuxley', test4Param, 'Personal'),
];


// variables needed for implementation
var inc = 0;
var pos = 0;
var value = 0;
var index1 = 0;
var indexs = [];
var breadDepth = 1;
var globalCellGroup = [];
var dynamicChanNum = 0;

angular.module('ncbApp', ['ui.bootstrap']);

//scope for models in the left menu
function myModelsList($scope) {
    //set the scope to point at myModels
    $scope.list = myModels;

    //sets the leftMenuLast model to the last model the user clicks on
    $scope.setModel = function (model){
        var result = $.grep(myModels, function(e){ return e.name == model; });
        leftMenuLast = clone(result[0]);
    };

    //when the user dblclicks or drags the model from the left menu to the right menu, it pushes the model into the cellgroup variable which represents the center menu.
    $scope.moveModel = function (model) {
        var result = $.grep(myModels, function(e){ return e.name == model; });
        var sub = [];

        // push a new cellgroup into the cellGroup variable
        if(pos == 0) {
            globalCellGroup.push({name: "tempGrp"+inc, num: 1, modelParameters: cloneModel(result[0]), geometry: "box", subGroup: sub});
        }
        else {
            var moveInto = globalCellGroup[indexs[0]];
            for(i=1; i<pos; i++) {
                if(moveInto.subGroup.length != 0 ) {
                    moveInto = moveInto.subGroup[indexs[i]];
                } 
            }
            moveInto.subGroup.push({name: 'tempGrp'+inc, num: 1, modelParameters: cloneModel(result[0]), geometry: 'box', subGroup: sub})
        }
        // increment counter to keep names unique
        inc++;

    };

    // changes color of model depending on if from personal or database
    $scope.styleModel = function(dbType) {
    if(dbType == "Personal")        
        return {
                'color': '#FFFFFF',
                'background-color': '#00568C'
        };
    else if(dbType == "Database")
        return {
                'color': '#FFFFFF',
                'background-color': '#5d6b74'
        };
    };
}

//scope for the cellgroups in the center menu
function myModelsList2($scope, $compile) {
    // show the first layer of cellgroups added
    $scope.list = globalCellGroup;
    
    // set the midMenuLast model to the last cellgroup the user clicks on in the middle menu
    $scope.setModel = function (model){
        // if user on home state
        if(pos == 0) {
            // search the array for the model the user clicked on
            var result = $.grep(globalCellGroup, function(e){ return e.name == model; });

            // clone the value in midMenuLast
            midMenuLast = clone(result[0]);

            // find the index of that value
            index1 = getIndex(globalCellGroup, "name", midMenuLast.name);

            // populate the cellgroup parameters on the right corresponding to what the user clicked on
            popCellP();
            return;
        }

        var moveInto = globalCellGroup[indexs[0]];
            for(i=1; i<pos; i++) {
                if(moveInto.subGroup.length != 0 ) {
                    moveInto = moveInto.subGroup[indexs[i]];
                } 
            }

        // search the subArray and find the name and then the index of that name
        var result = $.grep(moveInto.subGroup, function(e){ return e.name == model; });
        midMenuLast = clone(result[0]);
        index1 = getIndex(moveInto.subGroup, "name", midMenuLast.name);
        
        // populate the cellgroup parameters on the right corresponding to what the user clicked on
        popCellP();
    };
    
    // when the user double clicks on a cellgroup it should set the scope to that cellgroups subgroup.
    $scope.intoModel = function (){
        // as the user goes deeper into the subarrays then add to this counter
        pos += 1;

        // when the user double clicks push the index of what they clicked on into the index array
        indexs.push(index1);

        var moveInto = globalCellGroup[indexs[0]];
            for(i=1; i<pos; i++) {
                if(moveInto.subGroup.length != 0 ) {
                    moveInto = moveInto.subGroup[indexs[i]];
                } 
            }
        
        // add the breadcrumb of whatever the user clicked on
        var myStr = $compile('<li><a id="' + breadDepth + '" class="active" ng-click="changeBreadcrumb($event)" href="javascript:">' + midMenuLast.name + '</a></li>')($scope);
        $('#bread').append(myStr);
        breadDepth += 1;

        $scope.list = moveInto.subGroup;
    };

    // when the user clicks on home it erases the breadcrumbs and resets the scope to the home level
    $scope.breadGoHome = function (event) {
        // reset the position to the beginning
        pos = 0;

        // reset bread depth
        breadDepth = 1;

        // erase the indexs array
        indexs.length = 0;

        // erase all the breadcrumbs
        $('#bread').html('');

        // recompile the new home breadcrumb because it uses an angular click inside. This is so angular knows it is there.
        var myStr = $compile('<li><a id="bc1" class="active" ng-click="breadGoHome()" href="javascript:">Home</a></li>')($scope);

        // append the new home button to the breadcrumbs
        $('#bread').append(myStr);

        // reset the scope to home.
        $scope.list = globalCellGroup;
    };

    $scope.changeBreadcrumb = function (event) {
        var moveInto = globalCellGroup[indexs[0]];
        for(i=1; i<event.target.id; i++) {
            moveInto = moveInto.subGroup[indexs[i]];
        }

        // update breadcrumbs and pos
        breadDepth = +event.target.id + 1;
        pos = +event.target.id;

        // erase all the breadcrumbs
        $('#bread').html('');

        // recompile the new home breadcrumb because it uses an angular click inside. This is so angular knows it is there.
        var myStr = $compile('<li><a id="bc1" class="active" ng-click="breadGoHome()" href="javascript:">Home</a></li>')($scope);

        // append the new home button to the breadcrumbs
        $('#bread').append(myStr);


        var moveInto2 = globalCellGroup[indexs[0]];
        var depth = 1;

        // redraw the correct breadcrumbs
        for(var i=0; i<breadDepth-1; i++) {
            var name = moveInto2.name;
            moveInto2 = moveInto2.subGroup[indexs[i+1]]; 

            var myStr2 = $compile('<li><a id="' + depth + '"class="active" ng-click="changeBreadcrumb($event)" href="javascript:">' + name + '</a></li>')($scope);
            $('#bread').append(myStr2);
            depth += 1;
        }       

        indexs.length = breadDepth - 1;
        
        $scope.list = moveInto.subGroup;
        
    };

}

$().ready( function() {
    hideAll();
    //$('#modelP').click(popModelP);
    //$('#cellP').click(popCellP);
    $('#cellGroupCollapse').show();
    $('#paramCollapse').show();

    $.fn.editable.defaults.mode = 'popup';
});

function popCellP() {
    $('#cellGroupCollapse').show();
    popModelP();

    $('#cellGroupParams').html('');
    $("#cellGroupParams").append('<a id="n1" class="list-group-item">' + midMenuLast.name +'</a>');
    $("#cellGroupParams").append('<a id="n2" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
    $("#cellGroupParams").append('<a id="n3" class="list-group-item">' + midMenuLast.num +'</a>');
    $("#cellGroupParams").append('<a id="n4" class="list-group-item">' + midMenuLast.geometry +'</a>');
    $('#cellGroupParams a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }

                        // search the subArray and find the name and then the index of that name            
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);

                        if(this.id == "n1") { midMenuLast.name = newValue; }
                        if(this.id == "n2") { midMenuLast.modelParameters.name = newValue; }
                        if(this.id == "n3") { midMenuLast.num = newValue; }
                        if(this.id == "n4") { midMenuLast.geometry = newValue; }
                        if(pos == 0) { globalCellGroup[index0] = clone(midMenuLast); }
                        else { moveInto3.subGroup[index] = clone(midMenuLast); }
                    }
    });
}

function popModelP() {
    showParameterNames();
    var dropChoice = [{ 'value': 0, 'text': 'exact' }, { 'value': 1, 'text': 'uniform' }, { 'value': 2, 'text': 'normal' }];
    var dropChoice2 = [{ 'value': 0, 'text': 'Voltage Gated Ion Channel' }, {'value': 1, 'text': "Calcium Dependant Channel" }, {'value': 2, 'text': "Voltage Gated Channel" }];

    $('#name a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "n11") {midMenuLast.modelParameters.name = newValue}
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
    });
    $('#type2 a').editable({
        'source': dropChoice,
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.type === "Izhikevich") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a1") { swap.a.type = dropChoice[newValue].text; }
                        if(this.id == "b1") { swap.b.type = dropChoice[newValue].text; }
                        if(this.id == "c1") { swap.c.type = dropChoice[newValue].text; }
                        if(this.id == "d1") { swap.d.type = dropChoice[newValue].text; }
                        if(this.id == "u1") { swap.u.type = dropChoice[newValue].text; }
                        if(this.id == "v1") { swap.v.type = dropChoice[newValue].text; }
                        if(this.id == "t1") { swap.threshold.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "NCS") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a1") { swap.threshold.type = dropChoice[newValue].text; }
                        if(this.id == "b1") { swap.restingPotential.type = dropChoice[newValue].text; }
                        if(this.id == "c1") { swap.calcium.type = dropChoice[newValue].text; }
                        if(this.id == "d1") { swap.calciumSpikeIncrement.type = dropChoice[newValue].text; }
                        if(this.id == "e1") { swap.tauCalcium.type = dropChoice[newValue].text; }
                        if(this.id == "f1") { swap.leakReversalPotential.type = dropChoice[newValue].text; }
                        if(this.id == "g1") { swap.tauMembrane.type = dropChoice[newValue].text; }
                        if(this.id == "h1") { swap.rMembrane.type = dropChoice[newValue].text; }
                        if(this.id == "i1") { swap.spikeShape.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "HodgkinHuxley") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a1") { swap.threshold.type = dropChoice[newValue].text; }
                        if(this.id == "b1") { swap.restingPotential.type = dropChoice[newValue].text; }
                        if(this.id == "c1") { swap.capacitence.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    } 
                   }
    });
    $('#value a').editable({
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.type === "Izhikevich") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a2") { swap.a.value = newValue; }
                        if(this.id == "b2") { swap.b.value = newValue; }
                        if(this.id == "c2") { swap.c.value = newValue; }
                        if(this.id == "d2") { swap.d.value = newValue; }
                        if(this.id == "u2") { swap.u.value = newValue; }
                        if(this.id == "v2") { swap.v.value = newValue; }
                        if(this.id == "t2") { swap.threshold.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "NCS") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a2") { swap.threshold.value = newValue; }
                        if(this.id == "b2") { swap.restingPotential.value = newValue; }
                        if(this.id == "c2") { swap.calcium.value = newValue; }
                        if(this.id == "d2") { swap.calciumSpikeIncrement.value = newValue; }
                        if(this.id == "e2") { swap.tauCalcium.value = newValue; }
                        if(this.id == "f2") { swap.leakReversalPotential.value = newValue; }
                        if(this.id == "g2") { swap.tauMembrane.value = newValue; }
                        if(this.id == "h2") { swap.rMembrane.value = newValue; }
                        if(this.id == "i2") { swap.spikeShape.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "HodgkinHuxley") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a2") { swap.threshold.value = newValue; }
                        if(this.id == "b2") { swap.restingPotential.value = newValue; }
                        if(this.id == "c2") { swap.capacitence.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                   }
    });
    $('#minvalue a').editable({
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.type === "Izhikevich") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }

                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);         
                        if(this.id == "a3") { swap.a.minValue = newValue; }
                        if(this.id == "b3") { swap.b.minValue = newValue; }
                        if(this.id == "c3") { swap.c.minValue = newValue; }
                        if(this.id == "d3") { swap.d.minValue = newValue; }
                        if(this.id == "u3") { swap.u.minValue = newValue; }
                        if(this.id == "v3") { swap.v.minValue = newValue; }
                        if(this.id == "t3") { swap.threshold.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "NCS") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a3") { swap.threshold.minValue = newValue; }
                        if(this.id == "b3") { swap.restingPotential.minValue = newValue; }
                        if(this.id == "c3") { swap.calcium.minValue = newValue; }
                        if(this.id == "d3") { swap.calciumSpikeIncrement.minValue = newValue; }
                        if(this.id == "e3") { swap.tauCalcium.minValue = newValue; }
                        if(this.id == "f3") { swap.leakReversalPotential.minValue = newValue; }
                        if(this.id == "g3") { swap.tauMembrane.minValue = newValue; }
                        if(this.id == "h3") { swap.rMembrane.minValue = newValue; }
                        if(this.id == "i3") { swap.spikeShape.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "HodgkinHuxley") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a3") { swap.threshold.minValue = newValue; }
                        if(this.id == "b3") { swap.restingPotential.minValue = newValue; }
                        if(this.id == "c3") { swap.capacitence.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                   }
    });
    $('#maxvalue a').editable({
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.type === "Izhikevich") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }

                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a4") { swap.a.maxValue = newValue; }
                        if(this.id == "b4") { swap.b.maxValue = newValue; }
                        if(this.id == "c4") { swap.c.maxValue = newValue; }
                        if(this.id == "d4") { swap.d.maxValue = newValue; }
                        if(this.id == "u4") { swap.u.maxValue = newValue; }
                        if(this.id == "v4") { swap.v.maxValue = newValue; }
                        if(this.id == "t4") { swap.threshold.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "NCS") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a4") { swap.threshold.maxValue = newValue; }
                        if(this.id == "b4") { swap.restingPotential.maxValue = newValue; }
                        if(this.id == "c4") { swap.calcium.maxValue = newValue; }
                        if(this.id == "d4") { swap.calciumSpikeIncrement.maxValue = newValue; }
                        if(this.id == "e4") { swap.tauCalcium.maxValue = newValue; }
                        if(this.id == "f4") { swap.leakReversalPotential.maxValue = newValue; }
                        if(this.id == "g4") { swap.tauMembrane.maxValue = newValue; }
                        if(this.id == "h4") { swap.rMembrane.maxValue = newValue; }
                        if(this.id == "i4") { swap.spikeShape.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "HodgkinHuxley") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a4") { swap.threshold.maxValue = newValue; }
                        if(this.id == "b4") { swap.restingPotential.maxValue = newValue; }
                        if(this.id == "c4") { swap.capacitence.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                   }
    });
    $('#channeltype').editable({
        'source': dropChoice2,
        'success': function(response, newValue) {
                if (typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                else { var moveInto3 = globalCellGroup[indexs[0]]; }

                for (i = 1; i < pos; i++) {
                    if (moveInto3.subGroup.length != 0) {
                        moveInto3 = moveInto3.subGroup[indexs[i]];
                    }
                }
                var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                if (newValue == 0) { var swap = new voltageGatedIonChannel(); }
                else if (newValue == 1) { var swap = new calciumDependantChannel(); }
                else if (newValue == 2) { var swap = new voltageGatedChannel(testParticle); }

                if (pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                delete swap;
            }
    });
    $('#chantype a').editable({
        'source': dropChoice,
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.parameters.channel.name === "Voltage Gated Ion Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha1") { swap.vHalf.type = dropChoice[newValue].text; }
                        if(this.id == "chb1") { swap.r.type = dropChoice[newValue].text; }
                        if(this.id == "chc1") { swap.activationSlope.type = dropChoice[newValue].text; }
                        if(this.id == "chd1") { swap.deactivationSlope.type = dropChoice[newValue].text; }
                        if(this.id == "che1") { swap.equilibriumSlope.type = dropChoice[newValue].text; }
                        if(this.id == "chf1") { swap.conductance.type = dropChoice[newValue].text; }
                        if(this.id == "chg1") { swap.reversalPotential.type = dropChoice[newValue].text; }
                        if(this.id == "chh1") { swap.mInitial.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.parameters.channel.name === "Calcium Dependant Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha1") { swap.mInitial.type = dropChoice[newValue].text; }
                        if(this.id == "chb1") { swap.reversalPotential.type = dropChoice[newValue].text; }
                        if(this.id == "chc1") { swap.backwardsRate.type = dropChoice[newValue].text; }
                        if(this.id == "chd1") { swap.forwardScale.type = dropChoice[newValue].text; }
                        if(this.id == "che1") { swap.forwardExponent.type = dropChoice[newValue].text; }
                        if(this.id == "chf1") { swap.tauScale.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.parameters.channel.name === "Voltage Gated Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha1") { swap.conductance.type = dropChoice[newValue].text; }
                        if(this.id == "chb1") { swap.reversePotential.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
            }
    });
    $('#chanvalue a').editable({
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.parameters.channel.name === "Voltage Gated Ion Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha2") { swap.vHalf.value = newValue; }
                        if(this.id == "chb2") { swap.r.value = newValue; }
                        if(this.id == "chc2") { swap.activationSlope.value = newValue; }
                        if(this.id == "chd2") { swap.deactivationSlope.value = newValue; }
                        if(this.id == "che2") { swap.equilibriumSlope.value = newValue; }
                        if(this.id == "chf2") { swap.conductance.value = newValue; }
                        if(this.id == "chg2") { swap.reversalPotential.value = newValue; }
                        if(this.id == "chh2") { swap.mInitial.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.parameters.channel.name === "Calcium Dependant Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha2") { swap.mInitial.value = newValue; }
                        if(this.id == "chb2") { swap.reversalPotential.value = newValue; }
                        if(this.id == "chc2") { swap.backwardsRate.value = newValue; }
                        if(this.id == "chd2") { swap.forwardScale.value = newValue; }
                        if(this.id == "che2") { swap.forwardExponent.value = newValue; }
                        if(this.id == "chf2") { swap.tauScale.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.parameters.channel.name === "Voltage Gated Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha2") { swap.conductance.value = newValue; }
                        if(this.id == "chb2") { swap.reversePotential.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
            }
    });
    $('#chanminvalue a').editable({
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.parameters.channel.name === "Voltage Gated Ion Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha3") { swap.vHalf.minValue = newValue; }
                        if(this.id == "chb3") { swap.r.minValue = newValue; }
                        if(this.id == "chc3") { swap.activationSlope.minValue = newValue; }
                        if(this.id == "chd3") { swap.deactivationSlope.minValue = newValue; }
                        if(this.id == "che3") { swap.equilibriumSlope.minValue = newValue; }
                        if(this.id == "chf3") { swap.conductance.minValue = newValue; }
                        if(this.id == "chg3") { swap.reversalPotential.minValue = newValue; }
                        if(this.id == "chh3") { swap.mInitial.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.parameters.channel.name === "Calcium Dependant Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha3") { swap.mInitial.minValue = newValue; }
                        if(this.id == "chb3") { swap.reversalPotential.minValue = newValue; }
                        if(this.id == "chc3") { swap.backwardsRate.minValue = newValue; }
                        if(this.id == "chd3") { swap.forwardScale.minValue = newValue; }
                        if(this.id == "che3") { swap.forwardExponent.minValue = newValue; }
                        if(this.id == "chf3") { swap.tauScale.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.parameters.channel.name === "Voltage Gated Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha3") { swap.conductance.minValue = newValue; }
                        if(this.id == "chb3") { swap.reversePotential.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
            }
    });
    $('#chanmaxvalue a').editable({
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.parameters.channel.name === "Voltage Gated Ion Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha4") { swap.vHalf.maxValue = newValue; }
                        if(this.id == "chb4") { swap.r.maxValue = newValue; }
                        if(this.id == "chc4") { swap.activationSlope.maxValue = newValue; }
                        if(this.id == "chd4") { swap.deactivationSlope.maxValue = newValue; }
                        if(this.id == "che4") { swap.equilibriumSlope.maxValue = newValue; }
                        if(this.id == "chf4") { swap.conductance.maxValue = newValue; }
                        if(this.id == "chg4") { swap.reversalPotential.maxValue = newValue; }
                        if(this.id == "chh4") { swap.mInitial.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.parameters.channel.name === "Calcium Dependant Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha4") { swap.mInitial.maxValue = newValue; }
                        if(this.id == "chb4") { swap.reversalPotential.maxValue = newValue; }
                        if(this.id == "chc4") { swap.backwardsRate.maxValue = newValue; }
                        if(this.id == "chd4") { swap.forwardScale.maxValue = newValue; }
                        if(this.id == "che4") { swap.forwardExponent.maxValue = newValue; }
                        if(this.id == "chf4") { swap.tauScale.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.parameters.channel.name === "Voltage Gated Channel") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel);
                        if(this.id == "cha4") { swap.conductance.maxValue = newValue; }
                        if(this.id == "chb4") { swap.reversePotential.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
                        delete swap;
                    }
            }
    });
    $('#particletype a').editable({
        'source': dropChoice,
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles);
                        if(this.id == "pa1") { swap.power.type = dropChoice[newValue].text; }
                        if(this.id == "pb1") { swap.xInitial.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#particlevalue a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles);
                        if(this.id == "pa2") { swap.power.value = newValue; }
                        if(this.id == "pb2") { swap.xInitial.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#particleminvalue a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles);
                        if(this.id == "pa3") { swap.power.minValue = newValue; }
                        if(this.id == "pb3") { swap.xInitial.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#particlemaxvalue a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles);
                        if(this.id == "pa4") { swap.power.maxValue = newValue; }
                        if(this.id == "pb4") { swap.xInitial.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#constanttype a').editable({
        'source': dropChoice,
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles.alpha);
                        if(this.id == "ca1") { swap.a.type = dropChoice[newValue].text; }
                        if(this.id == "cb1") { swap.b.type = dropChoice[newValue].text; }
                        if(this.id == "cc1") { swap.c.type = dropChoice[newValue].text; }
                        if(this.id == "cd1") { swap.d.type = dropChoice[newValue].text; }
                        if(this.id == "cf1") { swap.f.type = dropChoice[newValue].text; }
                        if(this.id == "ch1") { swap.h.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles.alpha = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles.alpha = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#constantvalue a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles.alpha);
                        if(this.id == "ca2") { swap.a.value = newValue; }
                        if(this.id == "cb2") { swap.b.value = newValue; }
                        if(this.id == "cc2") { swap.c.value = newValue; }
                        if(this.id == "cd2") { swap.d.value = newValue; }
                        if(this.id == "cf2") { swap.f.value = newValue; }
                        if(this.id == "ch2") { swap.h.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles.alpha = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles.alpha = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#constantminvalue a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles.alpha);
                        if(this.id == "ca3") { swap.a.minValue = newValue; }
                        if(this.id == "cb3") { swap.b.minValue = newValue; }
                        if(this.id == "cc3") { swap.c.minValue = newValue; }
                        if(this.id == "cd3") { swap.d.minValue = newValue; }
                        if(this.id == "cf3") { swap.f.minValue = newValue; }
                        if(this.id == "ch3") { swap.h.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles.alpha = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles.alpha = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#constantmaxvalue a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles.alpha);
                        if(this.id == "ca4") { swap.a.maxValue = newValue; }
                        if(this.id == "cb4") { swap.b.maxValue = newValue; }
                        if(this.id == "cc4") { swap.c.maxValue = newValue; }
                        if(this.id == "cd4") { swap.d.maxValue = newValue; }
                        if(this.id == "cf4") { swap.f.maxValue = newValue; }
                        if(this.id == "ch4") { swap.h.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles.alpha = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles.alpha = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#constanttype2 a').editable({
        'source': dropChoice,
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles.beta);
                        if(this.id == "cba1") { swap.a.type = dropChoice[newValue].text; }
                        if(this.id == "cbb1") { swap.b.type = dropChoice[newValue].text; }
                        if(this.id == "cbc1") { swap.c.type = dropChoice[newValue].text; }
                        if(this.id == "cbd1") { swap.d.type = dropChoice[newValue].text; }
                        if(this.id == "cbf1") { swap.f.type = dropChoice[newValue].text; }
                        if(this.id == "cbh1") { swap.h.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles.beta = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles.beta = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#constantvalue2 a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles.beta);
                        if(this.id == "cba2") { swap.a.value = newValue; }
                        if(this.id == "cbb2") { swap.b.value = newValue; }
                        if(this.id == "cbc2") { swap.c.value = newValue; }
                        if(this.id == "cbd2") { swap.d.value = newValue; }
                        if(this.id == "cbf2") { swap.f.value = newValue; }
                        if(this.id == "cbh2") { swap.h.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles.beta = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles.beta = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#constantminvalue2 a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles.beta);
                        if(this.id == "cba3") { swap.a.minValue = newValue; }
                        if(this.id == "cbb3") { swap.b.minValue = newValue; }
                        if(this.id == "cbc3") { swap.c.minValue = newValue; }
                        if(this.id == "cbd3") { swap.d.minValue = newValue; }
                        if(this.id == "cbf3") { swap.f.minValue = newValue; }
                        if(this.id == "cbh3") { swap.h.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles.beta = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles.beta = $.extend(true, {}, swap); }
                        delete swap;
            }
    });
    $('#constantmaxvalue2 a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel.particles.beta);
                        if(this.id == "cba4") { swap.a.maxValue = newValue; }
                        if(this.id == "cbb4") { swap.b.maxValue = newValue; }
                        if(this.id == "cbc4") { swap.c.maxValue = newValue; }
                        if(this.id == "cbd4") { swap.d.maxValue = newValue; }
                        if(this.id == "cbf4") { swap.f.maxValue = newValue; }
                        if(this.id == "cbh4") { swap.h.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel.particles.beta = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters.channel.particles.beta = $.extend(true, {}, swap); }
                        delete swap;
            }
    });

}




function showParameterNames() {
    hideAll();

    $('#collapse2').html('');
    dynamicChanNum = 0; 

    $('#paramCollapse').show();
    $('#cellGroupCollapse').show();

    $('#parameterValues').html('');
    $('#parameterValues').append('<div id="name"></div>');
    $('#parameterValues').append('<div id="type1"></div>');
    $('#parameterValues').append('<div class="row">');
    $('#parameterValues').append('<div id="type2" class="col-lg-3"></div>');
    $('#parameterValues').append('<div id="value" class="col-lg-3"></div>');
    $('#parameterValues').append('<div id="minvalue" class="col-lg-3"></div>');
    $('#parameterValues').append('<div id="maxvalue" class="col-lg-3"></div>');
    $('#parameterValues').append('</div>');
    $('#paramval').html('');

    if(midMenuLast.modelParameters.type === "Izhikevich") {
        $('#izParam').show();
        $('#parameterValues').show();
        //$('#p1').hide();

        $("#name").append('<a id="n11" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
        $("#type1").append('<a id="n22" class="list-group-item">' + midMenuLast.modelParameters.type +'</a>');

        $("#type2").append('<a class="list-group-item"> <span style="text-decoration: underline;">Type</span></a>');
        $("#value").append('<a class="list-group-item"> <span style="text-decoration: underline;">Value</span></a>');
        $("#minvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Min</span></a>');
        $("#maxvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Max</span></a>');

        $("#type2").append('<a id="a1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.a.type +'</a>');
        $("#value").append('<a id="a2" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.a.value +'</a>');
        $("#minvalue").append('<a id="a3" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.a.minValue +'</a>');
        $("#maxvalue").append('<a id="a4" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.a.maxValue +'</a>');

        $("#type2").append('<a id="b1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.b.type +'</a>');
        $("#value").append('<a id="b2" class="list-group-item">' + midMenuLast.modelParameters.parameters.b.value +'</a>');
        $("#minvalue").append('<a id="b3" class="list-group-item">' + midMenuLast.modelParameters.parameters.b.minValue +'</a>');
        $("#maxvalue").append('<a id="b4" class="list-group-item">' + midMenuLast.modelParameters.parameters.b.maxValue +'</a>');

        $("#type2").append('<a id="c1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.c.type +'</a>');
        $("#value").append('<a id="c2" class="list-group-item">' + midMenuLast.modelParameters.parameters.c.value +'</a>');
        $("#minvalue").append('<a id="c3" class="list-group-item">' + midMenuLast.modelParameters.parameters.c.minValue +'</a>');
        $("#maxvalue").append('<a id="c4" class="list-group-item">' + midMenuLast.modelParameters.parameters.c.maxValue +'</a>');

        $("#type2").append('<a id="d1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.d.type +'</a>');
        $("#value").append('<a id="d2" class="list-group-item">' + midMenuLast.modelParameters.parameters.d.value +'</a>');
        $("#minvalue").append('<a id="d3" class="list-group-item">' + midMenuLast.modelParameters.parameters.d.minValue +'</a>');
        $("#maxvalue").append('<a id="d4" class="list-group-item">' + midMenuLast.modelParameters.parameters.d.maxValue +'</a>');

        $("#type2").append('<a id="u1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.u.type +'</a>');
        $("#value").append('<a id="u2" class="list-group-item">' + midMenuLast.modelParameters.parameters.u.value +'</a>');
        $("#minvalue").append('<a id="u3" class="list-group-item">' + midMenuLast.modelParameters.parameters.u.minValue +'</a>');
        $("#maxvalue").append('<a id="u4" class="list-group-item">' + midMenuLast.modelParameters.parameters.u.maxValue +'</a>');

        $("#type2").append('<a id="v1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.v.type +'</a>');
        $("#value").append('<a id="v2" class="list-group-item">' + midMenuLast.modelParameters.parameters.v.value +'</a>');
        $("#minvalue").append('<a id="v3" class="list-group-item">' + midMenuLast.modelParameters.parameters.v.minValue +'</a>');
        $("#maxvalue").append('<a id="v4" class="list-group-item">' + midMenuLast.modelParameters.parameters.v.maxValue +'</a>');

        $("#type2").append('<a id="t1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.threshold.type +'</a>');
        $("#value").append('<a id="t2" class="list-group-item">' + midMenuLast.modelParameters.parameters.threshold.value +'</a>');
        $("#minvalue").append('<a id="t3" class="list-group-item">' + midMenuLast.modelParameters.parameters.threshold.minValue +'</a>');
        $("#maxvalue").append('<a id="t4" class="list-group-item">' + midMenuLast.modelParameters.parameters.threshold.maxValue +'</a>');

    }
    else if(midMenuLast.modelParameters.type === "NCS") {
        $('#ncsParam').show();
        $('#parameterValues').show();
        $('#chanCollapse').show();
        $('#channelName').show();
        //$('#p1').hide();

        $("#name").append('<a id="n11" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
        $("#type1").append('<a id="n22" class="list-group-item">' + midMenuLast.modelParameters.type +'</a>');

        $("#type2").append('<a class="list-group-item"> <span style="text-decoration: underline;">Type</span></a>');
        $("#value").append('<a class="list-group-item"> <span style="text-decoration: underline;">Value</span></a>');
        $("#minvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Min</span></a>');
        $("#maxvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Max</span></a>');

        $("#type2").append('<a id="a1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.threshold.type +'</a>');
        $("#value").append('<a id="a2" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.value +'</a>');
        $("#minvalue").append('<a id="a3" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.minValue +'</a>');
        $("#maxvalue").append('<a id="a4" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.maxValue +'</a>');

        $("#type2").append('<a id="b1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.restingPotential.type +'</a>');
        $("#value").append('<a id="b2" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.value +'</a>');
        $("#minvalue").append('<a id="b3" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.minValue +'</a>');
        $("#maxvalue").append('<a id="b4" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.maxValue +'</a>');

        $("#type2").append('<a id="c1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.calcium.type +'</a>');
        $("#value").append('<a id="c2" class="list-group-item">' + midMenuLast.modelParameters.parameters.calcium.value +'</a>');
        $("#minvalue").append('<a id="c3" class="list-group-item">' + midMenuLast.modelParameters.parameters.calcium.minValue +'</a>');
        $("#maxvalue").append('<a id="c4" class="list-group-item">' + midMenuLast.modelParameters.parameters.calcium.maxValue +'</a>');

        $("#type2").append('<a id="d1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.type +'</a>');
        $("#value").append('<a id="d2" class="list-group-item">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.value +'</a>');
        $("#minvalue").append('<a id="d3" class="list-group-item">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.minValue +'</a>');
        $("#maxvalue").append('<a id="d4" class="list-group-item">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.maxValue +'</a>');

        $("#type2").append('<a id="e1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.tauCalcium.type +'</a>');
        $("#value").append('<a id="e2" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauCalcium.value +'</a>');
        $("#minvalue").append('<a id="e3" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauCalcium.minValue +'</a>');
        $("#maxvalue").append('<a id="e4" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauCalcium.maxValue +'</a>');

        $("#type2").append('<a id="f1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.leakReversalPotential.type +'</a>');
        $("#value").append('<a id="f2" class="list-group-item">' + midMenuLast.modelParameters.parameters.leakReversalPotential.value +'</a>');
        $("#minvalue").append('<a id="f3" class="list-group-item">' + midMenuLast.modelParameters.parameters.leakReversalPotential.minValue +'</a>');
        $("#maxvalue").append('<a id="f4" class="list-group-item">' + midMenuLast.modelParameters.parameters.leakReversalPotential.maxValue +'</a>');

        $("#type2").append('<a id="g1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.tauMembrane.type +'</a>');
        $("#value").append('<a id="g2" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauMembrane.value +'</a>');
        $("#minvalue").append('<a id="g3" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauMembrane.minValue +'</a>');
        $("#maxvalue").append('<a id="g4" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauMembrane.maxValue +'</a>');

        $("#type2").append('<a id="h1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.rMembrane.type +'</a>');
        $("#value").append('<a id="h2" class="list-group-item">' + midMenuLast.modelParameters.parameters.rMembrane.value +'</a>');
        $("#minvalue").append('<a id="h3" class="list-group-item">' + midMenuLast.modelParameters.parameters.rMembrane.minValue +'</a>');
        $("#maxvalue").append('<a id="h4" class="list-group-item">' + midMenuLast.modelParameters.parameters.rMembrane.maxValue +'</a>');

        $("#type2").append('<a id="i1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.spikeShape.type +'</a>');
        $("#value").append('<a id="i2" class="list-group-item">' + midMenuLast.modelParameters.parameters.spikeShape.value +'</a>');
        $("#minvalue").append('<a id="i3" class="list-group-item">' + midMenuLast.modelParameters.parameters.spikeShape.minValue +'</a>');
        $("#maxvalue").append('<a id="i4" class="list-group-item">' + midMenuLast.modelParameters.parameters.spikeShape.maxValue +'</a>');

        var num = dynamicChanNum;
        chanCollapseAdd();
        hideChanParam();

        $('#chan'+num+'Name').empty();
        $('#chan'+num+'Name').append(midMenuLast.modelParameters.parameters.channel.name);

        showChannelParams(midMenuLast);

    }
    else if(midMenuLast.modelParameters.type === "HodgkinHuxley") {
        $('#hhParam').show();
        $('#parameterValues').show();
        $('#chanCollapse').show();
        $('#channelName').show();
        $('#p1').hide();

        $("#name").append('<a id="n11" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
        $("#type1").append('<a id="n22" class="list-group-item">' + midMenuLast.modelParameters.type +'</a>');

        $("#type2").append('<a class="list-group-item"> <span style="text-decoration: underline;">Type</span></a>');
        $("#value").append('<a class="list-group-item"> <span style="text-decoration: underline;">Value</span></a>');
        $("#minvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Min</span></a>');
        $("#maxvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Max</span></a>');

        $("#type2").append('<a id="a1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.threshold.type +'</a>');
        $("#value").append('<a id="a2" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.value +'</a>');
        $("#minvalue").append('<a id="a3" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.minValue +'</a>');
        $("#maxvalue").append('<a id="a4" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.maxValue +'</a>');

        $("#type2").append('<a id="b1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.restingPotential.type +'</a>');
        $("#value").append('<a id="b2" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.value +'</a>');
        $("#minvalue").append('<a id="b3" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.minValue +'</a>');
        $("#maxvalue").append('<a id="b4" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.maxValue +'</a>');

        $("#type2").append('<a id="c1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.capacitence.type +'</a>');
        $("#value").append('<a id="c2" class="list-group-item">' + midMenuLast.modelParameters.parameters.capacitence.value +'</a>');
        $("#minvalue").append('<a id="c3" class="list-group-item">' + midMenuLast.modelParameters.parameters.capacitence.minValue +'</a>');
        $("#maxvalue").append('<a id="c4" class="list-group-item">' + midMenuLast.modelParameters.parameters.capacitence.maxValue +'</a>');

        var num = dynamicChanNum;
        chanCollapseAdd();
        hideChanParam();

        $('#chan'+num+'Name').empty();
        $('#chan'+num+'Name').append(midMenuLast.modelParameters.parameters.channel.name);

        showChannelParams(midMenuLast);
    }

}

function showChannelParams(source) {
    $('#channelValues').html('');
    $('#channelValues').show();
    $('#channelValues').append('<div class="row">');
    $('#channelValues').append('<div id="chantype" class="col-lg-3"></div>');
    $('#channelValues').append('<div id="chanvalue" class="col-lg-3"></div>');
    $('#channelValues').append('<div id="chanminvalue" class="col-lg-3"></div>');
    $('#channelValues').append('<div id="chanmaxvalue" class="col-lg-3"></div>');
    $('#channelValues').append('</div>');

    if(source.modelParameters.parameters.channel.name === "Voltage Gated Ion Channel") {
        $('#vgiChan').show();
        $("#chantype").append('<a id="cha1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.vHalf.type +'</a>');
        $("#chanvalue").append('<a id="cha2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.vHalf.value +'</a>');
        $("#chanminvalue").append('<a id="cha3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.vHalf.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="cha4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.vHalf.maxValue +'</a>');

        $("#chantype").append('<a id="chb1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.r.type +'</a>');
        $("#chanvalue").append('<a id="chb2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.r.value +'</a>');
        $("#chanminvalue").append('<a id="chb3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.r.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chb4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.r.maxValue +'</a>');

        $("#chantype").append('<a id="chc1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.activationSlope.type +'</a>');
        $("#chanvalue").append('<a id="chc2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.activationSlope.value +'</a>');
        $("#chanminvalue").append('<a id="chc3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.activationSlope.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chc4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.activationSlope.maxValue +'</a>');

        $("#chantype").append('<a id="chd1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.deactivationSlope.type +'</a>');
        $("#chanvalue").append('<a id="chd2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.deactivationSlope.value +'</a>');
        $("#chanminvalue").append('<a id="chd3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.deactivationSlope.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chd4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.deactivationSlope.maxValue +'</a>');

        $("#chantype").append('<a id="che1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.equilibriumSlope.type +'</a>');
        $("#chanvalue").append('<a id="che2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.equilibriumSlope.value +'</a>');
        $("#chanminvalue").append('<a id="che3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.equilibriumSlope.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="che4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.equilibriumSlope.maxValue +'</a>');

        $("#chantype").append('<a id="chf1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.conductance.type +'</a>');
        $("#chanvalue").append('<a id="chf2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.conductance.value +'</a>');
        $("#chanminvalue").append('<a id="chf3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.conductance.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chf4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.conductance.maxValue +'</a>');

        $("#chantype").append('<a id="chg1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.reversalPotential.type +'</a>');
        $("#chanvalue").append('<a id="chg2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.reversalPotential.value +'</a>');
        $("#chanminvalue").append('<a id="chg3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.reversalPotential.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chg4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.reversalPotential.maxValue +'</a>');

        $("#chantype").append('<a id="chh1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.mInitial.type +'</a>');
        $("#chanvalue").append('<a id="chh2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.mInitial.value +'</a>');
        $("#chanminvalue").append('<a id="chh3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.mInitial.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chh4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.mInitial.maxValue +'</a>');
    }
    else if(source.modelParameters.parameters.channel.name === "Calcium Dependant Channel") {
        $('#cdChan').show();
        $("#chantype").append('<a id="cha1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.mInitial.type +'</a>');
        $("#chanvalue").append('<a id="cha2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.mInitial.value +'</a>');
        $("#chanminvalue").append('<a id="cha3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.mInitial.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="cha4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.mInitial.maxValue +'</a>');

        $("#chantype").append('<a id="chb1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.reversalPotential.type +'</a>');
        $("#chanvalue").append('<a id="chb2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.reversalPotential.value +'</a>');
        $("#chanminvalue").append('<a id="chb3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.reversalPotential.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chb4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.reversalPotential.maxValue +'</a>');

        $("#chantype").append('<a id="chc1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.backwardsRate.type +'</a>');
        $("#chanvalue").append('<a id="chc2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.backwardsRate.value +'</a>');
        $("#chanminvalue").append('<a id="chc3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.backwardsRate.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chc4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.backwardsRate.maxValue +'</a>');

        $("#chantype").append('<a id="chd1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.forwardScale.type +'</a>');
        $("#chanvalue").append('<a id="chd2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.forwardScale.value +'</a>');
        $("#chanminvalue").append('<a id="chd3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.forwardScale.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chd4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.forwardScale.maxValue +'</a>');

        $("#chantype").append('<a id="che1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.forwardExponent.type +'</a>');
        $("#chanvalue").append('<a id="che2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.forwardExponent.value +'</a>');
        $("#chanminvalue").append('<a id="che3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.forwardExponent.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="che4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.forwardExponent.maxValue +'</a>');

        $("#chantype").append('<a id="chf1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.tauScale.type +'</a>');
        $("#chanvalue").append('<a id="chf2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.tauScale.value +'</a>');
        $("#chanminvalue").append('<a id="chf3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.tauScale.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chf4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.tauScale.maxValue +'</a>');
    }
    else if(source.modelParameters.parameters.channel.name === "Voltage Gated Channel") {
        $('#particleCollapse').show();
        $('#vgChan').show();
        $("#chantype").append('<a id="cha1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.conductance.type +'</a>');
        $("#chanvalue").append('<a id="cha2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.conductance.value +'</a>');
        $("#chanminvalue").append('<a id="cha3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.conductance.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="cha4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.conductance.maxValue +'</a>');

        $("#chantype").append('<a id="chb1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.reversePotential.type +'</a>');
        $("#chanvalue").append('<a id="chb2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.reversePotential.value +'</a>');
        $("#chanminvalue").append('<a id="chb3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.reversePotential.minValue +'</a>');
        $("#chanmaxvalue").append('<a id="chb4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.reversePotential.maxValue +'</a>');
        $('#particlesValues').show();
        $('#particleCollapse').show();
        showParticleParams(midMenuLast);
    }
}

function showParticleParams(source) {
    $('#particleValues').html('');
    $('#particleValues').show();
    $('#particleValues').append('<div class="row">');
    $('#particleValues').append('<div id="particletype" class="col-lg-3"></div>');
    $('#particleValues').append('<div id="particlevalue" class="col-lg-3"></div>');
    $('#particleValues').append('<div id="particleminvalue" class="col-lg-3"></div>');
    $('#particleValues').append('<div id="particlemaxvalue" class="col-lg-3"></div>');
    $('#particleValues').append('</div>');

    $("#particletype").append('<a id="pa1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.power.type +'</a>');
    $("#particlevalue").append('<a id="pa2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.power.value +'</a>');
    $("#particleminvalue").append('<a id="pa3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.power.minValue +'</a>');
    $("#particlemaxvalue").append('<a id="pa4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.power.maxValue +'</a>');

    $("#particletype").append('<a id="pb1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.xInitial.type +'</a>');
    $("#particlevalue").append('<a id="pb2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.xInitial.value +'</a>');
    $("#particleminvalue").append('<a id="pb3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.xInitial.minValue +'</a>');
    $("#particlemaxvalue").append('<a id="pb4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.xInitial.maxValue +'</a>');

    showParticleConstants(source);
}

function showParticleConstants(source) {
    $('#particleValues').append('<div class="row">');
    $('#particleValues').append('<div id="constanttype" class="col-lg-3"></div>');
    $('#particleValues').append('<div id="constantvalue" class="col-lg-3"></div>');
    $('#particleValues').append('<div id="constantminvalue" class="col-lg-3"></div>');
    $('#particleValues').append('<div id="constantmaxvalue" class="col-lg-3"></div>');
    $('#particleValues').append('</div>');

    $("#constanttype").append('<a id="ca1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.alpha.a.type +'</a>');
    $("#constantvalue").append('<a id="ca2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.a.value +'</a>');
    $("#constantminvalue").append('<a id="ca3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.a.minValue +'</a>');
    $("#constantmaxvalue").append('<a id="ca4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.a.maxValue +'</a>');

    $("#constanttype").append('<a id="cb1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.alpha.b.type +'</a>');
    $("#constantvalue").append('<a id="cb2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.b.value +'</a>');
    $("#constantminvalue").append('<a id="cb3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.b.minValue +'</a>');
    $("#constantmaxvalue").append('<a id="cb4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.b.maxValue +'</a>');

    $("#constanttype").append('<a id="cc1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.alpha.c.type +'</a>');
    $("#constantvalue").append('<a id="cc2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.c.value +'</a>');
    $("#constantminvalue").append('<a id="cc3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.c.minValue +'</a>');
    $("#constantmaxvalue").append('<a id="cc4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.c.maxValue +'</a>');

    $("#constanttype").append('<a id="cd1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.alpha.d.type +'</a>');
    $("#constantvalue").append('<a id="cd2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.d.value +'</a>');
    $("#constantminvalue").append('<a id="cd3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.d.minValue +'</a>');
    $("#constantmaxvalue").append('<a id="cd4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.d.maxValue +'</a>');

    $("#constanttype").append('<a id="cf1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.alpha.f.type +'</a>');
    $("#constantvalue").append('<a id="cf2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.f.value +'</a>');
    $("#constantminvalue").append('<a id="cf3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.f.minValue +'</a>');
    $("#constantmaxvalue").append('<a id="cf4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.f.maxValue +'</a>');

    $("#constanttype").append('<a id="ch1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.alpha.h.type +'</a>');
    $("#constantvalue").append('<a id="ch2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.h.value +'</a>');
    $("#constantminvalue").append('<a id="ch3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.h.minValue +'</a>');
    $("#constantmaxvalue").append('<a id="ch4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.alpha.h.maxValue +'</a>');

    $('#particleValues').append('<div class="row">');
    $('#particleValues').append('<div id="constanttype2" class="col-lg-3"></div>');
    $('#particleValues').append('<div id="constantvalue2" class="col-lg-3"></div>');
    $('#particleValues').append('<div id="constantminvalue2" class="col-lg-3"></div>');
    $('#particleValues').append('<div id="constantmaxvalue2" class="col-lg-3"></div>');
    $('#particleValues').append('</div>');

    $("#constanttype2").append('<a id="cba1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.beta.a.type +'</a>');
    $("#constantvalue2").append('<a id="cba2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.a.value +'</a>');
    $("#constantminvalue2").append('<a id="cba3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.a.minValue +'</a>');
    $("#constantmaxvalue2").append('<a id="cba4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.a.maxValue +'</a>');

    $("#constanttype2").append('<a id="cbb1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.beta.b.type +'</a>');
    $("#constantvalue2").append('<a id="cbb2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.b.value +'</a>');
    $("#constantminvalue2").append('<a id="cbb3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.b.minValue +'</a>');
    $("#constantmaxvalue2").append('<a id="cbb4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.b.maxValue +'</a>');

    $("#constanttype2").append('<a id="cbc1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.beta.c.type +'</a>');
    $("#constantvalue2").append('<a id="cbc2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.c.value +'</a>');
    $("#constantminvalue2").append('<a id="cbc3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.c.minValue +'</a>');
    $("#constantmaxvalue2").append('<a id="cbc4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.c.maxValue +'</a>');

    $("#constanttype2").append('<a id="cbd1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.beta.d.type +'</a>');
    $("#constantvalue2").append('<a id="cbd2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.d.value +'</a>');
    $("#constantminvalue2").append('<a id="cbd3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.d.minValue +'</a>');
    $("#constantmaxvalue2").append('<a id="cbd4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.d.maxValue +'</a>');

    $("#constanttype2").append('<a id="cbf1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.beta.f.type +'</a>');
    $("#constantvalue2").append('<a id="cbf2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.f.value +'</a>');
    $("#constantminvalue2").append('<a id="cbf3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.f.minValue +'</a>');
    $("#constantmaxvalue2").append('<a id="cbf4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.f.maxValue +'</a>');

    $("#constanttype2").append('<a id="cbh1" class="list-group-item" data-type="select">' + source.modelParameters.parameters.channel.particles.beta.h.type +'</a>');
    $("#constantvalue2").append('<a id="cbh2" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.h.value +'</a>');
    $("#constantminvalue2").append('<a id="cbh3" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.h.minValue +'</a>');
    $("#constantmaxvalue2").append('<a id="cbh4" class="list-group-item" data-type="number">' + source.modelParameters.parameters.channel.particles.beta.h.maxValue +'</a>');
}

function chanCollapseAdd() {
	var collapseable = '<div class="panel panel-default">\
                                    <div class="panel-heading">\
                                        <h4 class="panel-title">\
                                            <a id="chan'+dynamicChanNum+'Name" data-toggle="collapse" data-parent="#chanCollapse" href="#chan_'+dynamicChanNum+'">\
                                                \
                                            </a>\
                                        </h4>\
                                    </div>\
                                    <div id="chan_'+dynamicChanNum+'" class="panel-collapse collapse in">\
                                        <div class="row">\
                                            <div id="channels" class="col-lg-5">\
                                                <div id="vgiChan">\
                                                    <a class="list-group-item"> vHalf: </a>\
                                                    <a class="list-group-item"> r: </a>\
                                                    <a class="list-group-item"> Activation Slope: </a>\
                                                    <a class="list-group-item"> De-Activation Slope: </a>\
                                                    <a class="list-group-item"> Equilibrium Slope: </a>\
                                                    <a class="list-group-item"> Conductance: </a>\
                                                    <a class="list-group-item"> Reversal Potential: </a>\
                                                    <a class="list-group-item"> mInitial: </a>\
                                                </div>\
                                                <div id="cdChan">\
                                                    <a class="list-group-item"> mInitial: </a>\
                                                    <a class="list-group-item"> Reversal Potential: </a>\
                                                    <a class="list-group-item"> Backwards Rate: </a>\
                                                    <a class="list-group-item"> Forward Scale: </a>\
                                                    <a class="list-group-item"> Forward Exponent: </a>\
                                                    <a class="list-group-item"> Tau Scale: </a>\
                                                </div>\
                                                <div id="vgChan">\
                                                    <a class="list-group-item"> Conductance: </a>\
                                                    <a class="list-group-item"> Reverse Potential: </a>\
                                                </div>\
                                            </div>\
                                            <div id="channelValues" class="col-lg-7">\
\
                                            </div>\
                                        </div>\
                                        <div class="panel panel-default" id="particleCollapse">\
                                            <div class="panel-heading">\
                                                <h4 class="panel-title">\
                                                    <a data-toggle="collapse" data-parent="#vgChan" href="#collapse3">\
                                                        Particles \
                                                    </a>\
                                                </h4>\
                                            </div>\
                                            <div id="collapse3" class="panel-collapse collapse in">\
                                                <div class="row">\
                                                    <div id="particles" class="col-lg-5">\
                                                        <a class="list-group-item"> Power: </a>\
                                                        <a class="list-group-item"> xInitial: </a>\
                                                        <div id="alphaP">\
                                                            <a class="list-group-item"> A: </a>\
                                                            <a class="list-group-item"> B: </a>\
                                                            <a class="list-group-item"> C: </a>\
                                                            <a class="list-group-item"> D: </a>\
                                                            <a class="list-group-item"> F: </a>\
                                                            <a class="list-group-item"> H: </a>\
                                                        </div>\
                                                        <div id="betaP">\
                                                            <a class="list-group-item"> A: </a>\
                                                            <a class="list-group-item"> B: </a>\
                                                            <a class="list-group-item"> C: </a>\
                                                            <a class="list-group-item"> D: </a>\
                                                            <a class="list-group-item"> F: </a>\
                                                            <a class="list-group-item"> H: </a>\
                                                        </div>\
                                                    </div>\
                                                    <div id="particleValues" class="col-lg-7">\
\
                                                    </div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';

	$('#collapse2').append(collapseable);
	dynamicChanNum++;                               

}

function hideAll() {
    $('#cellGroupCollapse').hide();
    $('#izParam').hide();
    $('#ncsParam').hide();
    $('#hhParam').hide();
    $('#parameterValues').hide();
    $('#chanCollapse').hide();
    $('#vgiChan').hide();
    $('#cdChan').hide();
    $('#vgChan').hide();
    $('#channelValues').hide();
    $('#paramCollapse').hide();
    $('#particlesValues').hide();
    $('#particleCollapse').hide();
}

function hideChanParam() {
	$('#vgiChan').hide();
    $('#cdChan').hide();
    $('#vgChan').hide();
    $('#particlesValues').hide();
    $('#particleCollapse').hide();
}

function cloneModel(source) {
    var ret = new modelParameters();
    ret = clone(source);
    ret.parameters = cloneParam(source.parameters);
    return ret;
}

function cloneParam(source) {
    if(source.className === "izhikevichParam") {
        var ret = new izhikevichParam();
        ret = clone(source);
        return ret;
    }
    else if(source.className === "ncsParam") {
        var ret = new ncsParam();
        ret = clone(source);
        ret.channel = cloneChan(source.channel);
        return ret;
    }
    else if(source.className === "hodgkinHuxleyParam") {
        var ret = new hodgkinHuxleyParam();
        ret = clone(source);
        ret.channel = cloneChan(source.channel);
        return ret;
    }
}

function cloneChan(source) {
    if(source.className === "voltageGatedIonChannel") {
        var ret = new voltageGatedIonChannel();
        ret = clone(source);
        return ret;
    }
    else if(source.className === "calciumDependantChannel") {
        var ret = new calciumDependantChannel();
        ret = clone(source);
        return ret;
    }
    else if(source.className === "voltageGatedChannel") {
        var ret = new voltageGatedChannel();
        ret = clone(source);
        ret.particles = cloneParticles(source.particles);
        return ret;
    }
}

function cloneParticles(source) {
    var retA = new particleVariableConstants();
    retA = clone(source.alpha);
    var retB = new particleVariableConstants();
    retB = clone(source.beta);
    var ret = new voltageGatedParticle(retA, retB);
    ret.power = clone(source.power);
    ret.xInitial = clone(source.xInitial);
    return ret;
}

function clone(source) {
    var clone = {};
    for( var key in source) {
        if(source.hasOwnProperty(key)) {
            clone[key] = source[key];
        }
    }
    return clone;   
}

function getIndex(source, attr, value) {
    for(var i=0; i<source.length; i++) {
        if(source[i][attr] === value) {
            return i;
        }
    }
}