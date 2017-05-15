"use strict";

const StringReplacePlugin = require("string-replace-webpack-plugin");

const WebpackNotifierPlugin = require("webpack-notifier");

const path = require("path");

const webpack = require("webpack");

const fs = require("fs");

const crypto = require("crypto");

const packagenpm = require("./package.json");

/**
 * Plugins list
 */
let arrPlugins = [
  new WebpackNotifierPlugin(),
  new StringReplacePlugin()
];

/**
 * Add additional plugins
 */
arrPlugins.push(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": "test"
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
  entry: {
    "./spec/RedisCluster.spec": ["./spec/RedisCluster.spec.ts"]
  },
  target: "node",
  output: {
    filename: "[name].js",
    library: "RedisCluster",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  externals: {
    "RedisCluster": "RedisCluster"
  },
  devtool: "inline-source-map",
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
        include: [
          path.resolve(__dirname, "lib")
        ],
        use: [
          {
            loader: replacements
          },
          {
            loader: "babel-loader",
            options: {
              presets: ["es2015"],
              plugins: ["istanbul"]
            }
          },
          {
            loader: "ts-loader"
          }
        ]
      },
      {
        test: /\.ts(x?)$/,
        exclude: [
          path.resolve(__dirname, "lib")
        ],
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