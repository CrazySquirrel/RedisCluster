"use strict";
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
/**
 * Export the redis connection scheme interface
 */
export default IConnectionSettings;
