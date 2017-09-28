(function () {
    app.controller('CredentialsController', function CredentialsController($scope, authService){
        $scope.authenticated = authService.authenticated;
        $scope.gauth = function(){
            authService.loginWithGoogle();
            $scope.authenticated = true;
            authService.authenticated = $scope.authenticated;
        }
    });
}());
