/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var config;
var swipe;
var serverUrl = 'http://78.108.89.204:8080/geoserver/wms';

var left = document.getElementById('left');
var rigth = document.getElementById('rigth');

var leftLayer;
var rightLayer;

var map;

$(document).ready(function () {

    config = {
        layer01: {
            label: 'Archsites',
            name: 'sf:archsites'
        },
        layer02: {
            label: 'Restricted',
            name: 'sf:restricted'
        },
        layer03: {
            label: 'Sfdem',
            name: 'sf:sfdem'
        },
        layer04: {
            label: 'Roads',
            name: 'sf:roads'
        }
    };

    var osm = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    var layers = [];
    layers.push(osm);


    swipe = document.getElementById('swipe');
    swipe.addEventListener('input', function () {
        map.render();
    }, false);

    var optionL = document.createElement('option');
    //var optionR = document.createElement('option');
    optionL.text = optionL.value = 'Выбрать снимок';
    //optionR.text = optionR.value = 'Выбрать снимок';
    left.add(optionL, 0);
    //rigth.add(optionR, 0);
    for (var item in config) {
        var optionL = document.createElement('option');
        var optionR = document.createElement('option');
        optionL.text = optionL.value = config[item].label;
        //optionR.text = optionR.value = config[item].label;
        left.add(optionL, 0);
        //rigth.add(optionR, 0);
    }

    rigth.addEventListener('change', changeRightLayer);
    left.addEventListener('change', changeLeftLayer);

    map = new ol.Map({
        layers: layers,
        target: 'map',
        controls: ol.control.defaults({
            attributionOptions: ({
                collapsible: false
            })
        }),
        view: new ol.View({
            center: ol.proj.fromLonLat([-95, 45]),
            zoom: 6
        })
    });

});

function changeLeftLayer() {
    if (rigth.options.length > 0) {
        var i;
        for (i = rigth.options.length - 1; i >= 0; i--)
        {
            rigth.remove(i);
        }
    }

    leftLayer = left.value;
    console.log(leftLayer);
    var optionR = document.createElement('option');
    optionR.text = optionR.value = 'Выбрать снимок';
    rigth.add(optionR, 0);
    for (var item in config) {
        if (config[item].label !== leftLayer) {
            var optionR = document.createElement('option');
            optionR.text = optionR.value = config[item].label;
            rigth.add(optionR, 0);
        } else {
            var layer = new ol.layer.Tile({
                title: config[item].label,
                source: new ol.source.TileWMS({
                    url: serverUrl,
                    params: {LAYERS: config[item].name, VERSION: '1.1.1'}
                })
            });
            if (rightLayer) {
                map.removeLayer(rightLayer);
            }
            if (leftLayer) {
                map.removeLayer(leftLayer);
            }
            map.addLayer(layer);
            leftLayer = layer;
            var extent = layer.getExtent();
            map.getView().fit(extent);
        }
    }
}

function changeRightLayer() {
    if (rigth.value === 'Выбрать снимок' || rigth.value === '') {
    } else
        loadLayers(rigth.value);

}

function loadLayers(visibleLayer) {
    // process config
    var layer;

    for (var item in config) {
        if (config[item].label === visibleLayer) {
            layer = new ol.layer.Tile({
                title: config[item].label,
                source: new ol.source.TileWMS({
                    url: serverUrl,
                    params: {LAYERS: config[item].name, VERSION: '1.1.1'}
                })
            });

            layer.on('precompose', function (event) {
                var ctx = event.context;
                var width = ctx.canvas.width * (swipe.value / 100);

                ctx.save();
                ctx.beginPath();
                ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
                ctx.clip();
            });

            layer.on('postcompose', function (event) {
                var ctx = event.context;
                ctx.restore();
            });
        }
    }
    if (rightLayer) {
        map.removeLayer(rightLayer);
    }
    map.addLayer(layer);
    rightLayer = layer;
}