"use strict";

import RedisClusterClass from "../lib/RedisCluster";

const RedisCluster = new RedisClusterClass({
  Nodes: [
    {
      port: 6379,
      host: "127.0.0.1",
      family: 4,
      db: 0,
    },
    {
      port: 6379,
      host: "127.0.0.1",
      family: 2,
      db: 1,
    },
    {
      port: 6378,
      host: "127.0.0.1",
      family: 4,
      db: 2,
    },
    {
      port: 6379,
      host: "127.0.0.3",
      family: 4,
      db: 3,
    },
    {
      port: 6379,
      host: "127.0.0.1",
      family: 4,
      db: -1,
    },
    {
      port: 6379,
      host: "127.0.0.1",
      family: 4,
      db: 0,
    },
    {
      port: 6379,
      host: "127.0.0.1",
      family: 4,
      db: 1,
    },
    {
      port: 6379,
      host: "127.0.0.1",
      family: 4,
      db: 2,
    },
  ],
});

RedisCluster.set("test", "test", 1000).then((result) => {
  console.log("set: " + result);
});

RedisCluster.get("test").then((result) => {
  console.log("get: " + result);
});

RedisCluster.expireat("test", 1000).then((result) => {
  console.log("expireat: " + result);
});

RedisCluster.del("test").then((result) => {
  console.log("del: " + result);
});

setTimeout(() => {
  RedisCluster.set("test", "test", 1000).then((result) => {
    console.log("set: " + result);
  });

  RedisCluster.get("test").then((result) => {
    console.log("get: " + result);
  });

  RedisCluster.expireat("test", 1000).then((result) => {
    console.log("expireat: " + result);
  });

  RedisCluster.del("test").then((result) => {
    console.log("del: " + result);
  });
}, 1000);
