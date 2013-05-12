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

  describe('Hiraya.Tiles', function() {
    var tiles;
    tiles = Hiraya.Tiles.create({
      rows: 5,
      columns: 5
    });
    return it('should be able to identify adjacent tiles of a single tile', function() {
      var adjacent;
      adjacent = tiles.adjacent(tiles.get(0, 0));
      return expect(adjacent.length).to.be.ok();
    });
  });

}).call(this);
