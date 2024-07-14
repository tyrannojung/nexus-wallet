export function bufferToBase64URLString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const str = String.fromCharCode.apply(null, bytes as unknown as number[]);

  const base64String = btoa(str);

  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
