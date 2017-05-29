/**
 * The redis connection scheme interface
 */
interface IConnectionSettings {
    port: number;
    host: string;
    name?: string;
    password?: string;
    family: number;
    db: number;
    showFriendlyErrorStack?: boolean;
}
export default IConnectionSettings;
