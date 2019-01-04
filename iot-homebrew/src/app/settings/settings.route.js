(function() {
  'use strict';

  /**
   * Specify run block for iot.about module.
   *
   * @namespace Routes
   */
  angular
    .module('iot.settings')
    .run(moduleRun)
  ;

  /**
   * @desc      Run block for iot.about module.
   * @namespace Settings
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
        state: 'settings',
        config: {
          url: '/settings',
          parent: 'iot',
          title: 'Settings',
          containerClass: 'settings-container',
          views: {
            'content@': {
              templateUrl: '/iot/settings/settings.html',
              controller: 'SettingsController',
              controllerAs: 'vm'
            }
          }
        }
      }
    ];
  }
})();
