(function() {
    'use strict';

    angular
        .module('awt-client')
        .service('eventService', eventService);

    eventService.$inject = ['$http', 'CONFIG'];

    function eventService($http, CONFIG) {
        var service = {
          getEventsByAppId: getEventsByAppId,
          getEvent: getEvent
        };

        return service;

        function getEventsByAppId(appId) {
            return $http.get(CONFIG.SERVICE_URL + '/applications/' + appId + '/events')
              .then(function successCallback(response) {
                  return response;
              }, function errorCallback(response) {
                  throw 'cannot-retrieve-events';
              });
        };


        /**
         * Retreive single Event from the server.
         * 
         * @param {any} eventId     ID of the Event
         * @returns response
         */
        function getEvent(eventId) {
            return $http.get(CONFIG.SERVICE_URL + '/events/' + eventId)
                .then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    throw 'cannot-retrieve-event';
                });
        };
        
    }
})();