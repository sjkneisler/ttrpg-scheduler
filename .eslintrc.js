module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": ["airbnb", "airbnb-typescript"],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": './tsconfig.json',
    },
    "plugins": [
        "react",
        "@emotion"
    ],
    "rules": {
        "react/no-unknown-property": ["error", { "ignore": ["css"] }],
        "import/prefer-default-export": "off",
        "react/function-component-definition": "off",
    },
    settings: {
        failOnError: false,
        emitWarning: true,
    }
}
