(function() {
  'use strict';

  // Module initialization
  angular
    .module('iot.demo')
    .directive('demoScroll', demoScroll)
  ;

  // Directive dependencies
  demoScroll.$inject = ['$window', '$timeout'];

  /**
   * Actual directive code.
   *
   * @param   {$window}   $window
   * @param   {$timeout}  $timeout
   * @returns {{
   *    link: function,
   *    restrict: string
   *  }}
   * @ngInject
   */
  function demoScroll($window, $timeout) {
    return {
      link: link,
      restrict: 'A'
    };

    /**
     * Linker function for 'demoScroll' directive.
     *
     * @param {$scope}    scope
     * @param {$element}  element
     * @param {object}    attributes
     */
    function link(scope, element, attributes) {
      // Function to make actual scroll
      function scroll() {
        $timeout(function onTimeout() {
          element[0].scrollTop = element[0].scrollHeight;
        });
      }

      // Watch message collection and whenever it changes scroll bottom
      scope.$watchCollection(attributes.demoScroll, function onEvent() {
        scroll();
      });

      // Also bind scroll to window resize event
      angular.element($window).bind('resize', function onEvent() {
        scroll();
      });
    }
  }
})();
