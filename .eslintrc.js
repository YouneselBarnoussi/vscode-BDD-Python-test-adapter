module.exports = {
    env: {
        es2021: true
    },
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/array-type': ['error'],
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/explicit-function-return-type': ['warn', {
            allowExpressions: true,
        }],
        '@typescript-eslint/member-delimiter-style': ['error'],
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-useless-constructor': 'error',
        '@typescript-eslint/type-annotation-spacing': ['error'],
        '@typescript-eslint/typedef': ['error', {
            arrowParameter: true,
            propertyDeclaration: true,
            variableDeclarationIgnoreFunction: true,
        }],
        '@typescript-eslint/unified-signatures': ['error'],

        'array-bracket-spacing': ['error', 'never'],
        'arrow-body-style': 'off',

        'ban-ts-comment': 'off',

        camelcase: 'off',
        'class-methods-use-this': 'off',

        'eol-last': 'error',

        'generator-star-spacing': 'off',
        'global-require': 'warn',
        'guard-for-in': 'error',

        'import/extensions': 'off',
        'import/named': 'off',
        'import/no-cycle': 'off',
        'import/no-duplicates': 'off',
        indent: [
            'error',
            4,
            {
                SwitchCase: 1,
            },
        ],

        'lines-between-class-members': ['error', 'always', {
            exceptAfterSingleLine: true,
        }],
        'max-classes-per-file': 'off',
        'max-len': 'off',
        'multiline-comment-style': 'error',

        'no-alert': 'off',
        'no-await-in-loop': 'off',
        'no-continue': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-fallthrough': 'off',
        'no-new': 'off',
        'no-param-reassign': ['warn', {props: false}],
        'no-plusplus': 'off',
        'no-restricted-syntax': 'off',
        'no-return-assign': ['warn', 'except-parens'],
        'no-trailing-spaces': 'error',
        'no-underscore-dangle': 'off',
        'no-use-before-define': 'off',
        'no-useless-constructor': 'off',
        'no-shadow': 'off',

        'object-curly-newline': ['error', {
            ImportDeclaration: 'never',
        }],
        'object-curly-spacing': ['error', 'never'],

        'prefer-destructuring': ['error', {
            array: false,
            object: true,
        }],

        semi: ['error', 'always'],
        'sort-imports': 'error',
    }
};
