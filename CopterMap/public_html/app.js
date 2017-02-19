/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


$(document).ready(function () {
  var serverUrl = 'http://78.108.89.204:8080/geoserver/wms';
  var config = {
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


  var swipe = document.getElementById('swipe');
  swipe.addEventListener('input', function () {
    map.render();
  }, false);

  var left = document.getElementById('left');
  var rigth = document.getElementById('rigth');

  // process config
  for (var item in config) {

    var layer = new ol.layer.Tile({
      title: config[item].label,
      source: new ol.source.TileWMS({
        url: serverUrl,
        params: {LAYERS: config[item].name, VERSION: '1.1.1'}
      })
    });
    layers.push(layer);

    console.log(serverUrl + config[item].name);

    var optionL = document.createElement('option');
    var optionR = document.createElement('option');
    optionL.text = optionL.value = config[item].label;
    optionR.text = optionR.value = config[item].label;
    left.add(optionL, 0);
    rigth.add(optionR, 0);
    console.log('Add option ' + config[item].label);
    
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

  //optionR.value = optionR.options;

  var bbox = layers[1].getExtent();
  var map = new ol.Map({
    layers: layers,
    target: 'map',
    controls: ol.control.defaults({
      attributionOptions: ({
        collapsible: false
      })
    }),
    view: new ol.View({
      center: ol.proj.fromLonLat([-90, 40]),
      zoom: 6
    })
  });
  //map.setExtent(bbox);

});