angular.module('motohelper')
.controller('homeCtrl', function($scope, homeService, loading, $ionicLoading, $ionicModal, corridaRequest, $localStorage, constant, homeStorage) {

    var client = null;
    $scope.buscandoServicos = true;
    homeService.initMapa($localStorage.getObject('user').posicao);

    function initiVariaveis() {
        $scope.corridas = [];
        $scope.corridaAtual =  null;
        $scope.rotas = null;
    }
    initiVariaveis()

    function atualizaTemplate(){
        corridaRequest.buscarUltimaPosicaoMotoboys().getRequest().then(function (data) {
           var localizacoes = getMapPosicoes(data.data);
            homeService.setMarkers(localizacoes);
            homeService.setMarkerHouse($localStorage.getObject('user').posicao);
        });
    }

    $scope.$on('atualizarTela', function() {
        atualizaTemplate();
    });

    $ionicModal.fromTemplateUrl('modules/home/modalFinalizarServico.html', {
        scope: $scope
    }).then(function(modal) {
         $scope.modal = modal;
    });

    function getMapPosicoes(posicoes){
        var localizacoes = [];

        angular.forEach(posicoes, function (informacoes) {
            localizacoes.push({
                latitude : informacoes.posicao.latitude,
                longitude : informacoes.posicao.longitude,
                placa : informacoes.veiculo_atual.placa,
                modelo : informacoes.veiculo_atual.fabricante + ' - ' + informacoes.veiculo_atual.modelo,
                cor : informacoes.veiculo_atual.cor.label
            })
        });
        return localizacoes;
    }

    if($localStorage.getObject("corrida_atual") != null){
        setCorrida();
    }else{
        atualizaTemplate();
    }


    $scope.solicitarServico = function () {
        loading.show('Buscando motoboys');
        corridaRequest.buscarServico().getRequest().then(function (data) {
            $localStorage.setObject("corrida_atual", data.data);
            conectaComMQTT(data.data.id);
        });
    }


    function setCorrida(){
        corridaRequest.buscarCorridaAtual().getRequest().then(function (data) {
            var corrida = data.data;
            $localStorage.setObject("corrida_atual", corrida);
            $scope.corridaAtual = corrida;
            corridaRequest.buscarRotaCorrida(corrida.id_motoboy_atendendo).getRequest().then(function (data) {

                conectaComMQTT($scope.corridaAtual.id);
                $scope.rotas = data.data;

                setNovoServico($scope.rotas.rotas_clean, $scope.rotas, corrida.motoboy);

                loading.hide();
                $scope.buscandoServicos = false;

                setTimeout(function () {
                    $scope.$apply();
                },0);
            });
        })

    }

    setNovoServico = function (posicoes, rotasInfo, corrida) {
        homeService.setCorridaEmAndamento(posicoes, rotasInfo, corrida)
    };


    $scope.preparaFinalizarServico = function () {
        $scope.modal.show();
    };

    $scope.finalizarCorrida = function (idCorrida) {
        corridaRequest.finalizarCorrida(idCorrida, null).getRequest().then(function (data) {
            finalizaCorrida();
        });
    }

    function finalizaCorrida() {
        $scope.buscandoServicos = true;
        $scope.corridaAtual = null;
        $localStorage.setObject("corrida_atual", null);
        initiVariaveis();
        atualizaTemplate();
        $scope.modal.hide();
    }



    function conectaComMQTT(idCorrida) {
        client = new Paho.MQTT.Client(constant.MQTT_URL, Number(constant.MQTT_PORTA), "", String(homeStorage.geraIdMQQT()));
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;
        var options = {
            timeout: 3,
            onSuccess: function () {
                console.log("conectou em ", 'corrida/'+idCorrida+'/#');
                client.subscribe('corrida/'+idCorrida+'/#', {qos: 2});
            },
            onFailure: function (mensagem) {
                console.log('[MQTT] ~ Desconectado ~');
            },
            reconnect: true,
            useSSL: true,
            userName: constant.MQTT_USERNAME,
            password: constant.MQTT_PASSWORD
        };

        client.connect(options);

        function onConnectionLost(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:"+responseObject.errorMessage);
            }
        }

        function onMessageArrived(message) {
            if (message != null) {
                console.log(message);
                if(message.topic.match('/aceita')){
                    setCorrida();
                }
                if(message.topic.match('/posicoes')){
                    setCorrida();
                }
                if(message.topic.match('/cancelar')){
                    finalizaCorrida()
                }
                $scope.$apply();
            }
        }
    };


});
