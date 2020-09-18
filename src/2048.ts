import { replaceAllInPage } from './util/replaceAllInPage';
import { getUrlParam, spacelessURL } from './util/urlParam';

import { githubCornerHTML } from './lib/githubCorner';
import { repository } from '../package.json';

export function getFormatValue() {
    spacelessURL(location);

    let config = getUrlParam(location, {
        game: () => 'v2048',
        default: () => '1',
    });

    let corner = document.createElement('i');
    corner.innerHTML = githubCornerHTML(repository);
    document.body.append(corner);

    let userFunctionString = config.game;
    let userFunction: EvalableFunction = eval(`({
        n, v2048, get,
    }) => ${userFunctionString}`);
    let w: any = window;
    w.userFunction = userFunction;

    let defaultValue = eval(`${config.default}`);

    let allPossibleValues = Array.from({ length: 19 }, () => defaultValue);

    allPossibleValues.forEach((_, n) => {
        let value = config[`${n}`];
        if (value === undefined) {
            value = userFunction({
                n,
                v2048: 2 ** n,
                get: (diff) => allPossibleValues[n + diff] ?? defaultValue,
            });
        }
        allPossibleValues[n] = value;
    });

    replaceAllInPage((text) => text.replace('2048', allPossibleValues[11]));

    return function formatValue(value: number): string {
        let index = Math.round(Math.log(value) / Math.log(2));
        return '' + allPossibleValues[index];
    };
}

export type EvalableFunction = (obj: ValueContext) => unknown;

interface ValueContext {
    n: number;
    v2048: number;
    get: (n: number) => number;
}
