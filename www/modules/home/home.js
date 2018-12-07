angular.module('motohelper')
.controller('homeCtrl', function($scope, homeService, loading, $ionicLoading, $ionicModal, corridaRequest, $localStorage, constant, homeStorage) {

    var client = null;
    $scope.buscandoServicos = true;

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

    homeService.initMapa($localStorage.getObject('user').posicao);

    atualizaTemplate();

    $scope.solicitarServico = function () {
        loading.show('Buscando motoboys');
        $scope.buscandoServicos = false;
        corridaRequest.buscarServico().getRequest().then(function (data) {
            $localStorage.setObject("corrida_atual", data.data);
            conectaComMQTT(data.data.id);
        });
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
                    var corrida  =JSON.parse(message.payloadString);
                    console.log(corrida)
                    $localStorage.setObject("corrida", JSON.parse(message.payloadString));
                    var objServico = {
                        possicaoCliente : {latitude : '-22.207151', longitude : '-49.681706'},
                        motoboy: {
                            nome : "Paulo", latitude : '-22.220743', longitude : '-49.660133', placa : "KDJ-1311", modelo : 'HONDA - CBTWISTER 250F', cor : 'gray', ultimaPosicao: "Garça, São Paulo, Rua Carlos Ferrari Nº941"
                        }
                    }
                    $localStorage.setObject("servico", objServico)
                }

                setTimeout(function () {
                    $ionicLoading.hide();
                    var objServico = {
                        possicaoCliente : {latitude : '-22.207151', longitude : '-49.681706'},
                        motoboy: {
                            nome : "Paulo", latitude : '-22.220743', longitude : '-49.660133', placa : "KDJ-1311", modelo : 'HONDA - CBTWISTER 250F', cor : 'gray', ultimaPosicao: "Garça, São Paulo, Rua Carlos Ferrari Nº941"
                        }
                    }

                    $scope.motoboy = objServico.motoboy;

                    setNovoServico(objServico)
                }, 1000);
                $scope.$apply();
            }
        }
    };

    setNovoServico = function (posicoes) {
        homeService.setCorridaEmAndamento(posicoes)
    }
    
    $scope.finalizarServico = function (servico) {
        $scope.modal.show();
    };

});
