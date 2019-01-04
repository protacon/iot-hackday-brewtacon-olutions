(function() {
  'use strict';

  /**
   * Specify run block for iot.about module.
   *
   * @namespace Routes
   */
  angular
    .module('iot.log')
    .run(moduleRun)
  ;

  /**
   * @desc      Run block for iot.about module.
   * @namespace Log
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
        state: 'log',
        config: {
          url: '/log',
          parent: 'iot',
          title: 'Log',
          containerClass: 'log-container',
          views: {
            'content@': {
              templateUrl: '/iot/log/log.html',
              controller: 'LogController',
              controllerAs: 'vm'
            }
          }
        }
      }
    ];
  }
})();
