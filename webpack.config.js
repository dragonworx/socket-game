const webpack = require("webpack");
const path = require("path");

console.clear();

module.exports = function (env, argv) {
  const environment = env && env.production ? "production" : "development";
  console.log("Building for " + environment.toUpperCase());
  return [
    // client + lib
    {
      entry: path.resolve(__dirname, "./client/index.tsx"),
      mode: environment,
      devtool: false,
      plugins: [new webpack.SourceMapDevToolPlugin({})],
      module: {
        rules: [
          {
            test: /\.ts(x?)$/,
            use: "ts-loader",
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js"],
      },
      output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "public"),
        libraryTarget: "umd",
      },
      //   performance: {
      //     hints: false,
      //   },
    },
    // server lib (only)
    {
      entry: path.resolve(__dirname, "./server/lib/index.ts"),
      mode: environment,
      target: "node",
      devtool: false,
      plugins: [new webpack.SourceMapDevToolPlugin({})],
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: "ts-loader",
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: [".ts", ".js"],
      },
      output: {
        filename: "index.js",
        path: path.resolve(__dirname, "server/dist"),
        libraryTarget: "umd",
      },
      externals: {
        bufferutil: "bufferutil",
        "utf-8-validate": "utf-8-validate",
      },
    },
  ];
};
