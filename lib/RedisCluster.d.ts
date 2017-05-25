/**
 * Require redis connection settings interface
 */
import ISettings from "../interfaces/ISettings";
export default class RedisCluster {
    private Settings;
    private Nodes;
    private Client;
    private Stack;
    constructor(Settings?: ISettings);
    /**
     * Get nodes
     * @return {any}
     */
    getNodes(): any;
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
     * Set value
     * @param key
     * @param value
     * @param time
     * @return {Promise<any>}
     */
    private _set(key, value, time);
    /**
     * Get value
     * @param key
     * @return {Promise<any>}
     */
    private _get(key);
    /**
     * Delete value
     * @param key
     * @return {Promise<any>}
     */
    private _del(key);
    /**
     * Set value expireat
     * @param key
     * @param time
     * @return {Promise<any>}
     */
    private _expireat(key, time);
}
