(function() {
  'use strict';

  /**
   * Specify controller for iot.demo module.
   *
   * @namespace Controllers
   */
  angular
    .module('iot.temperature')
    .controller('TemperatureController', TemperatureController)
  ;

  /**
   * @desc      Controller implementation for /demo route.
   * @namespace Demo
   * @memberOf  Controllers
   * @ngInject
   *
   * @constructor
   */
  function TemperatureController(_temperatures, _latest, _power, TemperatureService) {
    var vm = this;

    vm.temperatures = _temperatures;
    vm.latest = _latest;
    vm.power = _power;
    vm.currentProgram = {};

    vm.selectedProgram = {};
    vm.programs = TemperatureService.getPrograms();

    vm.setCurrentProgram = function setCurrentProgram(){
      TemperatureService.setCurrentProgram(vm.selectedProgram)
    };

    // Chart configuration
    vm.chartConfig = {
      options: {
        chart: {
          type: 'bar'
        }
      },
      series: [{
        data: [1,2,3,4,5]
      }],
      title: {
        text: 'Hello'
      },
      loading: false
    }

  }
})();
