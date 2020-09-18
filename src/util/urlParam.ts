export type DefaultConfigObject<T> = {
    [K in keyof T]: (param: Indirect<T>) => T[K];
};

export type Indirect<T> = {
    [K in keyof T]: () => T[K];
};

export let spacelessURL = (location: Location) => {
    let spaceLessURL = location.href.replace(/ |%20/g, '');

    if (spaceLessURL.includes(' ')) throw new Error();

    if (location.href !== spaceLessURL) {
        location.replace(spaceLessURL);
    }

    if (location.href.includes(' ')) throw new Error();
};

export let getUrlParam = <T>(
    location: Location,
    defaultConfig: DefaultConfigObject<T>,
) => {
    let config: T = {} as any;

    let pieceList = location.search.split('?').slice(1);

    let stack = (
        config: T,
        defaultConfig: DefaultConfigObject<T>,
    ): Indirect<T> => {
        let stackedConfig = {} as Indirect<T>;

        Object.keys(defaultConfig).forEach((key) => {
            if (key in config) {
                stackedConfig[key] = () => config[key];
            } else {
                stackedConfig[key] = (conf = defaultConfig) => {
                    return defaultConfig[key](conf);
                };
            }
        });

        return stackedConfig;
    };

    pieceList.forEach((piece) => {
        let key: string;
        let valueList: string[];
        let value;
        if (piece.includes('=')) {
            [key, ...valueList] = piece.split('=');
            value = valueList.join('=');
            if (!isNaN(value)) {
                value = +value;
            }
        } else {
            key = piece;
            value = true;
        }

        config[key] = value;
    });

    Object.keys(defaultConfig).forEach((key) => {
        if (!(key in config)) {
            config[key] = defaultConfig[key](stack(config, defaultConfig));
        }
    });

    return config;
};
