(function() {
  'use strict';

  /**
   * Specify run block for iot.about module.
   *
   * @namespace Routes
   */
  angular
    .module('iot.about')
    .run(moduleRun)
  ;

  /**
   * @desc      Run block for iot.about module.
   * @namespace About
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
        state: 'about',
        config: {
          url: '/',
          parent: 'iot',
          title: 'About',
          containerClass: 'about-container',
          views: {
            'content@': {
              templateUrl: '/iot/about/about.html',
              controller: 'AboutController',
              controllerAs: 'vm'
            }
          }
        }
      }
    ];
  }
})();
