(function() {
  'use strict';

  /**
   * Specify run block for iot.about module.
   *
   * @namespace Routes
   */
  angular
    .module('iot.program')
    .run(moduleRun)
  ;

  /**
   * @desc      Run block for iot.program module.
   * @namespace Program
   * @memberOf  Routes
   * @ngInject
   *
   * @param {Providers.RouterHelper}  routerHelper
   */
  function moduleRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  /**
   * @name      getStates
   * @desc      Getter method for iot.about module route definitions.
   * @memberOf  Routes.About
   *
   * @returns {*[]}
   */
  function getStates() {
    return [
      {
        state: 'program',
        config: {
          url: '/program',
          parent: 'iot',
          title: 'Program',
          containerClass: 'program-container',
          views: {
            'content@': {
              templateUrl: '/iot/program/program.html',
              controller: 'ProgramController',
              controllerAs: 'vm'
            }
          }
        }
      }
    ];
  }
})();
