// vue.config.js
module.exports = {
    devServer: {
        overlay: {
            warnings: true,
            errors: true
        }
    },
    css: {
        loaderOptions: {
            sass: {
                additionalData: `@import "@/assets/scss/main.scss";`
            }
        }
    }
};
