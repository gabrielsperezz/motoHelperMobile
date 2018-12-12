angular.module('motohelper')
    .factory('corridaRequest', function (ARequest, tokenService, $localStorage, serialize) {
        return {
            buscarUltimaPosicaoMotoboys: function () {
                var token = tokenService.getToken();
                var headers = {
                    'token': token
                };
                return new ARequest('/api/mobile/motoboys/ultimaposicao', headers, 'GET');
            },
            buscarServico: function () {
                var token = tokenService.getToken();
                var headers = {
                    'token': token
                };
                return new ARequest('/api/mobile/corrida/procurar/'+ $localStorage.getObject('user').id, headers, 'POST');
            },
            buscarHistoricoDeCorridas: function () {
                var token = tokenService.getToken();
                var headers = {
                    'token': token
                };
                return new ARequest('/api/mobile/corridas/historico', headers, 'GET');
            },
            buscarRotaCorrida: function (idMotoboy) {
                var token = tokenService.getToken();
                var headers = {
                    'token': token
                };

                return new ARequest('/api/mobile/rotas/'+idMotoboy+'/' + $localStorage.getObject('user').id, headers, 'GET');
            },
            buscarCorridaAtual : function () {
                var token = tokenService.getToken();
                var headers = {
                    'token': token
                };

                return new ARequest('/api/mobile/corrida/atual', headers, 'GET');
            },
            buscarUserInfo: function () {
                var token = tokenService.getToken();
                var headers = {
                    'token': token
                };

                return new ARequest('/api/mobile/user/me', headers, 'GET');
            },
            finalizarCorrida: function (idCorrida, infoFinalizar) {
                var token = tokenService.getToken();
                var headers = {
                    'token': token
                };
                parameters = serialize.toUrlParams(infoFinalizar);
                return new ARequest('/api/mobile/corrida/'+ idCorrida +'/finalizar', headers, 'PUT', parameters);
            },
        }
    });