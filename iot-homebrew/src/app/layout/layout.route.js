(function() {
  'use strict';

  /**
   * Specify run block for iot.layout module.
   *
   * @namespace Routes
   */
  angular
    .module('iot.layout')
    .run(moduleRun)
  ;

  /**
   * @desc      Run block for iot.layout module.
   * @namespace Layout
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
   * @desc      Getter method for module route definitions.
   * @memberOf  Routes.Layout
   *
   * @returns {*[]}
   */
  function getStates() {
    return [
      {
        state: 'iot',
        config: {
          abstract: true,
          views: {
            header: {
              templateUrl: '/iot/layout/header.html',
              controller: 'HeaderController',
              controllerAs: 'vm'
            },
            footer: {
              templateUrl: '/iot/layout/footer.html',
              controller: 'FooterController',
              controllerAs: 'vm'
            }
          }
        }
      }
    ];
  }
})();
