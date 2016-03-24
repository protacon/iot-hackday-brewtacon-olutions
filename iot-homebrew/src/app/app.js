(function() {
    'use strict';

    angular
        .module('iot', [
            'ui.bootstrap',
            'iot.config',
            'iot.core',
            'iot.about',
            'iot.layout',
            'iot.demo',
            'iot.temperature',
            'highcharts-ng',
            'ngAnimate',
            'toastr'
        ])
        .filter('secondsToDateTime', [function() {
            return function(seconds) {
                return new Date(1970, 0, 1).setSeconds(seconds);
            };
        }])

})();
