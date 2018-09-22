(function() {
    'use strict';

    /**
     * Dataservice factory.
     *
     * @namespace Factories
     */
    angular
        .module('iot.temperature')
        .factory('TemperatureService', TemperatureService)
    ;

    /**
     * @desc Application wide dataservice.
     * @namespace Dataservice
     * @memberOf Factories
     * @ngInject
     *
     * @returns {{
   *    getReference: Factories.Dataservice.getReference
   *  }}
     */
    function TemperatureService(dataservice) {
        return {
            setCurrentStep: setCurrentStep,
            getProgram: getProgram,
            resetAll: resetAll,
            powerControl: powerControl,
            mockTemperature: mockTemperature,
            saveProgram: saveProgram
        };

        ////////////////////

        /**
         * @name getReference
         * @desc Getter method for Firebase reference.
         * @memberOf Factories.Dataservice
         *
         * @param   {string}  [identifier]
         * @returns {Firebase}
         */
        function setCurrentStep(step) {

            var date = new Date(Date.now());
            step.startDate = date.getTime();
            step.endDate = new Date(date.getTime() + step.duration*60000).getTime();

            var firebase = dataservice.getReference('CurrentStep');

            firebase.set(step);
        }
        function clearStep() {
            var firebase = dataservice.getReference('CurrentStep');

            firebase.set([]);
        }
        function clearTemperatures() {
            var firebase = dataservice.getReference('Temperatures');

            firebase.set([]);
        }
        function resetAll() {
            clearTemperatures();
            clearStep();
        }
        function saveProgram(program) {

            var date = new Date(Date.now());
            program.timestamp = date.getTime();
            var firebase = dataservice.getReference('Programs');
            firebase.push(angular.copy(program));
        }
        function powerControl(power) {
            var date = new Date(Date.now());
            power.time = date.getTime();
            console.log('helo with', power)
            var firebase = dataservice.getReference('Power');
            firebase.set(power);
        }
        function mockTemperature(mockCurrentTemp, raise) {
            if (!mockCurrentTemp) {
                var mockCurrentTemp = 20;
            }
            var factor = 0.1;
            var direction = (raise) ? 1.1 : 0.6;
            return setInterval(function() {
                var date = new Date(Date.now());
                var timestamp  = date.getTime();
                factor = factor*direction;
                if (raise) {
                    mockCurrentTemp = mockCurrentTemp + factor;
                } else {
                    mockCurrentTemp = mockCurrentTemp - factor;
                }
                var firebase = dataservice.getReference('Temperatures');
                firebase.push({temp: mockCurrentTemp, timestamp: timestamp});
            }, 3000);
        }

        function getProgram() {
            return [{
                    name: '',
                    timestamp: null,
                    steps: [
                    ]
                }]
        }
    }
})();
