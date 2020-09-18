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
 * Gestion du clavier
 * et des actions associées
 *
 */
export function KeyboardInputManager() {
    this.events = {};

    if (window.navigator.msPointerEnabled) {
        // Internet Explorer 10 style
        this.eventTouchstart = 'MSPointerDown';
        this.eventTouchmove = 'MSPointerMove';
        this.eventTouchend = 'MSPointerUp';
    } else {
        this.eventTouchstart = 'touchstart';
        this.eventTouchmove = 'touchmove';
        this.eventTouchend = 'touchend';
    }

    this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) this.events[event] = [];

    this.events[event].push(callback);
};

/**
 * Envoie un événement
 *
 * @param  {[type]} event [description]
 * @param  {[type]} data  [description]
 * @return {[type]}       [description]
 */
KeyboardInputManager.prototype.emit = function (event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
        callbacks.forEach(function (callback) {
            callback(data);
        });
    }
};

KeyboardInputManager.prototype.listen = function () {
    var self = this;

    // association des codes des touches à des identifiants
    var map = {
        38: 0, // Up
        39: 1, // Right
        40: 2, // Down
        37: 3, // Left
        75: 0, // Vim up
        76: 1, // Vim right
        74: 2, // Vim down
        72: 3, // Vim left
        87: 0, // W
        68: 1, // D
        83: 2, // S
        65: 3, // A
    };

    /**
     * Ecoute les flèches directionnelles du clavier
     *
     * @param  {[type]} event) {               var modifiers [description]
     * @return {[type]}        [description]
     */
    document.addEventListener('keydown', function (event) {
        var modifiers =
            event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
        var mapped = map[event.which];

        if (!modifiers) {
            if (mapped !== undefined) {
                event.preventDefault();
                self.emit('move', mapped);
            }
        }

        // touche R pour redémarrer le jeu
        if (!modifiers && event.which === 82) self.restart.call(self, event);
    });

    // Les réponses associées aux touches appuyées par le joueur
    this.bindButtonPress('.retry-button', this.restart);
    this.bindButtonPress('.restart-button', this.restart);
    this.bindButtonPress('.keep-playing-button', this.keepPlaying);

    // Les réponses aux événements tactiles de glissement
    var touchStartClientX, touchStartClientY;
    var gameContainer = document.getElementsByClassName('game-container')[0];

    gameContainer.addEventListener(this.eventTouchstart, function (event) {
        if (
            (!window.navigator.msPointerEnabled && event.touches.length > 1) ||
            event.targetTouches > 1
        )
            return; // ignore si "touch" avec plus d'1 doigt

        if (window.navigator.msPointerEnabled) {
            touchStartClientX = event.pageX;
            touchStartClientY = event.pageY;
        } else {
            touchStartClientX = event.touches[0].clientX;
            touchStartClientY = event.touches[0].clientY;
        }

        event.preventDefault();
    });

    /* ajout de plusieurs écouteurs */

    gameContainer.addEventListener(this.eventTouchmove, function (event) {
        event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchend, function (event) {
        if (
            (!window.navigator.msPointerEnabled && event.touches.length > 0) ||
            event.targetTouches > 0
        )
            return; // Ignorer si encore "touch" avec un ou plusieurs doigts

        var touchEndClientX, touchEndClientY;

        if (window.navigator.msPointerEnabled) {
            touchEndClientX = event.pageX;
            touchEndClientY = event.pageY;
        } else {
            touchEndClientX = event.changedTouches[0].clientX;
            touchEndClientY = event.changedTouches[0].clientY;
        }

        var dx = touchEndClientX - touchStartClientX;
        var absDx = Math.abs(dx);

        var dy = touchEndClientY - touchStartClientY;
        var absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) > 10) {
            // (right : left) : (down : up)
            self.emit(
                'move',
                absDx > absDy ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0,
            );
        }
    });
};

/**
 * Envoie l'événement de relance du jeu
 *
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
KeyboardInputManager.prototype.restart = function (event) {
    event.preventDefault();
    this.emit('restart');
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
    event.preventDefault();
    this.emit('keepPlaying');
};

/**
 * lors de l'appui sur une touche écoutée
 *
 * @param  {[type]}   selector [description]
 * @param  {Function} fn       [description]
 * @return {[type]}            [description]
 */
KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
    var button = document.querySelector(selector);
    button.addEventListener('click', fn.bind(this));
    button.addEventListener(this.eventTouchend, fn.bind(this));
};
