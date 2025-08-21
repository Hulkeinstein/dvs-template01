/**
 * Browser API Polyfills for Test Environment
 * Node.js 환경에서 브라우저 API 시뮬레이션
 */

// ReadableStream 폴백
// @ts-ignore
if (typeof ReadableStream === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  global.ReadableStream = require('web-streams-polyfill').ReadableStream;
}

// File API
class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  
  constructor(bits: any[], name: string, options: any = {}) {
    this.name = name;
    this.size = bits.reduce((acc, bit) => acc + (bit.length || 0), 0);
    this.type = options.type || '';
    this.lastModified = options.lastModified || Date.now();
  }
  
  slice() { return new MockBlob(); }
  stream() { return new ReadableStream(); }
  text() { return Promise.resolve(''); }
  arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
}

// Blob API
class MockBlob {
  size = 0;
  type = '';
  slice() { return new MockBlob(); }
  stream() { return new ReadableStream(); }
  text() { return Promise.resolve(''); }
  arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
}

// FileReader API
class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: any = null;
  readyState = 0;
  
  onload: any = null;
  onerror: any = null;
  onabort: any = null;
  onprogress: any = null;
  onloadstart: any = null;
  onloadend: any = null;
  
  EMPTY = 0;
  LOADING = 1;
  DONE = 2;
  
  readAsDataURL(file: any) {
    this.readyState = this.LOADING;
    setTimeout(() => {
      this.result = 'data:image/png;base64,mockdata';
      this.readyState = this.DONE;
      if (this.onload) {
        this.onload({ target: this });
      }
      if (this.onloadend) {
        this.onloadend({ target: this });
      }
    }, 0);
  }
  
  readAsText(file: any) {
    this.readyState = this.LOADING;
    setTimeout(() => {
      this.result = 'mock file content';
      this.readyState = this.DONE;
      if (this.onload) {
        this.onload({ target: this });
      }
      if (this.onloadend) {
        this.onloadend({ target: this });
      }
    }, 0);
  }
  
  readAsArrayBuffer(file: any) {
    this.readyState = this.LOADING;
    setTimeout(() => {
      this.result = new ArrayBuffer(8);
      this.readyState = this.DONE;
      if (this.onload) {
        this.onload({ target: this });
      }
      if (this.onloadend) {
        this.onloadend({ target: this });
      }
    }, 0);
  }
  
  abort() {
    this.readyState = this.DONE;
    if (this.onabort) {
      this.onabort({ target: this });
    }
  }
}

// URL API
const mockURLStore = new Map<string, any>();
let mockURLCounter = 0;

const MockURL = {
  createObjectURL: (blob: any) => {
    const url = `blob://mock-${++mockURLCounter}`;
    mockURLStore.set(url, blob);
    return url;
  },
  revokeObjectURL: (url: string) => {
    mockURLStore.delete(url);
  }
};

// 글로벌 등록
Object.defineProperty(global, 'File', { value: MockFile, writable: true });
Object.defineProperty(global, 'Blob', { value: MockBlob, writable: true });
Object.defineProperty(global, 'FileReader', { value: MockFileReader, writable: true });
Object.defineProperty(global, 'URL', { value: MockURL, writable: true });

// FormData polyfill (필요시)
if (typeof FormData === 'undefined') {
  class MockFormData {
    private data: Map<string, any> = new Map();
    
    append(key: string, value: any) {
      const existing = this.data.get(key);
      if (existing) {
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          this.data.set(key, [existing, value]);
        }
      } else {
        this.data.set(key, value);
      }
    }
    
    set(key: string, value: any) {
      this.data.set(key, value);
    }
    
    get(key: string) {
      return this.data.get(key);
    }
    
    has(key: string) {
      return this.data.has(key);
    }
    
    delete(key: string) {
      this.data.delete(key);
    }
    
    entries() {
      return this.data.entries();
    }
    
    keys() {
      return this.data.keys();
    }
    
    values() {
      return this.data.values();
    }
  }
  
  Object.defineProperty(global, 'FormData', { value: MockFormData, writable: true });
}

export {};