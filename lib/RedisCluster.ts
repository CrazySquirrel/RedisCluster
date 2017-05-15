"use strict";

/**
 * Require Redis
 */
const redis = require("ioredis");

/**
 * Require redis connection settings scheme
 */
const ConnectionSettingsScheme = require("../schemes/ConnectionSettingsScheme.json");

/**
 * Require redis connection settings interface
 */
import IConnectionSettings from "../interfaces/IConnectionSettings";

export default class RedisCluster {

  private clients: any[] = [];

  constructor(connectionSettings: IConnectionSettings[] = []) {
    this.clients = connectionSettings.reduce(this.prepareConnectionSettings, []);
  }

  /**
   * Get active clients count
   * @return {any}
   */
  public getActiveClientsCount(): number {
    return this.getActiveClients().length;
  }

  /**
   * Get active clients
   * @return {any[]}
   */
  public getActiveClients(): any {
    return this.clients;
  }

  /**
   * Set value
   * @param key
   * @param value
   * @param time
   * @return {Promise<any>}
   */
  public set(key: string, value: any, time: number): Promise<any> {
    if (this.getActiveClientsCount() > 0) {
      const now = Math.round(Date.now() / 1000);
      return Promise.all(this.getActiveClients().map((client) => {
        return client.set(key, value).then(() => {
          return client.expireat(key, now + time).then((result) => {
            return !!result;
          });
        });
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
    if (this.getActiveClientsCount() > 0) {
      const clients = this.getActiveClients();

      let ID = 0;

      const _get = () => {
        return new Promise((resolve, reject) => {
          if (clients[ID]) {
            clients[ID].get(key).then(resolve).catch(() => {
              ID++;
              _get().then(resolve).catch(reject);
            });
          } else {
            reject();
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
    if (this.getActiveClientsCount() > 0) {
      return Promise.all(this.getActiveClients().map((client) => {
        return client.del(key);
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
    if (this.getActiveClientsCount() > 0) {
      const now = Math.round(Date.now() / 1000);
      return Promise.all(this.getActiveClients().map((client) => {
        return client.expireat(key, now + time).then((result) => {
          return !!result;
        });
      }));
    } else {
      return new Promise((resolve) => {
        resolve([]);
      });
    }
  }

  /**
   * Prepare connection settings
   * @param _connectionSettings
   * @param connectionSetting
   * @return {any}
   */
  private prepareConnectionSettings(_connectionSettings: IConnectionSettings[] = [],
                                    connectionSetting: IConnectionSettings): IConnectionSettings[] {
    /**
     * Merge settings and default values
     */
    const _connectionSetting = Object.assign(
        ConnectionSettingsScheme.default,
        connectionSetting,
    );
    /**
     * Filter settings properties
     */
    Object.keys(_connectionSetting).forEach((key) => {
      if (!ConnectionSettingsScheme.properties[key]) {
        delete _connectionSetting[key];
      }
    });
    /**
     * Return new client
     */
    try {
      return [..._connectionSettings, new redis(_connectionSetting)];
    } catch (e) {
      return _connectionSettings;
    }
  }
}

module.exports = RedisCluster;
