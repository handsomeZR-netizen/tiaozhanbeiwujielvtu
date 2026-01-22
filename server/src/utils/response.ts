export const ok = <T>(data: T) => ({ ok: true, data });
export const fail = (message: string) => ({ ok: false, error: message });
