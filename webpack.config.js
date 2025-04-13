const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    entry: {
        background: "./extension/js/background.js",
        contentScript: "./extension/js/contentScript.js",
        popup: "./extension/js/popup.js",
        settings: "./extension/js/settings.js",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "js/[name].js",
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "extension/manifest.json", to: "manifest.json" },
                { from: "extension/assets", to: "assets" },
            ],
        }),
        new HtmlWebpackPlugin({
            template: "./extension/html/popup.html",
            filename: "html/popup.html",
            chunks: ["popup"],
        }),
        new HtmlWebpackPlugin({
            template: "./extension/html/settings.html",
            filename: "html/settings.html",
            chunks: ["settings"],
        }),
        // Provide polyfills for Node.js core modules
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
    ],
    resolve: {
        fallback: {
            fs: false,
            path: require.resolve("path-browserify"),
            buffer: require.resolve("buffer/"),
            process: require.resolve("process/browser"),
        },
    },
};
