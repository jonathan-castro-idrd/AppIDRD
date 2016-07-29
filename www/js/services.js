﻿angular.module('starter.services', [])
.factory('STORAGE', function ($localStorage) {
    var self = this;

    $localStorage = $localStorage.$default({
        things: '{"app": "IDRD"}'
    });

    $localStorage.things = '{"app": "IDRD"}';

    this.getAll = function () {
        var obj =  JSON.parse($localStorage.things);
        return obj;
    }

    this.get = function (key) {
        var obj = JSON.parse($localStorage.things);
        return obj[key];
    }

    this.set = function (key, value) {
        var obj = JSON.parse($localStorage.things);
        obj[key] = value;

        $localStorage.things = JSON.stringify(obj);
    }

    this.remove = function (key) {
        var obj = JSON.parse($localStorage.things);
        delete obj[key];
    }

    return self;
})
// tomado de https://gist.github.com/lykmapipo/6451623a54ef9b957a5c
.factory('DBA', function ($cordovaSQLite, $q, $ionicPlatform) {
    var self = this;

    self.query = function (query, parameters) {
        parameters = parameters || [];

        // mas en https://docs.angularjs.org/api/ng/service/$q
        var q = $q.defer();

        $ionicPlatform.ready(function () {
            $cordovaSQLite.execute(db, query, parameters)
              .then(function (result) {
                  q.resolve(result);
              }, function (error) {
                  console.warn('I found an error');
                  console.warn(error);
                  alert(error);
                  q.reject(error);
              });
        });
        return q.promise;
    }

    self.getAll = function (result) {
        var output = [];

        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        return output;
    }

    // Proces a single result
    self.firstRow = function (result) {
        var output = null;
        output = angular.copy(result.rows.item(0));
        return output;
    }

    return self;
})
.factory('api_ciclovia', function ($http) {
    var url = "http://www.idrd.gov.co/AndroidCiclovia/Consultas.php";
    return {
        registro: function (identificacion, nombre) {
            return $http.post(
                url,
                {
                    Opcion: 1,
                    Identificacion: identificacion,
                    Nombre: nombre
                }
            ).then(function (result) {
                return result.data;
            });
        },
        obtenerIdUsuario: function (identificacion)
        {
            return $http.post(
               url,
               {
                   Opcion: 2,
                   Identificacion: identificacion
               }
           ).then(function (result) {
               return result.data;
           });
        },
        getNews: function () {
            return $http.post(
                url,
                { Opcion: 3 }
            ).then(function (result) {
                return result.data;
            });
        },
        getMessages: function () {
            return $http.post(
                url,
                { Opcion: 6 }
            ).then(function (result) {
                return result.data;
            });
        },
        sendMessage: function (mensaje, id_persona) {
            return $http.post(
                url,
                {
                    Opcion: 7,
                    _Mensaje: mensaje,
                    _idPersona: id_persona
                }
            ).then(function (result) {
                return result.data;
            });
        }
    }
})
.factory('Usuario', function ($cordovaSQLite, DBA) {
    var self = this;

    self.all = function () {
        return DBA.query("SELECT id, identificacion, nombre FROM usuarios")
          .then(function (result) {
              return DBA.getAll(result);
          }).catch(function (error) {

          });
    }

    self.get = function (id) {
        return DBA.query("SELECT id, identificacion, nombre FROM usuarios WHERE id = ? ", [id])
            .then(function (result) {
                return DBA.firstRow(result);
            })
    }

    self.add = function (usuario) {
        var parameters = [usuario.identificacion, usuario.nombre];
        return DBA.query("INSERT INTO usuarios (identificacion, nombre) VALUES (?,?)", parameters);
    }

    self.remove = function (usuario) {
        var parameters = [usuario.identificacion];
        return DBA.query("DELETE FROM usuarios WHERE identificacion = (?)", parameters);
    }

    self.update = function (usuarioOriginal, usuarioActualizado) {
        var parameters = [usuarioActualizado.identificacion, usuarioActualizado.nombre, usuarioOriginal.identificacion];
        return DBA.query("UPDATE usuarios SET identificacion = (?), nombre = (?) WHERE identificacion = (?)", parameters);
    }

    return self;
});