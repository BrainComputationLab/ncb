require.config({
  shim: {
    underscore: {
      exports: '_'
    }
  },
  paths: {
    almond: '../bower_components/almond/almond',
    angular: '../bower_components/angular/angular',
    'angular-strap': '../bower_components/angular-strap/dist/angular-strap.min',
    'angular-strap.tpl': '../bower_components/angular-strap/dist/angular-strap.tpl.min',
    'angular-ui-bootstrap-bower': '../bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls',
    mocha: '../bower_components/mocha/mocha',
    requirejs: '../bower_components/requirejs/require',
    underscore: '../bower_components/underscore/underscore',
    restangular: '../bower_components/restangular/dist/restangular',
    jssha: '../bower_components/jssha/src/sha'
  },
  packages: [

  ]
});
