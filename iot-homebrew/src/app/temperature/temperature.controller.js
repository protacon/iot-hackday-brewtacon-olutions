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
  function TemperatureController($scope, TemperatureService, toastr, _temperatures, _latest, _power, _currentStep, _program) {
    var vm = this;

    vm.temperatures = _temperatures;
    vm.latest = _latest;
    vm.power = _power;
    vm.currentStep = _currentStep;
    vm.currentTemp = null;
    vm.power = {state: false};
    vm.temperatureTolerance = 1.5;
    vm.estimatedSecsToTarget = null;
    vm.program = _program;

      var step = {
          duration: null,
          temp: null,
          secsInReachedTargetTemp: 0,
          reachedTargetTempAt: null
      };

      // Graph data
      vm.data = [];

      vm.stepType = function (duration, secsInReachedTargetTemp) {
          var overShoot = parseFloat(duration*60) - parseFloat(secsInReachedTargetTemp);
          if (overShoot < -60*5) {
              return 'danger';
          } else if (overShoot < 0) {
              return 'success';
          } else {
              return 'info';
          }
      };

      vm.minTemp = function () {
        if (!vm.currentStep) return 0;
        return parseFloat(vm.currentStep.temp)-parseFloat(vm.temperatureTolerance);
      };
      vm.maxTemp = function () {
          if (!vm.currentStep) return 0;
          return parseFloat(vm.currentStep.temp)+parseFloat(vm.temperatureTolerance);
      };
      vm.maxTempExceeded = function () {
          return vm.currentTemp > vm.maxTemp();
      };

      vm.saveProgram = function() {
          vm.program.$save().then(function() {
              toastr.success('Program was saved');
          }).catch(function(error) {
              toastr.error('Error saving program');
          });
      };

    vm.setCurrentStep = function(i){
        if (vm.currentStep) {
            vm.currentStep.on = false;
        }
        var step = vm.program[0].steps[i];
        vm.currentStep = step;
        vm.currentStep.on = true;
        TemperatureService.setCurrentStep(angular.copy(vm.currentStep));
    };
      vm.resetCurrentStep = function () {
          vm.currentStep.on = false;
          vm.currentStep = null;
      };
      vm.resetAll = function (){
          vm.currentStep = null;
          vm.currentTemp = null;
          TemperatureService.resetAll();
          vm.program[0].name = '';
          vm.program[0].steps = [];
      };
      vm.addNewStep = function () {
          if (!vm.program[0].steps) {
              vm.program[0].steps = [];
          }
          vm.program[0].steps.push(angular.copy(step));
      };
      vm.removeStep = function (i) {
          for (var key in vm.program[0].steps) {
              if (key == i) {
                  vm.program[0].steps.splice(i, 1);
              }
          }
          if (vm.program[0].steps.length == 0) {
              vm.resetCurrentStep();
          }
      };
      vm.powerOn = function () {
        vm.power.state = true;
        TemperatureService.powerControl(angular.copy(vm.power));
        //clearInterval(vm.mockInterval);
        //vm.mockInterval = TemperatureService.mockTemperature(vm.currentTemp, true);
      };
      vm.powerOff = function (mock) {
        vm.power.state = false;
        TemperatureService.powerControl(angular.copy(vm.power));
        //clearInterval(vm.mockInterval);
        //if (mock) vm.mockInterval = TemperatureService.mockTemperature(vm.currentTemp, false);
      };

      // Chart configuration
      vm.chartConfig =  {

          options: {
              //This is the Main Highcharts chart config. Any Highchart options are valid here.
              //will be overriden by values specified below.
              chart: {
                  type: 'spline',
                  animation: Highcharts.svg, // don't animate in old IE
                  marginRight: 10,
                  backgroundColor:'transparent'
              },
              title: {
                  text: ''
              },
              xAxis: {
                  title: {text: 'Time'},
                  color: '#FFFFFF',
                  labels: {
                      style: {
                          color: '#FFFFFF'
                      },
                      formatter:function(){
                          var date = new Date(this.value);
                          var hours = date.getHours();
                          var minutes = "0" + date.getMinutes();
                          var seconds = "0" + date.getSeconds();
                          var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                          return formattedTime;
                      }
                  },
                  type: 'datetime'

              },
              yAxis: {
                  labels: {
                      style: {
                          color: '#FFFFFF'
                      }
                  },
                  title: {
                      text: 'Temp'
                  },
                  plotLines: [{
                      value: 0,
                      width: 1,
                      color: '#FFFFFF'
                  }]
              },
              tooltip: {
                  formatter: function () {
                      return this.y;
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

              var temp = valueNew[0].temp;
              var time = valueNew[0].timestamp;
              time = Math.round(time*1000);

              // Push latest change into graph data
              vm.data.push([time, temp]);
              vm.currentTemp = temp;
              var currentTargetTemp = parseFloat(vm.currentStep.temp);
              var currentTargetTolerance = parseFloat(vm.temperatureTolerance);

              if (vm.currentTemp <= (currentTargetTemp + currentTargetTolerance)
                  && vm.currentTemp >= (currentTargetTemp - currentTargetTolerance))
              {
                    if (!vm.currentStep.reachedTargetTempAt) {
                        vm.currentStep.reachedTargetTempAt = time;
                    } else {
                        if (!vm.currentStep.secsInReachedTargetTemp) {
                            vm.currentStep.secsInReachedTargetTemp = 0;
                        }
                            vm.currentStep.secsInReachedTargetTemp = Math.round((time - vm.currentStep.reachedTargetTempAt) / 1000);
                    }
              } else {
                  vm.currentStep.reachedTargetTempAt = null;
              }

              if (vm.data.length >= 2 && vm.currentStep && vm.currentTemp) {
                  var rates = 0;
                  var times = 0;

                  //Estimate secs
                  for (var i = vm.data.length-1; i >= vm.data.length-6 && i > 0; i--) {

                      var item = vm.data[i];
                      var prev = i - 1;
                      var itemPrev = vm.data[prev];


                      var temp = item[1];
                      var time = item[0];
                      var tempPrev = itemPrev[1];
                      var timePrev = itemPrev[0];

                      var diffTemp = temp - tempPrev;
                      var diffTime = time - timePrev;
                      var rate = diffTemp / (diffTime) * 1000;

                      rates = rates + rate;
                      times++;
                  }

                  var raisePerSec = rates / times;

                  var targetDiff = vm.currentStep.temp - vm.currentTemp;

                  var timeEst = targetDiff / raisePerSec;

                   vm.estimatedSecsToTarget = timeEst;
              }

          }
      }, true);

      // Watch for latest temp change
      $scope.$watch('vm.reachedTargetTempAt', function(valueNew, valueOld) {
          if (angular.isDefined(valueNew)) {
              console.log(valueNew);

              if (valueNew[0] > 0) {
                  toastr.success('Reached (approx.) target temperature');
              } else if (valueOld[0] > 0 && valueNew[0] == null) {
                  toastr.warning('Missed target temperature');
              }
          }

      }, true);
  }
})();
