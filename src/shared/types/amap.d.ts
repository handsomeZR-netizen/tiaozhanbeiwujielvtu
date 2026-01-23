export {};

declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string };
    AMap?: any;
  }
}
