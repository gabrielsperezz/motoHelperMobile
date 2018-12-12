angular.module("motohelper").service('homeService', function () {

    var mapa = null;
    var markersGroup;
    var configRotas =
    {
        "delay": 800,
        "dashArray": [1, 87],
        "weight": 8,
        "color": "#0000FF",
        "pulseColor": "#FFFFFF",
        "paused": true,
        "reverse": false
    };

    _initialize = function (localizacao) {

        if(mapa == null){
            mapa = L.map(document.getElementById('leaflet-map'));
        }

        L.Icon.Default.imagePath = 'assets/img/theme/vendor/leaflet/dist/images';

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(mapa);

        _clearLears();

        markersGroup = L.layerGroup().addTo(mapa);

        mapa.setView([localizacao.latitude, localizacao.longitude], 13);
    };

    _setMarkersMotoboys = function (localizacoes) {
        _clearLears();
        var rotas = [];

        angular.forEach(localizacoes, function (localizacao) {
            if (localizacao != null) {

                var marker = _criarMaker(localizacao, localizacao.cor);

                var icon = angular.element(marker._icon);
                icon.append(_createMarkerLabel(localizacao, localizacao.cor));

                rotas.push([Number(localizacao.latitude), Number(localizacao.longitude)]);
            }
        });
    };

    _setMarkerHouse = function (localizacaoCasa) {
        L.marker([localizacaoCasa.latitude, localizacaoCasa.longitude], {
            icon: L.AwesomeMarkers.icon({
                icon: 'user',
                markerColor: 'black',
                prefix: 'fa'
            })
        }).addTo(markersGroup);
    };

    _setCorridaEmAndamento = function(posicoes, rotasInfo, motoboy){
        _clearLears();
        _setMarkerHouse(rotasInfo.final.posicao);

        var marker = _criarMaker(rotasInfo.inicial.posicao, motoboy.veiculo_atual.cor.label);

        var icon = angular.element(marker._icon);
        icon.append(_createMarkerLabel(motoboy.veiculo_atual, motoboy.veiculo_atual.cor.label));


        _criarRotas(posicoes);
    }

    _criarRotas = function(rotas){
        var path = L.polyline.antPath(rotas,configRotas);
        markersGroup.addLayer(path);
        mapa.fitBounds(path.getBounds());
    };

    _criarMaker = function (localizacao, cor) {
        return L.marker([localizacao.latitude, localizacao.longitude], {
            icon: L.AwesomeMarkers.icon({
                icon: ' fa-motorcycle',
                markerColor: cor,
                prefix: 'fa'
            })
        })
        .addTo(markersGroup);
    };

    _clearLears = function () {
        if(markersGroup != null){
            markersGroup.clearLayers();
        }
    };

    _createMarkerLabel = function (posicao, cor) {

        label = '<div class="marker_div marker_div_' + cor + '"><span> ' + posicao.placa + '</span></div>';

        return label;
    };

    return {
        initMapa: _initialize,
        setMarkers: _setMarkersMotoboys,
        setMarkerHouse: _setMarkerHouse,
        setCorridaEmAndamento : _setCorridaEmAndamento
    };

});