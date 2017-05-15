"use strict";

/**
 * Require Redis
 */
const redis = require("ioredis");

declare let describe: any;
declare let it: any;
declare let expect: any;

import RedisCluster from "../lib/RedisCluster";

const CorruptedConnectionSettings: any = [
  {
    host: "127.0.0.1",
    family: 4,
    db: 0,
    PORT: 0,
  },
  {
    port: "6379",
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
];

const NormalConnectionSettings: any = [
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
];

const Clients: any = [];

NormalConnectionSettings.forEach((settings) => {
  Clients.push(new redis(settings));
});

describe("RedisCluster", () => {

  const key = Math.random().toString(36).replace(/[^a-z]+/g, "");
  const values = Math.random().toString(36).replace(/[^a-z]+/g, "");
  const time = 1000;

  const set = (RedisClusterClient, count) => {
    return new Promise((resolve, reject) => {
      RedisClusterClient.set(key, values, time).then((result) => {
        expect(typeof(result)).toEqual("object", "Set: result not an object");
        expect(Array.isArray(result)).toEqual(true, "Set: result not an array");
        expect((
            result.length === count &&
            result.every((r) => r)
        )).toEqual(true, "Set: all result values not equal to true");

        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const get = (RedisClusterClient, count) => {
    return new Promise((resolve, reject) => {
      RedisClusterClient.get(key).then((result) => {
        if (count > 0) {
          expect(result).toEqual(values, "Get: result not equal to value");
        } else {
          expect(result).toEqual(null, "Get: result not equal to value");
        }
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const del = (RedisClusterClient, count) => {
    return new Promise((resolve, reject) => {
      RedisClusterClient.del(key).then((result) => {
        expect(typeof(result)).toEqual("object", "Del: result not an object");
        expect(Array.isArray(result)).toEqual(true, "Del: result not an array");
        expect((
            result.length === count &&
            result.every((r) => r)
        )).toEqual(true, "Del: all result values not equal to true");

        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const expireat = (RedisClusterClient, count) => {
    return new Promise((resolve, reject) => {
      RedisClusterClient.expireat(key, time).then((result) => {
        expect(typeof(result)).toEqual("object", "Expireat: result not an object");
        expect(Array.isArray(result)).toEqual(true, "Expireat: result not an array");
        expect((
            result.length === count &&
            result.every((r) => r)
        )).toEqual(true, "Expireat: all result values not equal to true");

        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const process = (promises) => {
    return new Promise((resolve, reject) => {
      if (promises.length > 0) {
        promises.shift().then(() => {
          process(promises).then(resolve).catch(reject);
        }).catch(reject);
      } else {
        resolve();
      }
    });
  };

  it("RedisCluster class exist", () => {
    expect(typeof(RedisCluster)).toEqual("function", "RedisCluster not a constructor");
    expect(typeof(new RedisCluster())).toEqual("object", "RedisCluster not a constructor");
  });

  it("RedisCluster correctly handle empty input parameters", (done) => {
    const RedisClusterClient = new RedisCluster();
    expect(typeof(RedisClusterClient.getActiveClients())).toEqual("object");
    expect(Array.isArray(RedisClusterClient.getActiveClients())).toEqual(true);
    expect(RedisClusterClient.getActiveClientsCount()).toEqual(0);

    process([
      set(RedisClusterClient, 0),
      get(RedisClusterClient, 0),
      set(RedisClusterClient, 0),
      del(RedisClusterClient, 0),
      set(RedisClusterClient, 0),
      expireat(RedisClusterClient, 0),
    ]).then(done).catch(done);
  });

  it("RedisCluster correctly handles corrupted input parameters", (done) => {
    const RedisClusterClient = new RedisCluster(CorruptedConnectionSettings);
    expect(typeof(RedisClusterClient.getActiveClients())).toEqual("object");
    expect(Array.isArray(RedisClusterClient.getActiveClients())).toEqual(true);
    expect(RedisClusterClient.getActiveClientsCount()).toEqual(CorruptedConnectionSettings.length - 1);

    process([
      set(RedisClusterClient, CorruptedConnectionSettings.length - 1),
      get(RedisClusterClient, CorruptedConnectionSettings.length - 1),
      set(RedisClusterClient, CorruptedConnectionSettings.length - 1),
      del(RedisClusterClient, CorruptedConnectionSettings.length - 1),
      set(RedisClusterClient, CorruptedConnectionSettings.length - 1),
      expireat(RedisClusterClient, CorruptedConnectionSettings.length - 1),
    ]).then(done).catch(done);
  });

  it("RedisCluster correctly handles normal input parameters", (done) => {
    const RedisClusterClient = new RedisCluster(NormalConnectionSettings);
    expect(typeof(RedisClusterClient.getActiveClients())).toEqual("object");
    expect(Array.isArray(RedisClusterClient.getActiveClients())).toEqual(true);
    expect(RedisClusterClient.getActiveClientsCount()).toEqual(NormalConnectionSettings.length);

    process([
      set(RedisClusterClient, NormalConnectionSettings.length),
      get(RedisClusterClient, NormalConnectionSettings.length),
      set(RedisClusterClient, NormalConnectionSettings.length),
      del(RedisClusterClient, NormalConnectionSettings.length),
      set(RedisClusterClient, NormalConnectionSettings.length),
      expireat(RedisClusterClient, NormalConnectionSettings.length),
    ]).then(done).catch(done);
  });

  it("RedisCluster correctly handles db error", (done) => {
    const RedisClusterClient = new RedisCluster(NormalConnectionSettings);

    process([
      set(RedisClusterClient, NormalConnectionSettings.length - 1),
      get(RedisClusterClient, NormalConnectionSettings.length - 1),
      set(RedisClusterClient, NormalConnectionSettings.length - 1),
      del(RedisClusterClient, NormalConnectionSettings.length - 1),
      set(RedisClusterClient, NormalConnectionSettings.length - 1),
      expireat(RedisClusterClient, NormalConnectionSettings.length - 1),
    ]).then(done).catch(done);
  });

  it("RedisCluster correctly handles db reconnection", (done) => {
    const RedisClusterClient = new RedisCluster(NormalConnectionSettings);

    process([
      set(RedisClusterClient, NormalConnectionSettings.length),
      get(RedisClusterClient, NormalConnectionSettings.length),
      set(RedisClusterClient, NormalConnectionSettings.length),
      del(RedisClusterClient, NormalConnectionSettings.length),
      set(RedisClusterClient, NormalConnectionSettings.length),
      expireat(RedisClusterClient, NormalConnectionSettings.length),
    ]).then(done).catch(done);
  });
});
