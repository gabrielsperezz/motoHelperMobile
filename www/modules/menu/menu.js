angular.module('motohelper')
.controller('AppCtrl', function($scope, corridaRequest, $localStorage) {

    $scope.atualizarHistoricoDeCorridas = function () {
        atualizarHistoricoDeCorridas();
        $scope.$broadcast('scroll.refreshComplete');
    }

    function atualizarHistoricoDeCorridas(){
        corridaRequest.buscarHistoricoDeCorridas().getRequest().then(function (data) {
            $scope.corridas  = data.data;

            setTimeout(function () {
                $scope.$apply();
            },1);
        });
    }

    function atualizaInformacoesUsuario(){
        corridaRequest.buscarUserInfo().getRequest().then(function (data) {
            $localStorage.setObject('user', data.data );
        });
    }

    atualizaInformacoesUsuario();
    atualizarHistoricoDeCorridas();
});