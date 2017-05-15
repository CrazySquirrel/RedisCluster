"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

const MODE = NODE_ENV.split(":")[0];

const MODE_2 = NODE_ENV.split(":")[1];

const StringReplacePlugin = require("string-replace-webpack-plugin");

const WebpackNotifierPlugin = require("webpack-notifier");

const path = require("path");

const webpack = require("webpack");

const fs = require("fs");

const crypto = require("crypto");

const packagenpm = require("./package.json");

const BundleAnalyzerPlugin = require(
    "webpack-bundle-analyzer"
).BundleAnalyzerPlugin;

let objBuildList = {};

/**
 * Templates
 */
objBuildList = Object.assign(
    objBuildList,
    {
      "./lib/RedisCluster": ["./lib/RedisCluster.ts"]
    }
);

if (MODE_2 !== "stat") {
  objBuildList = Object.assign(
      objBuildList,
      {
        "./src/RedisCluster": ["./src/RedisCluster.ts"]
      }
  );
}

/**
 * Plugins list
 */
let arrPlugins = [
  new WebpackNotifierPlugin(),
  new StringReplacePlugin()
];
/**
 * Add BrowserSync for development mode
 */
if (MODE_2 === "stat") {
  arrPlugins.push(
      new BundleAnalyzerPlugin()
  );
}
/**
 * Add additional plugins
 */
arrPlugins.push(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(MODE)
    })
);

let replacements = StringReplacePlugin.replace({
  replacements: [
    {
      pattern: /#HASH#/gi,
      replacement: () => {
        return crypto.createHash("md5").update(
            (new Date()).getTime().toString()).digest("hex");
      }
    },
    {
      pattern: /#PACKAGE_NAME#/gi,
      replacement: () => {
        return packagenpm.name;
      }
    },
    {
      pattern: /#PACKAGE_VERSION#/gi,
      replacement: () => {
        return packagenpm.version;
      }
    }
  ]
});

module.exports = {
  entry: objBuildList,
  target: "node",
  output: {
    filename: MODE === "production" ? "[name].js" : "[name].js",
    library: "RedisCluster",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  externals: {
    "RedisCluster": "RedisCluster"
  },
  devtool: (
      MODE === "development" ? "inline-source-map" : (
          MODE === "testing" ? "inline-source-map" : ""
      )
  ),
  plugins: arrPlugins,
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },
  resolveLoader: {
    extensions: [".js", ".ts", ".jsx", ".tsx"]
  },
  module: {
    loaders: [
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: replacements
          },
          {
            loader: "babel-loader",
            options: {
              presets: ["es2015"]
            }
          },
          {
            loader: "ts-loader"
          }
        ]
      },
      {
        test: /\.json$/,
        use: "json-loader"
      }
    ]
  }
};