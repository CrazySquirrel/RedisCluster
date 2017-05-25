"use strict";
import IConnectionSettings from "./IConnectionSettings";
/**
 * The redis settings scheme interface
 */
interface ISettings {
  ConnectHandler?: (id: string, data: any, e: any) => void;
  ReadyHandler?: (id: string, data: any, e: any) => void;
  ErrorHandler?: (id: string, data: any, e: any) => void;
  CloseHandler?: (id: string, data: any, e: any) => void;
  ReconnectingHandler?: (id: string, data: any, e: any) => void;
  EndHandler?: (id: string, data: any, e: any) => void;
  Nodes: IConnectionSettings[];
}
/**
 * Export the redis settings scheme interface
 */
export default ISettings;
