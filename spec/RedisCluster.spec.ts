"use strict";

/**
 * Require Redis
 */
const redis = require("ioredis");

const exec = require("child_process").exec;

declare let describe: any;
declare let it: any;
declare let expect: any;

import RedisCluster from "../lib/RedisCluster";

const CorruptedConnectionSettings: any = {
  ConnectHandler: (id: string, data: any, e: any) => {
  },
  ReadyHandler: (id: string, data: any, e: any) => {
  },
  ErrorHandler: (id: string, data: any, e: any) => {
  },
  CloseHandler: (id: string, data: any, e: any) => {
  },
  ReconnectingHandler: (id: string, data: any, e: any) => {
  },
  EndHandler: (id: string, data: any, e: any) => {
  },
  Nodes: [
    {
      test: false,
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
      port: 32772,
      host: "127.0.0.1",
      family: 4,
      db: 0,
    },
    {},
  ],
};

const NormalConnectionSettings: any = {
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
      family: 4,
      db: 1,
    },
    {
      port: 32772,
      host: "127.0.0.1",
      family: 4,
      db: 0,
    },
  ],
};

describe("RedisCluster", () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

  const key = Math.random().toString(36).replace(/[^a-z]+/g, "");
  const values = Math.random().toString(36).replace(/[^a-z]+/g, "");
  const time = 1000;

  const set = (RedisClusterClient, count, flag) => {
    return new Promise((resolve, reject) => {
      RedisClusterClient.set(key, values, time).then((result) => {
        expect(typeof(result)).toEqual("object", "Set: result not an object");
        expect(Array.isArray(result)).toEqual(true, "Set: result not an array");
        expect((
            result.filter((v) => v !== null).length === count &&
            (
                count === 0 ||
                (
                    result.every((r) => (!!r || r === null)) &&
                    (flag || result.some((r) => !!r))
                )
            )
        )).toEqual(true, "Set: all result values not equal to true");

        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const set2 = (RedisClusterClient, count, flag) => {
    return new Promise((resolve, reject) => {
      RedisClusterClient.set(key, values).then((result) => {
        expect(typeof(result)).toEqual("object", "Set: result not an object");
        expect(Array.isArray(result)).toEqual(true, "Set: result not an array");
        expect((
            result.filter((v) => v !== null).length === count &&
            (
                count === 0 ||
                (
                    result.every((r) => (!!r || r === null)) &&
                    (flag || result.some((r) => !!r))
                )
            )
        )).toEqual(true, "Set: all result values not equal to true");

        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const get = (RedisClusterClient, count, flag) => {
    return new Promise((resolve, reject) => {
      RedisClusterClient.get(key).then((result) => {
        if (count > 0) {
          expect((result === values) || (flag && result === null)).toEqual(true, "Get: result not equal to value");
        } else {
          expect(result === null).toEqual(true, "Get: result not equal to value");
        }
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const get2 = (RedisClusterClient, count, flag) => {
    return new Promise((resolve, reject) => {
      RedisClusterClient.get("").then((result) => {
        expect(result === null).toEqual(true, "Get: result not equal to value");
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const del = (RedisClusterClient, count, flag) => {
    return new Promise((resolve, reject) => {
      RedisClusterClient.del(key).then((result) => {
        expect(typeof(result)).toEqual("object", "Del: result not an object");
        expect(Array.isArray(result)).toEqual(true, "Del: result not an array");
        expect((
            result.filter((v) => v !== null).length === count &&
            (
                count === 0 ||
                (
                    result.every((r) => (!!r || r === null)) &&
                    (flag || result.some((r) => !!r))
                )
            )
        )).toEqual(true, "Del: all result values not equal to true");

        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const expireat = (RedisClusterClient, count, flag) => {
    return new Promise((resolve, reject) => {
      RedisClusterClient.expireat(key, time).then((result) => {
        expect(typeof(result)).toEqual("object", "Expireat: result not an object");
        expect(Array.isArray(result)).toEqual(true, "Expireat: result not an array");
        expect((
            result.filter((v) => v !== null).length === count &&
            (
                count === 0 ||
                (
                    result.every((r) => (!!r || r === null)) &&
                    (flag || result.some((r) => !!r))
                )
            )
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

  const test = (RedisClusterClient, done, flag) => {
    process([
      set(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, true),
      get(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, true),
      set(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, true),
      get2(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, true),
      set(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, true),
      del(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, true),
      set2(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, true),
      expireat(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, true),
    ]);

    if (flag) {
      setTimeout(() => {
        process([
          set(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, false),
          get(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, false),
          set(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, false),
          get2(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, true),
          set(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, true),
          del(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, false),
          set2(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, false),
          expireat(RedisClusterClient, Object.keys(RedisClusterClient.getActiveNodes()).length, false),
        ]).then(done).catch(done);
      }, 5000);
    } else {
      done();
    }
  };

  it("RedisCluster class exist", (done) => {
    exec("npm run redis");
    setTimeout(() => {
      expect(typeof(RedisCluster)).toEqual("function", "RedisCluster not a constructor");
      expect(typeof(new RedisCluster())).toEqual("object", "RedisCluster not a constructor");
      done();
    }, 5000);
  });

  it("RedisCluster correctly handle empty input parameters", (done) => {
    exec("npm run redis");
    setTimeout(() => {
      const RedisClusterClient = new RedisCluster();
      expect(typeof(RedisClusterClient.getNodes())).toEqual("object");
      expect(Object.keys(RedisClusterClient.getNodes()).length).toEqual(0);
      test(RedisClusterClient, done, true);
    }, 5000);
  });

  it("RedisCluster correctly handles corrupted input parameters", (done) => {
    exec("npm run redis");
    setTimeout(() => {
      const RedisClusterClient = new RedisCluster(CorruptedConnectionSettings);
      expect(typeof(RedisClusterClient.getNodes())).toEqual("object");
      test(RedisClusterClient, done, true);
    }, 5000);
  });

  it("RedisCluster correctly handles normal input parameters", (done) => {
    exec("npm run redis");
    setTimeout(() => {
      const RedisClusterClient = new RedisCluster(NormalConnectionSettings);
      expect(typeof(RedisClusterClient.getNodes())).toEqual("object");
      test(RedisClusterClient, done, true);
    }, 5000);
  });

  it("RedisCluster correctly handles db error", (done) => {
    exec("redis-cli shutdown");
    setTimeout(() => {
      const RedisClusterClient = new RedisCluster(NormalConnectionSettings);
      expect(typeof(RedisClusterClient.getNodes())).toEqual("object");
      test(RedisClusterClient, done, false);
    }, 5000);
  });

  it("RedisCluster correctly handles db reconnection", (done) => {
    exec("npm run redis");
    setTimeout(() => {
      const RedisClusterClient = new RedisCluster(NormalConnectionSettings);
      expect(typeof(RedisClusterClient.getNodes())).toEqual("object");
      test(RedisClusterClient, done, false);
    }, 5000);
  });
});
