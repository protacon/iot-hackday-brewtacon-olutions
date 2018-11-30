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
   * @desc      Temperature page controller
   * @namespace Demo
   * @memberOf  Controllers
   * @ngInject
   *
   * @constructor
   */
  function TemperatureController(
    $scope,
    TemperatureService,
    dataservice,
    toastr,
    _temperatures,
    _latest,
    _power,
    _currentStep,
    _program
  ) {
    var vm = this;

    var balls = document.getElementsByClassName('ball');
    var ballStates = [];

    for (var i = balls.length; i > 0; i--) {
        var size = Math.random()*200;
        ballStates[i-1] = {};
        ballStates[i-1].width = (~~size);
        ballStates[i-1].height = (~~size);
        ballStates[i-1].left = (window.innerWidth * Math.random()) - ((~~size)/2)
        ballStates[i-1].top = window.innerHeight + (Math.random()*2000);

        balls[i-1].style.width = (~~size)+'px';
        balls[i-1].style.height = (~~size)+'px';
        balls[i-1].style.top = (~~ballStates[i-1].top) + 'px';
        balls[i-1].style.left = (~~ballStates[i-1].left) + 'px';
    }

    (function tick() {      
      for (var i = balls.length; i > 0; i--) {
          ballStates[i-1].top = ballStates[i-1].top - 1;
          if (ballStates[i-1].top < (-ballStates[i-1].height)) {
            ballStates[i-1].top = window.innerHeight + (2*ballStates[i-1].height);
            ballStates[i-1].left = (window.innerWidth * Math.random()) - (ballStates[i-1].width/2)
          }
          balls[i-1].style.top = (~~ballStates[i-1].top) + 'px';
      }
      setTimeout(function(){tick()}, 66);
    })();

    dataservice.getReference('Power').on('value', function(snapshot){
        vm.power.state = snapshot.val().state;
    });

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
        if (!vm.currentStep) {
          return 0;
        }

        return parseFloat(vm.currentStep.temp)-parseFloat(vm.temperatureTolerance);
      };
      vm.maxTemp = function () {
          if (!vm.currentStep) {
            return 0;
          }

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
          TemperatureService.setCurrentStep(angular.copy(vm.currentStep));
      };

    vm.setCurrentStep = function(i){
        if (vm.currentStep) {
            vm.currentStep.on = false;
        }
        var step = vm.program[0].steps[i];
        for (var j = vm.program[0].steps.length-1; j >= 0; j--) {
            if (vm.program[0].steps[j] === step) continue;
            vm.program[0].steps[j].on = false;
        }
        vm.currentStep = step;
        vm.currentStep.on = true;
        vm.saveProgram();
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
        vm.power.override = 2;
        vm.power.state = true;
        TemperatureService.powerControl(angular.copy(vm.power));
      };
      vm.powerOff = function (mock) {
        vm.power.override = 1;
        vm.power.state = false;
        TemperatureService.powerControl(angular.copy(vm.power));
      };
      vm.powerAuto = function () {
        vm.power.override = 0;
        TemperatureService.powerControl(angular.copy(vm.power));
      };

    // Chart configuration
    vm.chartConfig = {
      // Highcharts styles are valid here
      chart: {
        renderTo: 'hc_container',
        type: 'area',
        zoomType: 'x',

        backgroundColor:'rgba(255, 255, 255, 0.0)',

        animation: Highcharts.svg, // don't animate in old IE
        marginRight: 0,
        events: {
          load: function () {

            // set up the updating of the chart each second
            var series = this.series[0];
            setInterval(function () {
              var x = (new Date()).getTime(), // current time
                y = Math.random()*100;
              series.addPoint([x, y], true, true);
            }, 2000);
          }
        }
      },

      time: {
        useUTC: false
      },

      title: {
        text: ''
      },
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
      },
      yAxis: {
        gridLineColor: '#171A21',
        LineColor: '#171A21',
        title: {
          text: 'Temperature (°C)'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        headerFormat: '<b>{series.name}</b><br/>',
        pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },

      // TODO use vm.data
      series: [{
        fillOpacity: 0.2,
        lineOpacity: 0.2,
        lineWidth: 1,
        name: 'Temps',
        data: (function () {
          // generate an array of random data
          var data = [],
            time = (new Date()).getTime(),
            i;

          for (i = -190; i <= 0; i += 1) {
            data.push({
              x: time + i * 1000,
              y: Math.random()*100 + 10
            });
          }
          return data;
        }()),
        // Coloring for different temperatures
        zones: [{
          value: 45, // under 30
          color: '#2096F3'
        }, {
          value: 75, // more than 80
          color: '#f2a100'
        }, {
          color: '#F34135' // between those 30 and 80 for example
        }],

      }],

      responsive: {
        rules: [{
          condition: {
            maxWidth: 0
          },
          chartOptions: {
            chart: {
              height: 0
            },
            subtitle: {
              text: null
            },
            navigator: {
              enabled: false
            }
          }
        }]
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
