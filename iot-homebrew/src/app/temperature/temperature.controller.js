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
  function TemperatureController($scope, _temperatures, _latest, _power, _currentProgram, TemperatureService) {
    var vm = this;

    vm.temperatures = _temperatures;
    vm.latest = _latest;
    vm.power = _power;
    vm.currentProgram = _currentProgram;

      // Graph data
      vm.data = [];

    vm.selectedProgram = {};
    vm.programs = TemperatureService.getPrograms();

    vm.setCurrentProgram = function setCurrentProgram(){
      TemperatureService.setCurrentProgram(vm.selectedProgram)
    };

      // Chart configuration
      vm.chartConfig =  {

          options: {
              //This is the Main Highcharts chart config. Any Highchart options are valid here.
              //will be overriden by values specified below.
              chart: {
                  type: 'spline',
                  animation: Highcharts.svg, // don't animate in old IE
                  marginRight: 10
              },
              title: {
                  text: 'Panograafi'
              },
              xAxis: {
                  title: {text: ''}
              },
              yAxis: {
                  title: {
                      text: 'Value'
                  },
                  plotLines: [{
                      value: 0,
                      width: 1,
                      color: '#808080'
                  }]
              },
              tooltip: {
                  formatter: function () {
                      return '<b>' + this.series.name + '</b><br/>' +
                          Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                          Highcharts.numberFormat(this.y, 2);
                  }
              },
              legend: {
                  enabled: false
              },
              exporting: {
                  enabled: false
              }
          },
          series: [{
              data: vm.data
          }],
          turboTreshold: true,
          //size (optional) if left out the chart will default to size of the div or something sensible.
          //function (optional)
          func: function (chart) {
              //setup some logic for the chart
          }
      };

      // Watch for latest temp change
      $scope.$watch('vm.latest', function(valueNew, valueOld) {
          if (angular.isDefined(valueNew[0])) {
              // Push latest change into graph data
              vm.data.push(valueNew[0].temp);
          }
      }, true);
  }
})();
