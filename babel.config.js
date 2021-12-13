module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);

  let cfg = ['@babel/preset-env', {bugfixes: true}];
  if (process.env.NODE_ENV === 'test') {
    cfg = [
      '@babel/preset-env',
      {
        targets: {
          node: true,
        },
      },
    ];
  }
  return {
    presets: [cfg],
    plugins: [
      [
        '@babel/plugin-transform-typescript',
        {
          // force typescript to support jsx in all files no matter the extension I guess
          isTSX: true,
          allExtensions: true,
          allowDeclareFields: true,
          onlyRemoveTypeImports: true,
        },
      ],
    ],
    ignore:
      process.env.NODE_ENV !== 'test'
        ? ['src/__tests__/*.js', 'src/__tests__/*.tsx']
        : [],
  };
};
