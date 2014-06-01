angular.module('ncb.model').service('ncb.model.ModelSvc', [function() {
    var service = {
        // The root node
        root: "osnap",
        // This is an array, with the first element being the root, the
        // last being the currently selected group
        hierarchy: null,
        neurons: []
    };
    return service;
}]);
