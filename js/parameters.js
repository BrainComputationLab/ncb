function model() {
	this.name = "Current Model";
	this.classification = "model";
	this.description = "Description";
	this.author = "";
	this.cellGroups = new cellGroup("Home");
	this.cellAliases = [];
	this.synapses = [];

}

function izhikevichParam() {
	this.type = "Izhikevich";
	this.a = {type: "exact", value: 0.2, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.b = {type: "exact", value: 0.2, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.c = {type: "exact", value: -65.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.d = {type: "exact", value: 8.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.u = {type: "uniform", value: 0.0, minValue: -15.0, maxValue: -11.0, mean: 0.0, stddev: 0.0};
	this.v = {type: "uniform", value: 0.0, minValue: -75.0, maxValue: -55.0, mean: 0.0, stddev: 0.0};
	this.threshold = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
}

function ncsParam() {
	this.type = "NCS";
	this.threshold = {type: "exact", value: 0.2, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.restingPotential = {type: "exact", value: 0.2, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.calcium = {type: "exact", value: -65.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.calciumSpikeIncrement = {type: "exact", value: 8.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.tauCalcium = {type: "uniform", value: 0.0, minValue: -15.0, maxValue: -11.0, mean: 0.0, stddev: 0.0};
	this.leakReversalPotential = {type: "uniform", value: 0.0, minValue: -75.0, maxValue: -55.0, mean: 0.0, stddev: 0.0};
	this.tauMembrane = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.rMembrane = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
    this.leakConductance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
    this.capacitance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.spikeShape = [0.0];		      //list of doubles
	this.channel = [];				  														  //list of parameters for channel
}

function hodgkinHuxleyParam() {
	this.type = "HodgkinHuxley";
	this.threshold = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.restingPotential = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.capacitance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.channel = [];																//list of parameters for channel
}

function voltageGatedIonChannel() {
	this.className = "voltageGatedIonChannel";
	this.name="Voltage Gated Ion Channel";
	this.description = "Description";
	this.vHalf = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.r = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.activationSlope = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.deactivationSlope = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.equilibriumSlope = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.conductance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.reversalPotential = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.mInitial = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
}

function calciumDependantChannel() {
	this.className = "calciumDependantChannel";
	this.name="Calcium Dependant Channel";
	this.description = "Description";
	this.mInitial = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.reversalPotential = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.backwardsRate = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.forwardScale = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.forwardExponent = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.tauScale = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
    this.mPower = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
    this.conductance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
}

function voltageGatedChannel(particles) {
	this.className = "voltageGatedChannel";
	this.name="Voltage Gated Channel";
	this.description = "Description";
	this.particles = particles;															//list of parameters for particles
	this.conductance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.reversalPotential = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
}

function voltageGatedParticle(alpha, beta) {
	this.className = "voltageGatedParticle";
	this.alpha = alpha;															//list of constants for alpha particle
	this.beta = beta;															//list of constants for beta particle
	this.power = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.xInitial = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
    this.mPower = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
}

function particleVariableConstants() {
	this.a = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.b = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.c = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.d = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.f = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.h = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
}

function flatSynapse() {
	this.name = "flatSynapse";
	this.delay = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.current = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
}

function ncsSynapse() {
	this.name = "ncsSynapse";
	this.utilization = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.redistribution = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.lastPrefireTime = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.lastPostfireTime = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.tauFacilitation = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.tauDepression = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.tauLtp = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.tauLtd = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.aLtpMinimum = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.aLtdMinimum = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.maxConductance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.reversalPotential = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.tauPostSynapticConductance = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.psgWaveformDuration = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.delay = {type: "exact", value: 30.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
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
}

// a cell group containing other cell groups and cells used for organization
function cellGroup(name) {
	this.classification = "cellGroup";
	this.name = name;
	this.cellGroups = [];
	this.description = "Description";
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
	this.description = "Description";
}

function synapseAlias(synapseGroup, synAlias) {
	this.synapseGroup = synapseGroup;
	this.synapseAlias = synAlias;
}

function simulationInput(name){
	this.className = "simulationInput";
	this.name = name;
	this.stimulusType = "Rectangular Current";
	this.amplitude = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.start_amplitude = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.end_amplitude = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.amplitude_scale = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.amplitude_shift = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.delay = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.time_scale = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.current = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.phase = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.width = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.frequency = {type: "exact", value: 0.0, minValue: 0.0, maxValue: 0.0, mean: 0.0, stddev: 0.0};
	this.probability = 0.5;
	this.inputTargets = [];
	this.startTime = 0;
	this.endTime = 10;
}

function simulationOutput(name){
	this.className = "simulationOutput";
	this.name = name;
	this.saveAsFile = false;
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

module.exports = {
    calciumDependantChannel: calciumDependantChannel,
    cellGroup: cellGroup,
    cells: cells,
    flatSynapse: flatSynapse,
    hodgkinHuxleyParam: hodgkinHuxleyParam,
    izhikevichParam: izhikevichParam,
    model: model,
    ncsParam: ncsParam,
    ncsSynapse: ncsSynapse,
    particleVariableConstants: particleVariableConstants,
    simulationInput: simulationInput,
    simulationOutput: simulationOutput,
    synapseGroup: synapseGroup,
    voltageGatedChannel: voltageGatedChannel,
    voltageGatedIonChannel: voltageGatedIonChannel,
    voltageGatedParticle: voltageGatedParticle,
};
