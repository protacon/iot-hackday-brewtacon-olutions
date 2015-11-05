(function() {
  'use strict';

  /**
   * Initialization of iot.core module.
   *
   * @namespace Modules
   */
  angular
    .module('iot.core', [
      'ngAnimate', 'ngMaterial', 'ngSanitize',
      'ui.router',
      'firebase',
      'iot-templates',
      'blocks.exception', 'blocks.logger', 'blocks.router', 'highcharts-ng'
    ]);
})();
