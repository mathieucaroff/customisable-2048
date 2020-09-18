/**

  The Initial Developer of the Original Code is
  Matthieu  - http://www.programmation-facile.com/
  Portions created by the Initial Developer are Copyright (C) 2013
  the Initial Developer. All Rights Reserved.

  Contributor(s) :

 */

/**
 * Code source :
 * https://github.com/gabrielecirulli/2048/
 *
 */

/**
 * Gestion des cases
 *
 * @param {[type]} position [description]
 * @param {[type]} value    [description]
 */
export function Tile(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;

    this.previousPosition = null;
    this.mergedFrom = null; // Suivi des tuiles fusionnées
}

/**
 * Sauvegarde la position d'une case
 *
 * @return {[type]} [description]
 */
Tile.prototype.savePosition = function () {
    this.previousPosition = { x: this.x, y: this.y };
};

/**
 * Mets à jour la position d'une case
 *
 * @param  {[type]} position [description]
 * @return {[type]}          [description]
 */
Tile.prototype.updatePosition = function (position) {
    this.x = position.x;
    this.y = position.y;
};

Tile.prototype.serialize = function () {
    return {
        position: {
            x: this.x,
            y: this.y,
        },
        value: this.value,
    };
};
