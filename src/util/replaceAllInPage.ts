import { replaceAllFromNode } from 'replace-all-text-nodes';

export let replaceAllInPage = (replaceFn) => {
    document.title = replaceFn(document.title);
    replaceAllFromNode(document.body, replaceFn);
};
