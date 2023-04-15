module.exports = function (api) {
    const isServer = api.caller((caller) => caller?.isServer);
    const isCallerDevelopment = api.caller((caller) => caller?.isDev);

    // пресеты
    const presets = [
        [
            'next/babel',
            {
                'preset-react': {
                    runtime: 'automatic',
                    importSource:
                        // код wdyr должен выполняться только на клиенте
                        // и только в режиме разработки
                        !isServer && isCallerDevelopment
                            ? '@welldone-software/why-did-you-render'
                            : 'react',
                },
            },
        ],
    ];

    // плагины
    const plugins = [
        [
            'babel-plugin-import',
            {
                libraryName: '@mui/material',
                libraryDirectory: '',
                camel2DashComponentName: false,
            },
            'core'
        ],
    ]

    return { presets, plugins }
};
