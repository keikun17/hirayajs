// Generated by CoffeeScript 1.3.3
(function() {
  var Hiraya, expect;

  if (typeof require === 'function') {
    Hiraya = require('../src/');
    expect = require('expect.js');
  } else {
    Hiraya = this.Hiraya;
    expect = this.expect;
  }

  describe.skip('Turn-based game test suite', function() {
    describe('A Base Game', function() {
      var Game;
      Game = Hiraya.Game.create();
      it('should create a Game namespace', function() {
        return expect(Game).to.be.ok();
      });
      return it('should have a default Level class', function() {
        return expect(Game.Level).to.be.ok();
      });
    });
    describe('Game: Adding entities', function() {
      it('should be able to add entities based on attributes', function() {
        var Game;
        Game = Hiraya.Game.create();
        Game.Level = Hiraya.LevelTurnBased.extend({
          ready: function() {
            this.addEntity({
              name: 'Marine',
              stats: {
                health: [400, 1000]
              }
            });
            expect(this.entities.at(0).stats.health.value).to.be(400);
            return expect(this.entities.at(0).stats.health.max).to.be(1000);
          }
        });
        return Game.start();
      });
      return it('should be able to automatically place entities in a tile by attributes', function() {
        var Game;
        Game = Hiraya.Game.create();
        Game.Level = Hiraya.LevelTurnBased.extend({
          Tiles: Hiraya.Tiles.extend({
            rows: 10,
            columns: 10
          }),
          ready: function() {
            this.addEntity({
              name: 'Marine',
              tile: {
                x: 9,
                y: 9
              }
            });
            return expect(this.tiles.get(9, 9).isOccupied()).to.be.ok();
          }
        });
        return Game.start();
      });
    });
    describe('Moving entities', function() {
      return it('should be able to move entities to a different tile', function() {
        var Game;
        Game = Hiraya.Game.create();
        Game.Level = Hiraya.LevelTurnBased.extend({
          Tiles: Hiraya.Tiles.extend({
            rows: 10,
            columns: 10
          }),
          ready: function() {
            this.addEntity({
              name: 'Marine',
              tile: {
                x: 9,
                y: 9
              }
            });
            expect(this.tiles.get(9, 9).isOccupied()).to.be.ok();
            this.tiles.get(0, 0).occupy(this.entities.at(0));
            return expect(this.entities.at(0).get('tile')).to.be(this.tiles.get(0, 0));
          }
        });
        return Game.start();
      });
    });
    describe('Attacking entities', function() {
      return it('should be able to target other entities', function() {
        var Game;
        Game = Hiraya.Game.create();
        Game.Level = Hiraya.LevelTurnBased.extend({
          ready: function() {
            var enemy, hero;
            this.addEntity({
              stats: {
                health: [1],
                attack: [1]
              },
              tile: {
                x: 0,
                y: 1
              }
            });
            this.addEntity({
              stats: {
                health: [1],
                attack: [1]
              },
              tile: {
                x: 0,
                y: 0
              }
            });
            hero = this.entities.at(0);
            enemy = this.entities.at(1);
            hero.attack(enemy);
            return expect(enemy.stats.health.isEmpty()).to.be(true);
          }
        });
        return Game.start();
      });
    });
    describe('Turn based entities', function() {
      return it('should have a steps, range, turn and turnspeed stat attribute by DEFAULT', function() {
        var Game;
        Game = Hiraya.Game.create();
        Game.Level = Hiraya.LevelTurnBased.extend({
          ready: function() {
            var entity;
            this.addEntity({
              tile: {
                x: 0,
                y: 0
              }
            });
            entity = this.entities.at(0);
            expect(entity.stats.steps).to.be.ok();
            expect(entity.stats.range).to.be.ok();
            expect(entity.stats.turn).to.be.ok();
            return expect(entity.stats.turnspeed).to.be.ok();
          }
        });
        return Game.start();
      });
    });
    return describe('A simple round', function() {
      it('should have two entities to start', function(done) {
        var Game;
        Game = Hiraya.Game.create();
        Game.Level = Hiraya.LevelTurnBased.extend({
          minEntities: 2,
          ready: function() {
            this.addEntity({
              stats: {
                health: [1],
                attack: [1]
              },
              tile: {
                x: 0,
                y: 0
              }
            });
            return this.addEntity({
              stats: {
                health: [1],
                attack: [1]
              },
              tile: {
                x: 1,
                y: 0
              }
            });
          },
          addedEntity: function() {
            if (this.entities.length >= this.minEntities) {
              return this.started();
            }
          },
          started: function() {
            return done();
          }
        });
        return Game.start();
      });
      return it('should start calculating the turn list', function(done) {
        var Game;
        Game = Hiraya.Game.create();
        Game.Level = Hiraya.LevelTurnBased.extend({
          minEntities: 2,
          ready: function() {
            this.addEntity({
              stats: {
                health: [1],
                attack: [1]
              },
              tile: {
                x: 0,
                y: 0
              }
            });
            return this.addEntity({
              stats: {
                health: [1],
                attack: [1]
              },
              tile: {
                x: 1,
                y: 0
              }
            });
          },
          addedEntity: function() {
            if (this.entities.length >= this.minEntities) {
              return this.started();
            }
          },
          started: function() {
            return this.getTurn();
          },
          gotTurn: function() {
            return done();
          }
        });
        return Game.start();
      });
    });
  });

  describe.only('An automated game test', function() {
    return it('should announce the winner once there is only one left', function(done) {
      var Game;
      Game = Hiraya.Game.create();
      Game.Level = Hiraya.LevelTurnBased.extend({
        minEntities: 3,
        _tickSpeed: 0,
        ready: function() {
          this.addEntity({
            name: 'marine',
            auto: true,
            stats: {
              health: [10],
              attack: [0],
              turnspeed: [0]
            },
            tile: {
              x: 0,
              y: 0
            }
          });
          this.addEntity({
            name: 'marine-2',
            auto: true,
            stats: {
              health: [10],
              attack: [0],
              turnspeed: [0]
            },
            tile: {
              x: 1,
              y: 1
            }
          });
          return this.addEntity({
            name: 'vanguard',
            auto: true,
            stats: {
              health: [10],
              attack: [1],
              range: [1]
            },
            tile: {
              x: 5,
              y: 3
            }
          });
        },
        addedEntity: function(entity) {
          if (this.entities.length === this.minEntities) {
            return this.started();
          }
        },
        started: function() {
          return this.getTurn();
        },
        gotTurn: function(entity) {
          if (entity.auto) {
            return this.autoTurn(entity);
          }
        },
        autoTurn: function(entity) {
          var nearestEntityTileFrom, target;
          target = this.proximity(entity, 'range');
          target = target[0];
          if (target) {
            entity.attack(target);
          } else {
            nearestEntityTileFrom = this.nearestEntityTileFrom(entity);
            nearestEntityTileFrom.occupy(entity);
          }
          return this.evaluateEntities();
        },
        hasWinner: function(entity) {
          return done();
        },
        hasNoWinnerYet: function() {
          return this.getTurn();
        }
      });
      return Game.start();
    });
  });

}).call(this);
