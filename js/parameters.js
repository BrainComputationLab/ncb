function model() {
	this.name = "Current Model";
	this.classification = "model";
	this.description = "Description";
	this.author = "";
	this.cellGroups = new cellGroup("Home");
	this.cellAliases = [];
	this.synapses = [];
    this.columns = [];
}

// from stackoverflow 
// http://stackoverflow.com/questions/894860/set-a-default-parameter-value-for-a-javascript-function
function defaultFor(arg, val) {
	return typeof arg !== 'undefined' ? arg : val;
}

var InputType = Object.freeze({
	TEXT : "string",
	NUMBER : "number",
	SELECT : "select",
	NONE : "none"
});

function ParameterValue(t, v, min, max, m, std, it) {
	this.type = defaultFor(t, "exact");
	this.value = defaultFor(v, 0.0);
	this.minValue = defaultFor(min, 0.0);
	this.maxValue = defaultFor(max, 0.0);
	this.mean = defaultFor(m, 0.0);
	this.stddev = defaultFor(std, 0.0);

	//this.inputType = defaultFor(it, InputType.TEXT);
}

function izhikevichParam() {
	this.type = "Izhikevich";
	this.a = new ParameterValue();
	this.b = new ParameterValue();
	this.c = new ParameterValue();
	this.d = new ParameterValue();
	this.u = new ParameterValue();
	this.v = new ParameterValue();
	this.threshold = new ParameterValue();
}

function ncsParam() {
	this.type = "NCS";
	this.threshold = new ParameterValue();
	this.restingPotential = new ParameterValue();
	this.calcium = new ParameterValue();
	this.calciumSpikeIncrement = new ParameterValue();
	this.tauCalcium = new ParameterValue();
	this.leakReversalPotential = new ParameterValue();
	this.tauMembrane = new ParameterValue();
	this.rMembrane = new ParameterValue();
    this.leakConductance = new ParameterValue();
    this.capacitance = new ParameterValue();
	this.spikeShape = [0.0];		      //list of doubles
	this.channel = [];				  														  //list of parameters for channel
}

function hodgkinHuxleyParam() {
	this.type = "HodgkinHuxley";
	this.threshold = new ParameterValue();
	this.restingPotential = new ParameterValue();
	this.capacitance = new ParameterValue();
	this.channel = [];																//list of parameters for channel
}

function voltageGatedIonChannel() {
	this.className = "voltageGatedIonChannel";
	this.name="Voltage Gated Ion Channel";
	this.description = "Description";
	this.vHalf = new ParameterValue();
	this.r = new ParameterValue();
	this.activationSlope = new ParameterValue();
	this.deactivationSlope = new ParameterValue();
	this.equilibriumSlope = new ParameterValue();
	this.conductance = new ParameterValue();
	this.reversalPotential = new ParameterValue();
	this.mInitial = new ParameterValue();
}

function calciumDependantChannel() {
	this.className = "calciumDependantChannel";
	this.name="Calcium Dependant Channel";
	this.description = "Description";
	this.mInitial = new ParameterValue();
	this.reversalPotential = new ParameterValue();
	this.backwardsRate = new ParameterValue();
	this.forwardScale = new ParameterValue();
	this.forwardExponent = new ParameterValue();
	this.tauScale = new ParameterValue();
    this.mPower = new ParameterValue();
    this.conductance = new ParameterValue();
}

function voltageGatedChannel(particle) {
	this.className = "voltageGatedChannel";
	this.name="Voltage Gated Channel";
	this.description = "Description";
	this.particles = [particle];															//list of parameters for particles
	this.conductance = new ParameterValue();
	this.reversalPotential = new ParameterValue();
}

function voltageGatedParticle(alpha, beta) {
	this.className = "voltageGatedParticle";
	this.alpha = alpha;															//list of constants for alpha particle
	this.beta = beta;															//list of constants for beta particle
	this.power = new ParameterValue();
	this.xInitial = new ParameterValue();
    this.mPower = new ParameterValue();
}

function particleVariableConstants() {
	this.a = new ParameterValue();
	this.b = new ParameterValue();
	this.c = new ParameterValue();
	this.d = new ParameterValue();
	this.f = new ParameterValue();
	this.h = new ParameterValue();
}

var flatSynapseCount = 0;
function flatSynapse() {
	this.name = "flatSynapse-" + flatSynapseCount;
	flatSynapseCount += 1;
	this.delay = new ParameterValue();
	this.current = new ParameterValue();
	this.type = 'Flat'
}

var ncsSynapseCount = 0
function ncsSynapse() {
	this.name = "ncsSynapse-" + ncsSynapseCount;
	ncsSynapseCount += 1;
	this.utilization = new ParameterValue();
	this.redistribution = new ParameterValue();
	this.lastPrefireTime = new ParameterValue();
	this.lastPostfireTime = new ParameterValue();
	this.tauFacilitation = new ParameterValue();
	this.tauDepression = new ParameterValue();
	this.tauLtp = new ParameterValue();
	this.tauLtd = new ParameterValue();
	this.aLtpMinimum = new ParameterValue();
	this.aLtdMinimum = new ParameterValue();
	this.maxConductance = new ParameterValue();
	this.reversalPotential = new ParameterValue();
	this.tauPostSynapticConductance = new ParameterValue();
	this.psgWaveformDuration = new ParameterValue();
	this.delay = new ParameterValue();
	this.type = 'NCS'
}

function inputModelParameters() {

}

function reportParameters() {

}

// a group of similar cells
function cells(name, num, parameters, geometry) {
	this.name = name;
	this.num = num;
	this.classification = "cells";
	this.geometry = geometry || "Box";
	this.parameters = parameters;
	this.description = "Description";
    this.column = 'None';//new column('None');
}

// a cell group containing other cell groups and cells used for organization
function cellGroup(name) {
	this.classification = "cellGroup";
	this.name = name;
	this.cellGroups = [];
	this.description = "Cell Group";
}

function cellAlias(name, cellGroup, cAlias) {
	this.className = "cellAlias";
	this.name = name;
	this.cellGroup = cellGroup;
	this.cellAlias = cAlias;
}

function synapseGroup(pre, post, prePath, postPath, prob, parameters) {
	this.classification = "synapseGroup";
	this.pre = pre;
	this.post = post;
	this.prePath = prePath;
	this.postPath = postPath;
	this.prob = prob;
	this.parameters = parameters;
	this.description = parameters.name;
}

function synapseAlias(synapseGroup, synAlias) {
	this.synapseGroup = synapseGroup;
	this.synapseAlias = synAlias;
}

function inputParameters() {
	this.amplitude = new ParameterValue();
	this.starting_amplitude = new ParameterValue();
	this.ending_amplitude = new ParameterValue();
	this.amplitude_scale = new ParameterValue();
	this.amplitude_shift = new ParameterValue();
	this.delay = new ParameterValue();
	this.time_scale = new ParameterValue();
	this.current = new ParameterValue();
	this.phase = new ParameterValue();
	this.width = new ParameterValue();
	this.frequency = new ParameterValue();
	this.probability = 0.5;
	this.startTime = 0;
	this.endTime = 0;
}

function simulationInput(name, parameters) {
	this.name = name;
	this.parameters = parameters;
	this.className = "simulationInput";
	this.inputTargets = [];
	this.stimulusType = "Rectangular Current";
}

function simulationOutput(name){
	this.className = "simulationOutput";
	this.name = name;
	this.reportType = "Synaptic Current";
	this.reportTargets = [];
	this.probability = 0.5;
	this.startTime = 0;
	this.endTime = 0;
	this.numberFormat = "ascii";
    this.possibleReportType = 1;
}


function inputGroup() {

}

function report() {

}

var columnCount = 1;
function column(name, pos, w, h, d) {
    this.name = defaultFor(name, 'Column ' + columnCount);
    this.position = defaultFor(pos, { x : 0, y : 0, z : 0});
    this.width = defaultFor(w, 10);
    this.height = defaultFor(h, 10);
    this.depth = defaultFor(d, 10);

    this.classification = 'column';

    columnCount += 1;
}

module.exports = {
    calciumDependantChannel: calciumDependantChannel,
    cellGroup: cellGroup,
    cells: cells,
    column: column,
    flatSynapse: flatSynapse,
    hodgkinHuxleyParam: hodgkinHuxleyParam,
    izhikevichParam: izhikevichParam,
    model: model,
    ncsParam: ncsParam,
    ncsSynapse: ncsSynapse,
    ParameterValue: ParameterValue,
    particleVariableConstants: particleVariableConstants,
    inputParameters: inputParameters,
    simulationInput: simulationInput,
    simulationOutput: simulationOutput,
    synapseGroup: synapseGroup,
    voltageGatedChannel: voltageGatedChannel,
    voltageGatedIonChannel: voltageGatedIonChannel,
    voltageGatedParticle: voltageGatedParticle,
};
