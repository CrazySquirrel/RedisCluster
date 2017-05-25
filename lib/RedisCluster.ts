"use strict";

/**
 * Require Redis
 */
const redis = require("ioredis");

/**
 * Require additional modules
 */
const MD5 = require("crypto-js/md5");

/**
 * Require redis connection settings scheme
 */
const ConnectionSettingsScheme = require("../schemes/ConnectionSettingsScheme.json");

/**
 * Require redis connection settings interface
 */
import ISettings from "../interfaces/ISettings";

const defaultSettings: ISettings = {
  Nodes: [],
};

export default class RedisCluster {

  private Settings: ISettings;
  private Nodes: any = {};

  private Client: any;
  private Stack: any;

  constructor(Settings: ISettings = defaultSettings) {
    this.Settings = Settings;
    /**
     * Process nodes
     */
    this.Settings.Nodes.forEach((connectionSettings) => {
      /**
       * Normalize nodes
       */
      Object.keys(connectionSettings).forEach((key) => {
        if (!ConnectionSettingsScheme.properties[key]) {
          delete connectionSettings[key];
        } else {
          if (ConnectionSettingsScheme.properties[key].type === "number") {
            if (
                (
                    (
                        typeof ConnectionSettingsScheme.properties[key].enum !== "undefined" &&
                        ConnectionSettingsScheme.properties[key].enum.indexOf(connectionSettings[key]) === -1
                    ) || (
                        typeof ConnectionSettingsScheme.properties[key].minimum !== "undefined" &&
                        connectionSettings[key] < ConnectionSettingsScheme.properties[key].minimum
                    ) || (
                        typeof ConnectionSettingsScheme.properties[key].maximum !== "undefined" &&
                        connectionSettings[key] > ConnectionSettingsScheme.properties[key].maximum
                    )
                ) &&
                typeof ConnectionSettingsScheme.default[key] !== "undefined"
            ) {
              /*console.log([
               ``,
               `The key "${key}" was automatically changed in the settings:`,
               `${JSON.stringify(connectionSettings)}`,
               `from ${connectionSettings[key]} to ${ConnectionSettingsScheme.default[key]}`,
               `because it was invalid according to the rules:`,
               `${JSON.stringify(ConnectionSettingsScheme.properties[key])}`,
               ``,
               ].join("\r\n"));*/
              connectionSettings[key] = ConnectionSettingsScheme.default[key];
            }
          }
        }
      });
      /**
       * Validate nodes
       */
      if (ConnectionSettingsScheme.required.every((key) => typeof connectionSettings[key] !== "undefined")) {
        const connectionSettingsID = MD5(JSON.stringify(connectionSettings)).toString();
        if (!this.Nodes[connectionSettingsID]) {
          this.Nodes[connectionSettingsID] = {
            Stack: [],
            Client: new redis(connectionSettings),
          };

          this.Nodes[connectionSettingsID].set = this._set.bind(this.Nodes[connectionSettingsID]);
          this.Nodes[connectionSettingsID].get = this._get.bind(this.Nodes[connectionSettingsID]);
          this.Nodes[connectionSettingsID].del = this._del.bind(this.Nodes[connectionSettingsID]);
          this.Nodes[connectionSettingsID].expireat = this._expireat.bind(this.Nodes[connectionSettingsID]);

          this.Nodes[connectionSettingsID].Client.on("connect", (e) => {
            if (this.Settings.ConnectHandler) {
              this.Settings.ConnectHandler("connect", connectionSettings, e);
            }
          });

          this.Nodes[connectionSettingsID].Client.on("ready", (e) => {
            const stack = this.Nodes[connectionSettingsID].Stack;

            this.Nodes[connectionSettingsID].Stack = [];

            stack.forEach((action) => {
              switch (action.method) {
                case "set":
                  this.Nodes[connectionSettingsID].set(action.key, action.value, action.time);
                  break;
                case "del":
                  this.Nodes[connectionSettingsID].del(action.key);
                  break;
                case "expireat":
                  this.Nodes[connectionSettingsID].expireat(action.key, action.time);
                  break;
              }
            });

            if (this.Settings.ReadyHandler) {
              this.Settings.ReadyHandler("ready", connectionSettings, e);
            }
          });

          this.Nodes[connectionSettingsID].Client.on("error", (e) => {
            if (this.Settings.ErrorHandler) {
              this.Settings.ErrorHandler("error", connectionSettings, e);
            }
          });

          this.Nodes[connectionSettingsID].Client.on("close", (e) => {
            if (this.Settings.CloseHandler) {
              this.Settings.CloseHandler("close", connectionSettings, e);
            }
          });

          this.Nodes[connectionSettingsID].Client.on("reconnecting", (e) => {
            if (this.Settings.ReconnectingHandler) {
              this.Settings.ReconnectingHandler("reconnecting", connectionSettings, e);
            }
          });

          this.Nodes[connectionSettingsID].Client.on("end", (e) => {
            if (this.Settings.EndHandler) {
              this.Settings.EndHandler("end", connectionSettings, e);
            }
          });
        }
      }
    });
  }

  /**
   * Get nodes
   * @return {any}
   */
  public getNodes(): any {
    return this.Nodes;
  }

  /**
   * Set value
   * @param key
   * @param value
   * @param time
   * @return {Promise<any>}
   */
  public set(key: string, value: any, time: number): Promise<any> {
    if (Object.keys(this.Nodes).length > 0) {
      return Promise.all(Object.keys(this.Nodes).map((ID) => {
        return this.Nodes[ID].set(key, value, time);
      }));
    } else {
      return new Promise((resolve) => {
        resolve([]);
      });
    }
  }

  /**
   * Get value
   * @param key
   * @return {Promise<any>}
   */
  public get(key: string): Promise<any> {
    if (Object.keys(this.Nodes).length > 0) {
      const IDs = Object.keys(this.Nodes);

      let ID = 0;

      const _get = () => {
        return new Promise((resolve, reject) => {
          if (ID < IDs.length) {
            this.Nodes[IDs[ID]].get(key).then(resolve).catch(() => {
              ID++;
              _get().then(resolve).catch(reject);
            });
          } else {
            resolve(null);
          }
        });
      };

      return _get();
    } else {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }

  /**
   * Delete value
   * @param key
   * @return {Promise<any>}
   */
  public del(key: string): Promise<any> {
    if (Object.keys(this.Nodes).length > 0) {
      return Promise.all(Object.keys(this.Nodes).map((ID) => {
        return this.Nodes[ID].del(key);
      }));
    } else {
      return new Promise((resolve) => {
        resolve([]);
      });
    }
  }

  /**
   * Set value expireat
   * @param key
   * @param time
   * @return {Promise<any>}
   */
  public expireat(key: string, time: number): Promise<any> {
    if (Object.keys(this.Nodes).length > 0) {
      return Promise.all(Object.keys(this.Nodes).map((ID) => {
        const now = Math.round(Date.now() / 1000);
        return this.Nodes[ID].expireat(key, now + time);
      }));
    } else {
      return new Promise((resolve) => {
        resolve([]);
      });
    }
  }

  /**
   * Set value
   * @param key
   * @param value
   * @param time
   * @return {Promise<any>}
   */
  private _set(key: string, value: any, time: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.Client.status === "ready") {
        this.Client.set(key, value).then((v) => {
          if (time) {
            const now = Math.round(Date.now() / 1000);
            this.Client.expireat(key, now + time).then(() => resolve(!!v)).catch(reject);
          } else {
            resolve(!!v);
          }
        }).catch(reject);
      } else {
        this.Stack.push({
          method: "set",
          key,
          value,
          time,
        });
        resolve(null);
      }
    });
  }

  /**
   * Get value
   * @param key
   * @return {Promise<any>}
   */
  private _get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.Client.status === "ready") {
        this.Client.get(key).then((v) => {
          if (v === null) {
            reject();
          } else {
            resolve(v);
          }
        }).catch(reject);
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Delete value
   * @param key
   * @return {Promise<any>}
   */
  private _del(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.Client.status === "ready") {
        this.Client.del(key).then((v) => resolve(!!v)).catch(reject);
      } else {
        this.Stack.push({
          method: "del",
          key,
        });
        resolve(null);
      }
    });
  }

  /**
   * Set value expireat
   * @param key
   * @param time
   * @return {Promise<any>}
   */
  private _expireat(key: string, time: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.Client.status === "ready") {
        const now = Math.round(Date.now() / 1000);
        this.Client.expireat(key, now + time).then(() => resolve(true)).catch(reject);
      } else {
        this.Stack.push({
          method: "expireat",
          key,
          time,
        });
        resolve(null);
      }
    });
  }
}

module.exports = RedisCluster;
