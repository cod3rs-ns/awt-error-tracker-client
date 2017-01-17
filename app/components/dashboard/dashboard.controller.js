(function () {
    'use strict';

    angular
        .module('awt-client')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$scope', '$uibModal', '$localStorage', '$log', '_', 'dashboardService', 'userService'];

    function DashboardController($scope, $uibModal, $localStorage, $log, _, dashboardService, userService) {
        var dashboardVm = this;

        // Variable binders
        dashboardVm.apps = [];
        dashboardVm.includedApps = [];
        dashboardVm.userForms = {};

        // Methods
        dashboardVm.getRegistredApplications = getRegistredApplications;
        dashboardVm.getIncludedApplications = getIncludedApplications;
        dashboardVm.getActiveUser = getActiveUser;
        dashboardVm.registerApplication = registerApplication;
        dashboardVm.addUser = addUser;
        dashboardVm.setUserForm = setUserForm;

        activate();

        function activate() {
            dashboardVm.getRegistredApplications();
            dashboardVm.getIncludedApplications();
            dashboardVm.getActiveUser();
        }

        function getActiveUser(){
            userService.getUser($localStorage.user)
                .then(function(response) {
                    dashboardVm.activeUser = response.data;
                })
                .catch(function(error) {
                    $log.warn(error);
                });
        }

        function getRegistredApplications() {
            dashboardService.getMyApps($localStorage.user)
                .then(function (response) {
                    dashboardVm.apps = response.data;
                    dashboardVm.isCollapsedRegistered = [];
                    dashboardVm.users = [];
                    _.forEach(dashboardVm.apps, function (app) {
                        dashboardVm.isCollapsedRegistered.push(true);
                        var realUsers = [];
                        _.forEach(app.users, function (id) {
                            userService.getUserId(id)
                              .then(function(response) {
                                  realUsers.push(response.data);
                              })
                              .catch(function(error) {
                                  $log.warn(error);
                              });
                        });
                        app.users = realUsers;

                        dashboardVm.users[app._id] = "";
                    });
                })
                .catch(function (error) {
                    $log.error(error);
                });
        };

        function getIncludedApplications() {
            dashboardService.getMyIncludedApps($localStorage.user)
                .then(function (response) {
                    dashboardVm.includedApps = response.data;
                    dashboardVm.isCollapsedIncluded = [];
                    _.forEach(dashboardVm.includedApps, function (app) {
                        dashboardVm.isCollapsedIncluded.push(true);
                        var realUsers = [];
                        _.forEach(app.users, function (id) {
                            userService.getUserId(id)
                              .then(function(response) {
                                  realUsers.push(response.data);
                              })
                              .catch(function(error) {
                                  $log.warn(error);
                              });
                        });
                        app.users = realUsers;
                    });
                })
                .catch(function (error) {
                    $log.error(error);
                });
        };

        function registerApplication(size, parentSelector) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/components/dashboard/create-application-form.html',
                controller: 'CreateApplicationController',
                controllerAs: 'createAppVm',
                size: size,
                resolve: {
                    user: function () {
                        return $localStorage.user;
                    }
                }
            });

            modalInstance.result
                .then(function (app) {
                    app.name = app.name.$$state.value;
                    app.dsn = app.dsn.$$state.value;

                    dashboardService.registerApp(app)
                        .then(function (response) {
                            dashboardVm.apps.push(response.data);
                        })
                        .catch(function (error) {
                            $log.error(error);
                        });
                }, function () {
                    $log.info('Modal dismissed at: ' + _.now());
                });
        };

        function setUserForm(form, appId) {
            dashboardVm.userForms[appId] = form;
        }

        function addUser(application) {
            dashboardVm.users[application._id] = dashboardVm.users[application._id].$$state.value;
            var user = angular.copy(dashboardVm.users[application._id]);

            // Refresh form
            dashboardVm.userForms[application._id].$setPristine();
            dashboardVm.userForms[application._id].$setDirty();

            $log.info(user);
            userService.getUser(user)
              .then(function(response) {
                  var user = response.data;

                  if (_.isNull(user)) {
                      dashboardVm.doesntExist = true;
                  }
                  else {
                      application.users.push(user);

                      dashboardService.updateApp(application)
                          .then(function (response) {
                              dashboardVm.users[application._id] = "";
                              dashboardVm.doesntExist = false;
                          })
                          .catch(function (error) {
                              $log.error(error);
                          });
                  }
              })
              .catch(function(error) {
                  $log.warn(error);
              });
        };
    }
})();