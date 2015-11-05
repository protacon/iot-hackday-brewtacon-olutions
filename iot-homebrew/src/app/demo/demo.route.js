(function() {
  'use strict';

  /**
   * Specify run block for iot.demo module.
   *
   * @namespace Routes
   */
  angular
    .module('iot.demo')
    .run(moduleRun)
  ;

  /**
   * @desc      Run block for iot.demo module.
   * @namespace Demo
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
   * @desc      Getter method for iot.demo module route definitions.
   * @memberOf  Routes.Demo
   *
   * @returns {*[]}
   */
  function getStates() {
    return [
      {
        state: 'demo',
        config: {
          url: '/demo',
          parent: 'iot',
          title: 'Demo',
          containerClass: 'demo-container',
          views: {
            'content@': {
              templateUrl: '/iot/demo/demo.html',
              controller: 'DemoController',
              controllerAs: 'vm',
              resolve: {
                _messages: _messages
              }
            }
          }
        }
      }
    ];
  }

  /**
   * @name      _messages
   * @desc      '_messages' resolve function.
   * @memberOf  Routes.Demo
   * @ngInject
   *
   * @param   {AngularFireArrayService} $firebaseArray
   * @param   {Factories.Dataservice}   dataservice
   * @returns {ng.IPromise<TResult>}
   * @private
   */
  function _messages($firebaseArray, dataservice) {
    return $firebaseArray(dataservice.getReference('messages'));
  }
})();
