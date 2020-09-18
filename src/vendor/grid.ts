/**

  The Initial Developer of the Original Code is
  Matthieu  - http://www.programmation-facile.com/
  Portions created by the Initial Developer are Copyright (C) 2013
  the Initial Developer. All Rights Reserved.

  Contributor(s) :

 */

import { Tile } from './tile';

/**
 * Code source :
 * https://github.com/gabrielecirulli/2048/
 *
 */

/**
 * Gestion du système de grille du jeu
 *
 * @param {[type]} size          [description]
 * @param {[type]} previousState [description]
 */
export function Grid(size, previousState?) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
}

/**
 * Création d'une grille de jeu
 * en fonction d'une taille défini
 *
 * @return {[type]} [description]
 */
Grid.prototype.empty = function () {
    var cells = [];

    for (var x = 0; x < this.size; x++) {
        var row = (cells[x] = []);

        for (var y = 0; y < this.size; y++) {
            row.push(null);
        }
    }

    return cells;
};

Grid.prototype.fromState = function (state) {
    var cells = [];

    for (var x = 0; x < this.size; x++) {
        var row = (cells[x] = []);

        for (var y = 0; y < this.size; y++) {
            var tile = state[x][y];
            row.push(tile ? new Tile(tile.position, tile.value) : null);
        }
    }

    return cells;
};

/**
 * Trouve la première position aléatoire disponible
 *
 * @return {[type]} [description]
 */
Grid.prototype.randomAvailableCell = function () {
    var cells = this.availableCells();

    if (cells.length) return cells[Math.floor(Math.random() * cells.length)];
};

Grid.prototype.availableCells = function () {
    var cells = [];

    this.eachCell(function (x, y, tile) {
        if (!tile) cells.push({ x: x, y: y });
    });

    return cells;
};

/**
 * Rappel pour chaque case
 *
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Grid.prototype.eachCell = function (callback) {
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            callback(x, y, this.cells[x][y]);
        }
    }
};

/**
 * Vérifie si il y a des cases disponibles
 *
 * @return {[type]} [description]
 */
Grid.prototype.cellsAvailable = function () {
    return !!this.availableCells().length;
};

/**
 * Vérifie si la case est occupée ou pas
 *
 * @param  {[type]} cell [description]
 * @return {[type]}      [description]
 */
Grid.prototype.cellAvailable = function (cell) {
    return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
    return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
    if (this.withinBounds(cell)) return this.cells[cell.x][cell.y];
    else return null;
};

/**
 * Ajoute une case à la position choisi
 *
 * @param  {[type]} tile [description]
 * @return {[type]}      [description]
 */
Grid.prototype.insertTile = function (tile) {
    this.cells[tile.x][tile.y] = tile;
};

/**
 * Supprime une case à la position choisi
 *
 * @param  {[type]} tile [description]
 * @return {[type]}      [description]
 */
Grid.prototype.removeTile = function (tile) {
    this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function (position) {
    return (
        position.x >= 0 &&
        position.x < this.size &&
        position.y >= 0 &&
        position.y < this.size
    );
};

Grid.prototype.serialize = function () {
    var cellState = [];

    for (var x = 0; x < this.size; x++) {
        var row = (cellState[x] = []);

        for (var y = 0; y < this.size; y++) {
            row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
        }
    }

    return {
        size: this.size,
        cells: cellState,
    };
};
