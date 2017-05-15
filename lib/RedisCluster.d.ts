/**
 * Require redis connection settings interface
 */
import IConnectionSettings from "../interfaces/IConnectionSettings";
export default class RedisCluster {
    private clients;
    constructor(connectionSettings?: IConnectionSettings[]);
    /**
     * Get active clients count
     * @return {any}
     */
    getActiveClientsCount(): number;
    /**
     * Get active clients
     * @return {any[]}
     */
    getActiveClients(): any;
    /**
     * Set value
     * @param key
     * @param value
     * @param time
     * @return {Promise<any>}
     */
    set(key: string, value: any, time: number): Promise<any>;
    /**
     * Get value
     * @param key
     * @return {Promise<any>}
     */
    get(key: string): Promise<any>;
    /**
     * Delete value
     * @param key
     * @return {Promise<any>}
     */
    del(key: string): Promise<any>;
    /**
     * Set value expireat
     * @param key
     * @param time
     * @return {Promise<any>}
     */
    expireat(key: string, time: number): Promise<any>;
    /**
     * Prepare connection settings
     * @param _connectionSettings
     * @param connectionSetting
     * @return {any}
     */
    private prepareConnectionSettings(_connectionSettings, connectionSetting);
}
