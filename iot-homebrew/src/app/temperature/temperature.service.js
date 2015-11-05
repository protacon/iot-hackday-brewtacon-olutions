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
     * @param   {Firebase}  Firebase
     * @param   {object}    config
     * @returns {{
   *    getReference: Factories.Dataservice.getReference
   *  }}
     */
    function TemperatureService(Firebase, config, dataservice) {
        return {
            setCurrentProgram: setCurrentProgram,
            getPrograms: getPrograms

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
        function setCurrentProgram(program) {
            var date = new Date(Date.now());
            for(var i = 0; i < program.steps.length; i++) {

                if (i == 0) {
                    program.steps[i].startDate = date.getTime();
                    program.steps[i].endDate = new Date(date.getTime() + program.steps[i].duration*60000).getTime();
                } else {
                    program.steps[i].startDate = program.steps[i-1].endDate;
                    program.steps[i].endDate = new Date(program.steps[i].startDate + program.steps[i].duration*60000).getTime();
                }
            }

            program.state = true;

            var firebase = dataservice.getReference('CurrentProgram');

            firebase.set(program);
        }

        function getPrograms() {
            return [
                {
                    name: 'otikolut',
                    id: 1,
                    steps: [
                        {
                            id: 1,
                            temp: 60,
                            duration: 2
                        },
                        {
                            id: 2,
                            temp: 75,
                            duration: 2
                        },
                        {
                            id: 3,
                            temp: 85,
                            duration: 2
                        }
                    ]
                }
            ]
        }
    }
})();
