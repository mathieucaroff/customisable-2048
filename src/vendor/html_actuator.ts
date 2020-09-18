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
 * Permet de metter à jour l'interface du jeu
 *
 */

interface HTMLActuator {
    tileContainer: HTMLElement;
    scoreContainer: HTMLElement;
    bestContainer: HTMLElement;
    messageContainer: HTMLElement;
    actuate: (grid, metadata) => any;
    continueGame: () => any;
    clearContainer: (container) => any;
    addTile: (tile) => any;
    applyClasses: (element, classes) => any;
    normalizePosition: (position) => any;
    positionClass: (position) => any;
    updateScore: (score) => any;
    updateBestScore: (bestScore) => any;
    message: (won) => any;
    clearMessage: () => any;
    formatValue: (value: number) => number;
}

export function HTMLActuator(getFormatValue) {
    this.tileContainer = document.querySelector('.tile-container');
    this.scoreContainer = document.querySelector('.score-container');
    this.bestContainer = document.querySelector('.best-container');
    this.messageContainer = document.querySelector('.game-message');

    this.score = 0;

    this.formatValue = getFormatValue();
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
    var self = this;

    window.requestAnimationFrame(function () {
        self.clearContainer(self.tileContainer);

        grid.cells.forEach(function (column) {
            column.forEach(function (cell) {
                if (cell) self.addTile(cell);
            });
        });

        self.updateScore(metadata.score);
        self.updateBestScore(metadata.bestScore);

        // si la partie est terminée
        if (metadata.terminated) {
            if (metadata.over) self.message(false);
            // le joueur a perdu
            else if (metadata.won) self.message(true); // le joueur a gagné
        }
    });
};

/**
 * Continue la partie
 * Efface les messages présents de fin de partie
 *
 * @return {[type]} [description]
 */
HTMLActuator.prototype.continueGame = function () {
    this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

/**
 * Lors de l'ajout d'une case
 *
 * @param {[type]} tile [description]
 */
HTMLActuator.prototype.addTile = function (this: HTMLActuator, tile) {
    var self = this;

    var wrapper = document.createElement('div');
    var inner = document.createElement('div');
    var position = tile.previousPosition || { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(position);

    var classes = ['tile', 'tile-' + tile.value, positionClass];

    if (tile.value > 2048) classes.push('tile-super');

    this.applyClasses(wrapper, classes);

    inner.classList.add('tile-inner');
    inner.textContent = self.formatValue(+tile.value);

    if (tile.previousPosition) {
        window.requestAnimationFrame(function () {
            classes[2] = self.positionClass({ x: tile.x, y: tile.y });
            self.applyClasses(wrapper, classes); // Update the position
        });
    } else if (tile.mergedFrom) {
        classes.push('tile-merged');
        this.applyClasses(wrapper, classes);

        // Rendu des cases qui ont fusionnées
        tile.mergedFrom.forEach(function (merged) {
            self.addTile(merged);
        });
    } else {
        classes.push('tile-new');
        this.applyClasses(wrapper, classes);
    }

    // Ajout la partie intérieure de la case
    wrapper.appendChild(inner);

    // Mets la case sur la grille
    this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
    element.setAttribute('class', classes.join(' '));
};

HTMLActuator.prototype.normalizePosition = function (position) {
    return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return 'tile-position-' + position.x + '-' + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
    this.clearContainer(this.scoreContainer);

    var difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = this.score;

    if (difference > 0) {
        var addition = document.createElement('div');
        addition.classList.add('score-addition');
        addition.textContent = '+' + difference;

        this.scoreContainer.appendChild(addition);
    }
};

/**
 * Mets à jour le meilleur score
 *
 * @param  {[type]} bestScore [description]
 * @return {[type]}           [description]
 */
HTMLActuator.prototype.updateBestScore = function (bestScore) {
    this.bestContainer.textContent = bestScore;
};

/**
 * Affiche un message en fin de partie
 *
 * @param  {[type]} won [description]
 * @return {[type]}     [description]
 */
HTMLActuator.prototype.message = function (won) {
    // identifiant du message
    var type = won ? 'game-won' : 'game-over';

    // message à afficher
    var message = won ? 'Vous avez gagné !' : 'Game over!';

    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName('p')[0].textContent = message;
};

/**
 * Efface un message
 *
 * @return {[type]} [description]
 */
HTMLActuator.prototype.clearMessage = function () {
    this.messageContainer.classList.remove('game-won');
    this.messageContainer.classList.remove('game-over');
};
