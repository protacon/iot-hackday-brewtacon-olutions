(function() {
  'use strict';

  /**
   * Specify controller for iot.demo module.
   *
   * @namespace Controllers
   */
  angular
    .module('iot.demo')
    .controller('DemoController', DemoController)
  ;

  /**
   * @desc      Controller implementation for /demo route.
   * @namespace Demo
   * @memberOf  Controllers
   * @ngInject
   *
   * @constructor
   */
  function DemoController(_messages) {
    var vm = this;

    vm.messages = _messages;
  }
})();
