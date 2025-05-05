module.exports = [
    {
        files: ["**/*.js"],
        languageOptions: {
            globals: {
                "jQuery": false,
                "ol": false,
                "iemdata": false,
                "google": false
            }
        }
    }
];
