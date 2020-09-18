/**

  The Initial Developer of the Original Code is
  Matthieu  - http://www.programmation-facile.com/
  Portions created by the Initial Developer are Copyright (C) 2013
  the Initial Developer. All Rights Reserved.

  Contributor(s) :

 */

import { GameManager } from './game_manager';
import { HTMLActuator } from './html_actuator';
import { KeyboardInputManager } from './keyboard_input_manager';
import { LocalStorageManager } from './local_storage_manager';

document.addEventListener('DOMContentLoaded', Main, false); // appel au chargement de la page

/**
 * Fonction principale
 * Appelée au chargement de la page
 *
 */
function Main() {
    console.log('Main 2048 Game');

    // lancement du jeu
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
}
