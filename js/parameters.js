function model() {
	this.name = "Current Model";
	this.classification = "model";
	this.description = "";
	this.author = "";
	this.baseCellGroups = new baseCellGroup();
	this.cellAliases = [];
	this.synapses = [];

}

function izhikevichParam() {
	this.className = "izhikevichParam";
	this.a = {type: "exact", value: 0.2, minValue: 0.0, maxValue: 0.0}; 		 //double
	this.b = {type: "exact", value: 0.2, minValue: 0.0, maxValue: 0.0}; 		 //double
	this.c = {type: "exact", value: -65.0, minValue: 0.0, maxValue: 0.0}; 		 //double
	this.d = {type: "exact", value: 8.0, minValue: 0.0, maxValue: 0.0}; 		 //double
	this.u = {type: "uniform", value: 0.0, minValue: -15.0, maxValue: -11.0}; 	 //double
	this.v = {type: "uniform", value: 0.0, minValue: -75.0, maxValue: -55.0}; 	 //double
	this.threshold = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
}

function ncsParam() {
	this.className = "ncsParam";
	this.threshold = {type: "exact", value: 0.2, minValue: 0.0, maxValue: 0.0}; 				  //double
	this.restingPotential = {type: "exact", value: 0.2, minValue: 0.0, maxValue: 0.0}; 			  //double
	this.calcium = {type: "exact", value: -65.0, minValue: 0.0, maxValue: 0.0}; 				  //double
	this.calciumSpikeIncrement = {type: "exact", value: 8.0, minValue: 0.0, maxValue: 0.0}; 	  //double
	this.tauCalcium = {type: "uniform", value: 0.0, minValue: -15.0, maxValue: -11.0}; 			  //double
	this.leakReversalPotential = {type: "uniform", value: 0.0, minValue: -75.0, maxValue: -55.0}; //double
	this.tauMembrane = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 				  //double
	this.rMembrane = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 				  //double
	this.spikeShape = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};			      //list of doubles
	this.channel = [];				  														  //list of parameters for channel
}

function hodgkinHuxleyParam() {
	this.className = "hodgkinHuxleyParam";
	this.threshold = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};	    //double
	this.restingPotential = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
	this.capacitance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};		//double
	this.channel = [];																//list of parameters for channel
}

function voltageGatedIonChannel() {
	this.className = "voltageGatedIonChannel";
	this.name="Voltage Gated Ion Channel";
	this.vHalf = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};			 //double
	this.r = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};				 //double
	this.activationSlope = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};	 //double
	this.deactivationSlope = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
	this.equilibriumSlope = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};  //double
	this.conductance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};		 //double
	this.reversalPotential = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
	this.mInitial = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};			 //double
}

function calciumDependantChannel() {
	this.className = "calciumDependantChannel";
	this.name="Calcium Dependant Channel";
	this.mInitial = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};			 //double
	this.reversalPotential = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
	this.backwardsRate = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};	 //double
	this.forwardScale = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};		 //double
	this.forwardExponent = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};	 //double
	this.tauScale = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};			 //double
}

function voltageGatedChannel(particles) {
	this.className = "voltageGatedChannel";
	this.name="Voltage Gated Channel";
	this.particles = particles;															//list of parameters for particles
	this.conductance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};		//double
	this.reversePotential = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
}

function voltageGatedParticle(alpha, beta) {
	this.className = "voltageGatedParticle";
	this.alpha = alpha;															//list of constants for alpha particle
	this.beta = beta;															//list of constants for beta particle
	this.power = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};	//double
	this.xInitial = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
}

function particleVariableConstants() {
	this.a = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
	this.b = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
	this.c = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
	this.d = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
	this.f = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
	this.h = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
}

function flatSynapse() {
	this.name = "flatSynapse";
	this.delay = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0};   //integer
	this.current = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
}

function ncsSynapse() {
	this.name = "ncsSynapse";
	this.utilization = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 				  //double
	this.redistribution = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 			  //double
	this.lastPrefireTime = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 			  //double
	this.lastPostfireTime = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 		  //double
	this.tauFacilitation = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 			  //double
	this.tauDepression = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 			  //double
	this.tauLtp = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 					  //double
	this.tauLtd = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 				      //double
	this.aLtpMinimum = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 				  //double
	this.aLtdMinimum = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 				  //double
	this.maxConductance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 			  //double
	this.reversalPotential = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 		  //double
	this.tauPostSynapticConductance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; //double
	this.psgWaveformDuration = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 		  //double
	this.delay = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0}; 					  //integer
}

function inputModelParameters() {

}

function reportParameters() {

}

function cell(name, type, parameters) {
	this.name = name;
	this.type = type;
	this.classification = "cell";
	this.parameters = parameters;
}

function cellGroup(name, num, modelParameters, type, geometry) {
	this.classification = "cellGroup";
	this.name = name;
	this.num = num;
	this.type = type;
	this.parameters = modelParameters;
	this.geometry = geometry;
	this.cellGroups = [];
}

function baseCellGroup(){
	this.classification = "baseCellGroup";
	this.cellGroups = [];
}

function cellAlias(name, cellGroup, cellAlias) {
	this.className = "cellAlias";
	this.name = name;
	this.cellGroup = cellGroup;
	this.cellAlias = cellAlias;
}

function synapseGroup(name, pre, post, prob, parameters) {
	this.className = "synapseGroup";
	this.name = name;
	this.pre = pre;
	this.post = post;
	this.prob = prob;
	this.parameters = parameters;
}

function synapseAlias(synapseGroup, synapseAlias) {
	this.synapseGroup = synapseGroup;
	this.synapseAlias = synapseAlias;
}

function inputGroup() {

}

function report() {

}

