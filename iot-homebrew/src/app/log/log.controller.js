(function() {
  'use strict';

  /**
   * Specify controller for iot.about module.
   *
   * @namespace Controllers
   */
  angular
    .module('iot.log')
    .controller('LogController', LogController)
  ;

  /**
   * @desc      Controller implementation for /log route.
   * @namespace Log
   * @memberOf  Controllers
   * @ngInject
   *
   * @constructor
   */
  function LogController() {}
})();
