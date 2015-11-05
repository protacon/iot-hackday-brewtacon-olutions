(function() {
    'use strict';

    angular
        .module('iot', [
            'iot.config',
            'iot.core',
            'iot.about',
            'iot.layout',
            'iot.demo',
            'iot.temperature',
            'highcharts-ng'
        ])
    ;
})();
