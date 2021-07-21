const path = require("path");

console.clear();

module.exports = function (env, argv) {
  const environment = env && env.production ? "production" : "development";
  console.log("Building for " + environment);
  return [
    // client + lib
    {
      entry: path.resolve(__dirname, "./client/index.tsx"),
      mode: environment,
      devtool: "eval-source-map",
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
    },
    // server lib (only)
    {
      entry: path.resolve(__dirname, "./server/lib/index.ts"),
      mode: environment,
      target: "node",
      devtool: false,
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
