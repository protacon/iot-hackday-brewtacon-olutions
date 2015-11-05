(function() {
  'use strict';

  /**
   * Specify controller for iot.about module.
   *
   * @namespace Controllers
   */
  angular
    .module('iot.about')
    .controller('AboutController', AboutController)
  ;

  /**
   * @desc      Controller implementation for /about route.
   * @namespace About
   * @memberOf  Controllers
   * @ngInject
   *
   * @constructor
   */
  function AboutController() {}
})();
