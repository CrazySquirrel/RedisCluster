"use strict";

import RedisClusterClass from "../lib/RedisCluster";

new RedisClusterClass([
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
]);
