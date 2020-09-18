/**

  The Initial Developer of the Original Code is
  Matthieu  - http://www.programmation-facile.com/
  Portions created by the Initial Developer are Copyright (C) 2013
  the Initial Developer. All Rights Reserved.

  Contributor(s) :

 */

import { Grid } from './grid';
import { Tile } from './tile';

/**
 * Code source :
 * https://github.com/gabrielecirulli/2048/
 *
 */

/**
 * Gestion du jeu
 *
 * @param {[type]} size           [description]
 * @param {[type]} InputManager   [description]
 * @param {[type]} Actuator       [description]
 * @param {[type]} StorageManager [description]
 */
export function GameManager(size, InputManager, Actuator, StorageManager) {
    this.size = size; // Size of the grid
    this.inputManager = new InputManager();
    this.storageManager = new StorageManager();
    this.actuator = new Actuator();

    this.startTiles = 2;

    this.inputManager.on('move', this.move.bind(this));
    this.inputManager.on('restart', this.restart.bind(this));
    this.inputManager.on('keepPlaying', this.keepPlaying.bind(this));

    this.setup();
}

/**
 * Relance une nouvelle partie
 *
 * @return {[type]} [description]
 */
GameManager.prototype.restart = function () {
    this.storageManager.clearGameState();
    this.actuator.continueGame(); //désactive le jeu, fin de partie
    this.setup();
};

/**
 * Continue la partie après avoir gagné
 * pour dépasser 2048
 *
 * @return {[type]} [description]
 */
GameManager.prototype.keepPlaying = function () {
    this.keepPlaying = true;
    this.actuator.continueGame(); //désactive le jeu, fin de partie
};

/**
 * Retourne vrai si la partie est perdue ou gagnée
 * et le joueur n'a pas continué à jouer
 *
 * @return {Boolean} [description]
 */
GameManager.prototype.isGameTerminated = function () {
    return this.over || (this.won && !this.keepPlaying);
};

/**
 * Init du jeu
 *
 * @return {[type]} [description]
 */
GameManager.prototype.setup = function () {
    var previousState = this.storageManager.getGameState();

    // Recharger le jeu à partir d'une partie si elle existe
    if (previousState) {
        // recharge la grille de jeu
        this.grid = new Grid(previousState.grid.size, previousState.grid.cells);
        this.score = previousState.score;
        this.over = previousState.over;
        this.won = previousState.won;
        this.keepPlaying = previousState.keepPlaying;
    } else {
        this.grid = new Grid(this.size);
        this.score = 0;
        this.over = false;
        this.won = false;
        this.keepPlaying = false;

        // Ajoute les cases de départ
        this.addStartTiles();
    }

    // Mise à jour
    this.actuate();
};

/**
 * Création des cases aléatoires
 *
 */
GameManager.prototype.addStartTiles = function () {
    for (var i = 0; i < this.startTiles; i++) {
        this.addRandomTile();
    }
};

/**
 * Ajoute une case aléatoire (position)
 *
 */
GameManager.prototype.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
        var value = Math.random() < 0.9 ? 2 : 4;
        var tile = new Tile(this.grid.randomAvailableCell(), value);

        this.grid.insertTile(tile);
    }
};

/**
 * Envoie de la grille mise à jour pour actualiser l'écran de jeu
 *
 * @return {[type]} [description]
 */
GameManager.prototype.actuate = function () {
    if (this.storageManager.getBestScore() < this.score)
        this.storageManager.setBestScore(this.score);

    // Effacer l'Etat lorsque le jeu est terminé ( partie perdu uniquement, pas gagnée )
    if (this.over) this.storageManager.clearGameState();
    else this.storageManager.setGameState(this.serialize());

    this.actuator.actuate(this.grid, {
        score: this.score,
        over: this.over,
        won: this.won,
        bestScore: this.storageManager.getBestScore(),
        terminated: this.isGameTerminated(),
    });
};

/**
 * Renvoie l'état de la partie en cours
 * sous forme d'objet
 *
 * @return {[type]} [description]
 */
GameManager.prototype.serialize = function () {
    return {
        grid: this.grid.serialize(),
        score: this.score,
        over: this.over,
        won: this.won,
        keepPlaying: this.keepPlaying,
    };
};

/**
 * Sauvegarde toutes les positions des cases
 * et supprime les informations de fusion
 *
 * @return {[type]} [description]
 */
GameManager.prototype.prepareTiles = function () {
    this.grid.eachCell(function (x, y, tile) {
        if (tile) {
            tile.mergedFrom = null;
            tile.savePosition();
        }
    });
};

/**
 * Déplacement d'une case
 *
 * @param  {[type]} tile [description]
 * @param  {[type]} cell [description]
 * @return {[type]}      [description]
 */
GameManager.prototype.moveTile = function (tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
};

/**
 * Déplacement la case choisi par le joueur
 * en fonction de la direction
 *
 * @param  {[type]} direction [description]
 * @return {[type]}           [description]
 */
GameManager.prototype.move = function (direction) {
    // 0: up, 1: right, 2: down, 3: left
    var self = this;

    if (this.isGameTerminated()) return; // sortie fin de partie

    var cell, tile;

    var vector = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved = false;

    // Sauvegarde les positions courantes des cases et supprime les informations de fusion
    this.prepareTiles();

    // Déplace la grille dans la bonne direction et déplace les cases
    traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
            cell = { x: x, y: y };
            tile = self.grid.cellContent(cell);

            if (tile) {
                var positions = self.findFarthestPosition(cell, vector);
                var next = self.grid.cellContent(positions.next);

                // Seulement une fusion par rangée ?
                if (next && next.value === tile.value && !next.mergedFrom) {
                    var merged = new Tile(positions.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];

                    self.grid.insertTile(merged);
                    self.grid.removeTile(tile);

                    // Fusion entre 2 cases
                    tile.updatePosition(positions.next);

                    // Mise à jour du score
                    self.score += merged.value;

                    // La fameuse case 2048
                    if (merged.value === 2048) self.won = true; // c'est gagné !!!
                } else self.moveTile(tile, positions.farthest);

                if (!self.positionsEqual(cell, tile)) moved = true; // La case est déplacée de sa position d'origine
            }
        });
    });

    if (moved) {
        this.addRandomTile();

        if (!this.movesAvailable()) this.over = true; // Game over

        this.actuate();
    }
};

/**
 * Renvoie le vecteur représentant la direction choisi
 *
 * @param  {[type]} direction [description]
 * @return {[type]}           [description]
 */
GameManager.prototype.getVector = function (direction) {
    // Vecteurs représentant le mouvement de la case
    var map = {
        0: { x: 0, y: -1 }, // haut
        1: { x: 1, y: 0 }, // droite
        2: { x: 0, y: 1 }, // bas
        3: { x: -1, y: 0 }, // gauche
    };

    return map[direction];
};

/**
 * Construction d'une liste de position à parcourir
 * dans un ordre déterminé
 *
 * @param  {[type]} vector [description]
 * @return {[type]}        [description]
 */
GameManager.prototype.buildTraversals = function (vector) {
    var traversals = { x: [], y: [] };

    for (var pos = 0; pos < this.size; pos++) {
        traversals.x.push(pos);
        traversals.y.push(pos);
    }

    // Toujours commencer à partir de la case la plus éloignée de la direction choisi
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
    var previous;

    // Progression vers la direction du vecteur jusqu'à un obstacle
    do {
        previous = cell;
        cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
        farthest: previous,
        next: cell, // Utilisé pour vérifier si une fusion est nécessaire
    };
};

GameManager.prototype.movesAvailable = function () {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

/**
 * Vérifie les concordances possibles entre les cases
 * (les plus élevées)
 *
 * @return {[type]} [description]
 */
GameManager.prototype.tileMatchesAvailable = function () {
    var self = this;

    var tile;

    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            tile = this.grid.cellContent({ x: x, y: y });

            if (tile) {
                for (var direction = 0; direction < 4; direction++) {
                    var vector = self.getVector(direction);
                    var cell = { x: x + vector.x, y: y + vector.y };

                    var other = self.grid.cellContent(cell);

                    if (other && other.value === tile.value) return true; // Ces deux tuiles peuvent être fusionnées
                }
            }
        }
    }

    return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
};
