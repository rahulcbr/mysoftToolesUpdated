import * as PDFLib from "pdf-lib";
import { decryptPDF as originalDecryptPDF } from "@pdfsmaller/pdf-decrypt";

const {
  PDFDocument,
  PDFName,
  PDFHexString,
  PDFString,
  PDFDict,
  PDFArray,
  PDFRawStream,
  PDFRef,
  PDFObjectStreamParser,
  PDFParser,
  ParseSpeeds
} = PDFLib as any;

// Standard PDF padding string
const PADDING = new Uint8Array([
  0x28, 0xBF, 0x4E, 0x5E, 0x4E, 0x75, 0x8A, 0x41,
  0x64, 0x00, 0x4E, 0x56, 0xFF, 0xFA, 0x01, 0x08,
  0x2E, 0x2E, 0x00, 0xB6, 0xD0, 0x68, 0x3E, 0x80,
  0x2F, 0x0C, 0xA9, 0xFE, 0x64, 0x53, 0x69, 0x7A
]);

export function patchObjStmBytes(bytes: Uint8Array): Uint8Array {
  const patched = new Uint8Array(bytes);
  for (let i = 0; i < patched.length - 6; i++) {
    if (
      patched[i] === 47 && // '/'
      patched[i+1] === 79 && // 'O'
      patched[i+2] === 98 && // 'b'
      patched[i+3] === 106 && // 'j'
      patched[i+4] === 83 && // 'S'
      patched[i+5] === 116 && // 't'
      patched[i+6] === 109    // 'm'
    ) {
      patched[i+6] = 88; // 'X'
    }
  }
  return patched;
}

// === Minimal MD5 Implementation ===
export function md5(data: Uint8Array): Uint8Array {
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];

  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const msgLen = data.length;
  const msgBitLen = msgLen * 8;
  const msgLenPadded = ((msgLen + 9 + 63) & ~63);
  const msg = new Uint8Array(msgLenPadded);
  msg.set(data);
  msg[msgLen] = 0x80;

  const dataView = new DataView(msg.buffer, msg.byteOffset, msg.byteLength);
  dataView.setUint32(msgLenPadded - 8, msgBitLen, true);
  dataView.setUint32(msgLenPadded - 4, 0, true);

  for (let offset = 0; offset < msgLenPadded; offset += 64) {
    const chunk = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      chunk[j] = dataView.getUint32(offset + j * 4, true);
    }
    let a = a0, b = b0, c = c0, d = d0;

    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) {
        f = (b & c) | ((~b) & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | ((~d) & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | (~d));
        g = (7 * i) % 16;
      }

      f = (f + a + K[i] + chunk[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + ((f << S[i]) | (f >>> (32 - S[i])))) >>> 0;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const result = new Uint8Array(16);
  const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
  view.setUint32(0, a0, true);
  view.setUint32(4, b0, true);
  view.setUint32(8, c0, true);
  view.setUint32(12, d0, true);

  return result;
}

// === Minimal RC4 Implementation ===
export class RC4 {
  private s = new Uint8Array(256);
  private i = 0;
  private j = 0;

  constructor(key: Uint8Array) {
    for (let i = 0; i < 256; i++) {
      this.s[i] = i;
    }
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + this.s[i] + key[i % key.length]) & 0xFF;
      const tmp = this.s[i];
      this.s[i] = this.s[j];
      this.s[j] = tmp;
    }
  }

  process(data: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length);
    for (let k = 0; k < data.length; k++) {
      this.i = (this.i + 1) & 0xFF;
      this.j = (this.j + this.s[this.i]) & 0xFF;
      const tmp = this.s[this.i];
      this.s[this.i] = this.s[this.j];
      this.s[this.j] = tmp;
      const t = (this.s[this.i] + this.s[this.j]) & 0xFF;
      result[k] = data[k] ^ this.s[t];
    }
    return result;
  }
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// === Key derivation & Validation ===
export function padPassword(password: string | Uint8Array): Uint8Array {
  const pwdBytes = typeof password === 'string' ? new TextEncoder().encode(password) : password;
  const padded = new Uint8Array(32);
  if (pwdBytes.length >= 32) {
    padded.set(pwdBytes.slice(0, 32));
  } else {
    padded.set(pwdBytes);
    padded.set(PADDING.slice(0, 32 - pwdBytes.length), pwdBytes.length);
  }
  return padded;
}

export function computeEncryptionKey(
  password: string | Uint8Array,
  ownerKey: Uint8Array,
  permissions: number,
  fileId: Uint8Array,
  revision: number,
  keyLength: number
): Uint8Array {
  const paddedPwd = padPassword(password);
  const hashInput = new Uint8Array(
    paddedPwd.length +
    ownerKey.length +
    4 +
    fileId.length
  );
  let offset = 0;
  hashInput.set(paddedPwd, offset);
  offset += paddedPwd.length;
  hashInput.set(ownerKey, offset);
  offset += ownerKey.length;
  hashInput[offset++] = permissions & 0xFF;
  hashInput[offset++] = (permissions >> 8) & 0xFF;
  hashInput[offset++] = (permissions >> 16) & 0xFF;
  hashInput[offset++] = (permissions >> 24) & 0xFF;
  hashInput.set(fileId, offset);

  let hash = md5(hashInput);
  if (revision >= 3) {
    for (let i = 0; i < 50; i++) {
      hash = md5(hash.slice(0, keyLength));
    }
  }
  return hash.slice(0, keyLength);
}

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function validateUserPasswordRC4(password: string | Uint8Array, encryptParams: any): Uint8Array | null {
  const { ownerKey, userKey, permissions, fileId, revision, keyLength } = encryptParams;
  console.log('VALIDATING:', {
    passwordStr: typeof password === 'string' ? password : '[bytes]',
    ownerKeyHex: bytesToHex(ownerKey),
    userKeyHex: bytesToHex(userKey),
    permissions,
    fileIdHex: bytesToHex(fileId),
    revision,
    keyLength
  });
  const encryptionKey = computeEncryptionKey(password, ownerKey, permissions, fileId, revision, keyLength);

  if (revision === 2) {
    const rc4 = new RC4(encryptionKey);
    const computed = rc4.process(new Uint8Array(PADDING));
    if (arraysEqual(computed, userKey)) {
      return encryptionKey;
    }
  } else {
    const hashInput = new Uint8Array(PADDING.length + fileId.length);
    hashInput.set(PADDING);
    hashInput.set(fileId, PADDING.length);
    const hash = md5(hashInput);

    let result = new RC4(encryptionKey).process(hash);
    for (let i = 1; i <= 19; i++) {
      const iterKey = new Uint8Array(encryptionKey.length);
      for (let j = 0; j < encryptionKey.length; j++) {
        iterKey[j] = encryptionKey[j] ^ i;
      }
      result = new RC4(iterKey).process(result);
    }
    if (arraysEqual(result.slice(0, 16), userKey.slice(0, 16))) {
      return encryptionKey;
    }
  }
  return null;
}

export function validateOwnerPasswordRC4(ownerPassword: string | Uint8Array, encryptParams: any): Uint8Array | null {
  const { ownerKey, revision, keyLength } = encryptParams;
  const paddedOwner = padPassword(ownerPassword);
  let hash = md5(paddedOwner);
  if (revision >= 3) {
    for (let i = 0; i < 50; i++) {
      hash = md5(hash);
    }
  }
  const ownerDecryptKey = hash.slice(0, keyLength);
  let recoveredUserPwd: Uint8Array;

  if (revision === 2) {
    const rc4 = new RC4(ownerDecryptKey);
    recoveredUserPwd = rc4.process(new Uint8Array(ownerKey));
  } else {
    let result = new Uint8Array(ownerKey);
    for (let i = 19; i >= 0; i--) {
      const iterKey = new Uint8Array(ownerDecryptKey.length);
      for (let j = 0; j < ownerDecryptKey.length; j++) {
        iterKey[j] = ownerDecryptKey[j] ^ i;
      }
      result = new RC4(iterKey).process(result);
    }
    recoveredUserPwd = result;
  }
  return validateUserPasswordRC4(recoveredUserPwd, encryptParams);
}

// === AES-128 Decryption ===
export async function aesCbcDecrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : (typeof window !== 'undefined' ? window.crypto : null);
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error("Web Crypto API is not available");
  }
  const cryptoKey = await cryptoObj.subtle.importKey('raw', key, 'AES-CBC', false, ['decrypt']);
  const decrypted = await cryptoObj.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, data);
  return new Uint8Array(decrypted);
}

export async function decryptObjectAES128(
  data: Uint8Array,
  objectNum: number,
  generationNum: number,
  encryptionKey: Uint8Array
): Promise<Uint8Array> {
  const keyInput = new Uint8Array(encryptionKey.length + 9);
  keyInput.set(encryptionKey);
  keyInput[encryptionKey.length] = objectNum & 0xFF;
  keyInput[encryptionKey.length + 1] = (objectNum >> 8) & 0xFF;
  keyInput[encryptionKey.length + 2] = (objectNum >> 16) & 0xFF;
  keyInput[encryptionKey.length + 3] = generationNum & 0xFF;
  keyInput[encryptionKey.length + 4] = (generationNum >> 8) & 0xFF;
  keyInput[encryptionKey.length + 5] = 0x73; // s
  keyInput[encryptionKey.length + 6] = 0x41; // A
  keyInput[encryptionKey.length + 7] = 0x6C; // l
  keyInput[encryptionKey.length + 8] = 0x54; // T

  const objectKey = md5(keyInput).slice(0, 16);

  const iv = data.slice(0, 16);
  const ciphertext = data.slice(16);

  if (ciphertext.length === 0) {
    return new Uint8Array(0);
  }

  try {
    return await aesCbcDecrypt(ciphertext, objectKey, iv);
  } catch (e) {
    return data;
  }
}

export function decryptObjectRC4(
  data: Uint8Array,
  objectNum: number,
  generationNum: number,
  encryptionKey: Uint8Array
): Uint8Array {
  const keyInput = new Uint8Array(encryptionKey.length + 5);
  keyInput.set(encryptionKey);
  keyInput[encryptionKey.length] = objectNum & 0xFF;
  keyInput[encryptionKey.length + 1] = (objectNum >> 8) & 0xFF;
  keyInput[encryptionKey.length + 2] = (objectNum >> 16) & 0xFF;
  keyInput[encryptionKey.length + 3] = generationNum & 0xFF;
  keyInput[encryptionKey.length + 4] = (generationNum >> 8) & 0xFF;
  const objectKey = md5(keyInput);
  const rc4 = new RC4(objectKey.slice(0, Math.min(encryptionKey.length + 5, 16)));
  return rc4.process(data);
}

function isPDFRef(obj: any): boolean {
  return obj && typeof obj === 'object' && 'objectNumber' in obj && 'generationNumber' in obj;
}

function isPDFDict(obj: any): boolean {
  return obj && typeof obj === 'object' && typeof obj.entries === 'function' && typeof obj.get === 'function' && !('contents' in obj);
}

function isPDFRawStream(obj: any): boolean {
  return obj && typeof obj === 'object' && 'contents' in obj && 'dict' in obj;
}

function isPDFString(obj: any): boolean {
  return obj && typeof obj === 'object' && typeof obj.asBytes === 'function' && typeof obj.asString === 'function' && obj.toString().startsWith('(');
}

function isPDFHexString(obj: any): boolean {
  return obj && typeof obj === 'object' && typeof obj.asBytes === 'function' && typeof obj.asString === 'function' && obj.toString().startsWith('<');
}

function isPDFArray(obj: any): boolean {
  return obj && typeof obj === 'object' && typeof obj.asArray === 'function' && typeof obj.lookup === 'function';
}

export function extractBytes(pdfObj: any): Uint8Array | null {
  if (!pdfObj) return null;
  if (isPDFHexString(pdfObj)) {
    return hexToBytes(pdfObj.asString());
  }
  if (isPDFString(pdfObj)) {
    return pdfObj.asBytes();
  }
  const str = pdfObj.toString();
  if (str.startsWith('<') && str.endsWith('>')) {
    return hexToBytes(str.slice(1, -1));
  }
  return null;
}

export function readEncryptParamsCustom(context: any) {
  const trailer = (context as any).trailerInfo || (context as any).trailer;
  if (!trailer) return null;
  const encryptRef = trailer.Encrypt;
  if (!encryptRef) return null;

  let encryptDict: any;
  if (isPDFRef(encryptRef)) {
    encryptDict = context.lookup(encryptRef);
  } else if (isPDFDict(encryptRef)) {
    encryptDict = encryptRef;
  } else {
    return null;
  }

  if (!encryptDict || !isPDFDict(encryptDict)) {
    return null;
  }

  const V = encryptDict.get(PDFName.of('V'));
  const R = encryptDict.get(PDFName.of('R'));
  const Length = encryptDict.get(PDFName.of('Length'));
  const P = encryptDict.get(PDFName.of('P'));
  const O = encryptDict.get(PDFName.of('O'));
  const U = encryptDict.get(PDFName.of('U'));

  const version = V ? (typeof V.asNumber === 'function' ? V.asNumber() : Number(V.toString())) : 0;
  const revision = R ? (typeof R.asNumber === 'function' ? R.asNumber() : Number(R.toString())) : 0;
  const permissions = P ? (typeof P.asNumber === 'function' ? P.asNumber() : Number(P.toString())) : 0;

  const ownerKey = extractBytes(O);
  const userKey = extractBytes(U);
  if (!ownerKey || !userKey) return null;

  let fileId = new Uint8Array(0);
  const idArray = trailer.ID;
  if (idArray) {
    if (Array.isArray(idArray) && idArray.length > 0) {
      fileId = extractBytes(idArray[0]) || new Uint8Array(0);
    } else if (isPDFArray(idArray)) {
      const firstId = idArray.lookup(0);
      fileId = extractBytes(firstId) || new Uint8Array(0);
    }
  }

  let algorithm = 'RC4';
  let keyLength = 16;
  let encryptMetadata = true;

  if (version === 4) {
    const CF = encryptDict.get(PDFName.of('CF'));
    const StmF = encryptDict.get(PDFName.of('StmF'));
    const StrF = encryptDict.get(PDFName.of('StrF'));
    
    let cfm = '/V2';
    if (isPDFDict(CF)) {
      const stdCFName = StmF || StrF || PDFName.of('StdCF');
      const stdCF = CF.get(stdCFName as PDFName);
      if (isPDFDict(stdCF)) {
        const CFM = stdCF.get(PDFName.of('CFM'));
        if (CFM) {
          cfm = CFM.toString();
        }
      }
    }
    
    if (cfm === '/AESV2') {
      algorithm = 'AES-128';
    } else {
      algorithm = 'RC4';
    }
    
    const lenVal = Length ? (typeof Length.asNumber === 'function' ? Length.asNumber() : Number(Length.toString())) : 128;
    keyLength = lenVal / 8;
    
    const EncryptMetadata = encryptDict.get(PDFName.of('EncryptMetadata'));
    if (EncryptMetadata) {
      encryptMetadata = EncryptMetadata.toString() !== 'false';
    }
  } else if (version === 5 && revision === 6) {
    algorithm = 'AES-256';
    keyLength = 32;
  } else {
    const lenVal = Length ? (typeof Length.asNumber === 'function' ? Length.asNumber() : Number(Length.toString())) : 40;
    keyLength = lenVal / 8;
  }

  const params = {
    version,
    revision,
    ownerKey,
    userKey,
    permissions,
    fileId,
    encryptRef,
    encryptDict,
    algorithm,
    keyLength,
    encryptMetadata
  };
  console.log('ENCRYPT_PARAMS:', {
    version,
    revision,
    permissions,
    keyLength,
    ownerKeyHex: bytesToHex(ownerKey),
    userKeyHex: bytesToHex(userKey),
    fileIdHex: bytesToHex(fileId)
  });
  return params;
}

export async function decryptAllV4(
  context: any,
  encryptionKey: Uint8Array,
  algorithm: string,
  encryptRefNum: number | null,
  encryptMetadata: boolean
) {
  const indirectObjects = context.enumerateIndirectObjects();

  for (const [ref, obj] of indirectObjects) {
    const objectNum = ref.objectNumber;
    const generationNum = ref.generationNumber || 0;

    if (encryptRefNum !== null && objectNum === encryptRefNum) {
      continue;
    }

    if (isPDFDict(obj) && !isPDFRawStream(obj)) {
      const type = obj.get(PDFName.of('Type'));
      if (type && type.toString() === '/Sig') continue;
    }

    if (isPDFRawStream(obj) && obj.dict) {
      const type = obj.dict.get(PDFName.of('Type'));
      if (type) {
        const typeName = type.toString();
        if (typeName === '/XRef' || typeName === '/Sig') continue;
        if (typeName === '/Metadata' && !encryptMetadata) continue;
      }
    }

    if (isPDFRawStream(obj)) {
      const streamData = obj.contents;
      if (streamData && streamData.length > 0) {
        let decrypted: Uint8Array;
        if (algorithm === 'AES-128') {
          decrypted = await decryptObjectAES128(streamData, objectNum, generationNum, encryptionKey);
        } else {
          decrypted = decryptObjectRC4(streamData, objectNum, generationNum, encryptionKey);
        }
        obj.contents = decrypted;
      }
      if (obj.dict) {
        await decryptStringsV4(obj.dict, objectNum, generationNum, encryptionKey, algorithm);
      }
    } else {
      await decryptStringsV4(obj, objectNum, generationNum, encryptionKey, algorithm);
    }
  }
}

async function decryptStringsV4(
  obj: any,
  objectNum: number,
  generationNum: number,
  encryptionKey: Uint8Array,
  algorithm: string
) {
  if (!obj) return;

  if (isPDFString(obj)) {
    const originalBytes = obj.asBytes();
    if (originalBytes && originalBytes.length > 0) {
      if (algorithm === 'AES-128' && originalBytes.length < 16) {
        return;
      }
      let decrypted: Uint8Array;
      if (algorithm === 'AES-128') {
        decrypted = await decryptObjectAES128(originalBytes, objectNum, generationNum, encryptionKey);
      } else {
        decrypted = decryptObjectRC4(originalBytes, objectNum, generationNum, encryptionKey);
      }
      obj.value = Array.from(decrypted).map(b => String.fromCharCode(b)).join('');
    }
  } else if (isPDFHexString(obj)) {
    const originalBytes = obj.asBytes();
    if (originalBytes && originalBytes.length > 0) {
      if (algorithm === 'AES-128' && originalBytes.length < 16) {
        return;
      }
      let decrypted: Uint8Array;
      if (algorithm === 'AES-128') {
        decrypted = await decryptObjectAES128(originalBytes, objectNum, generationNum, encryptionKey);
      } else {
        decrypted = decryptObjectRC4(originalBytes, objectNum, generationNum, encryptionKey);
      }
      obj.value = bytesToHex(decrypted);
    }
  } else if (isPDFDict(obj)) {
    for (const [key, value] of obj.entries()) {
      const keyName = key.asString();
      if (keyName !== '/Length' && keyName !== '/Filter' && keyName !== '/DecodeParms') {
        await decryptStringsV4(value, objectNum, generationNum, encryptionKey, algorithm);
      }
    }
  } else if (isPDFArray(obj)) {
    for (const element of obj.asArray()) {
      await decryptStringsV4(element, objectNum, generationNum, encryptionKey, algorithm);
    }
  }
}

export async function decryptPDFCustom(pdfBytes: Uint8Array, passwordStr: string): Promise<Uint8Array> {
  // First, parse encryption parameters by doing a lightweight load of the original bytes
  const tempDoc = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: true,
    updateMetadata: false
  });
  
  const encryptParams = readEncryptParamsCustom(tempDoc.context);
  
  if (!encryptParams) {
    throw new Error('This PDF is not encrypted. No /Encrypt dictionary found.');
  }

  // Delegate V=5 (AES-256) to original library
  if (encryptParams.version === 5) {
    return originalDecryptPDF(pdfBytes, passwordStr);
  }

  const { algorithm, version, permissions, fileId, ownerKey, userKey, encryptRef, encryptMetadata } = encryptParams;
  
  const encryptRefNum = (encryptRef && typeof encryptRef === 'object' && 'objectNumber' in encryptRef)
    ? (encryptRef as any).objectNumber
    : null;

  let encryptionKey = validateUserPasswordRC4(passwordStr, encryptParams);
  if (!encryptionKey) {
    encryptionKey = validateOwnerPasswordRC4(passwordStr, encryptParams);
  }

  if (!encryptionKey) {
    throw new Error('Incorrect password. The provided password does not match.');
  }

  // Now, patch the binary bytes to hide Object Streams during initial parsing
  const patchedBytes = patchObjStmBytes(pdfBytes);

  // Parse the patched bytes using PDFParser directly into a new context
  const parseSpeed = ParseSpeeds.Slow;
  const context = await PDFParser.forBytesWithOptions(patchedBytes, parseSpeed, false, false).parseDocument();

  // Decrypt all objects in this clean context
  await decryptAllV4(context, encryptionKey, algorithm, encryptRefNum, encryptMetadata);

  // Restore and parse the decrypted Object Streams
  const indirectObjects = context.enumerateIndirectObjects();
  for (const [ref, obj] of indirectObjects) {
    if (isPDFRawStream(obj) && obj.dict) {
      const type = obj.dict.get(PDFName.of('Type'));
      if (type && type.toString() === '/ObjStX') {
        obj.dict.set(PDFName.of('Type'), PDFName.of('ObjStm'));
        await PDFObjectStreamParser.forStream(obj).parseIntoContext();
      }
    }
  }

  // Remove the /Encrypt entry from the trailer
  const trailer = (context as any).trailerInfo || (context as any).trailer;
  if (trailer) {
    delete trailer.Encrypt;
  }

  // Construct the final decrypted PDFDocument from the decrypted context
  const pdfDoc = new PDFDocument(context, false, false);

  // Save the decrypted PDF
  const decryptedBytes = await pdfDoc.save({
    useObjectStreams: false
  });

  return decryptedBytes;
}
