import { PublicKeyCredentialJSON } from '../types';
import { jsonToPublicKeyCredential } from '../utils';

const jsonData: PublicKeyCredentialJSON = {
  id: 'nDDNE7quoOZkNCXZVFrtktn5E70',
  type: 'public-key',
  rawId: 'nDDNE7quoOZkNCXZVFrtktn5E70',
  response: {
    attestationObject:
      'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViYxxjSJVysbHKEQ7-j9MovSS7Wy0wXZ8aIpuqTfnHDb2RdAAAAAPv8MAcVTk7MjAtuAgVX170AFJwwzRO6rqDmZDQl2VRa7ZLZ-RO9pQECAyYgASFYIEDlgEIpUNT-nd2taXjxQHS0FGvYr2WZVADee0A4syDOIlggHn-B_3-nq9nCYEFHw-vluLgQaDwJmh2ZiB0S9KY7gB0',
    clientDataJSON:
      'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiQVFJREJBIiwib3JpZ2luIjoiaHR0cHM6Ly9uZXh1cy13YWxsZXQuY29tIiwiY3Jvc3NPcmlnaW4iOmZhbHNlLCJvdGhlcl9rZXlzX2Nhbl9iZV9hZGRlZF9oZXJlIjoiZG8gbm90IGNvbXBhcmUgY2xpZW50RGF0YUpTT04gYWdhaW5zdCBhIHRlbXBsYXRlLiBTZWUgaHR0cHM6Ly9nb28uZ2wveWFiUGV4In0',
    transports: ['hybrid', 'internal'],
  },
  authenticatorAttachment: 'cross-platform',
  clientExtensionResults: {
    largeBlob: {
      supported: true,
    },
  },
};

export const mockCredential = jsonToPublicKeyCredential(jsonData);
