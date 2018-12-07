angular.module('motohelper')
    .factory('corridaRequest', function (ARequest, tokenService, $localStorage) {
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
            }
        }
    });