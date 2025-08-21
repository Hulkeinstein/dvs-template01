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
  constructor(bits, name, options = {}) {
    this.name = name;
    this.size = bits.reduce((acc, bit) => acc + (bit.length || 0), 0);
    this.type = options.type || '';
    this.lastModified = options.lastModified || Date.now();
  }

  slice() {
    return new MockBlob();
  }
  stream() {
    return new ReadableStream();
  }
  text() {
    return Promise.resolve('');
  }
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
}

// Blob API
class MockBlob {
  constructor() {
    this.size = 0;
    this.type = '';
  }
  
  slice() {
    return new MockBlob();
  }
  stream() {
    return new ReadableStream();
  }
  text() {
    return Promise.resolve('');
  }
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
}

// FileReader API
class MockFileReader {
  constructor() {
    this.result = null;
    this.error = null;
    this.readyState = 0;
    
    this.onload = null;
    this.onerror = null;
    this.onabort = null;
    this.onprogress = null;
    this.onloadstart = null;
    this.onloadend = null;
    
    this.EMPTY = 0;
    this.LOADING = 1;
    this.DONE = 2;
  }

  readAsDataURL(file) {
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

  readAsText(file) {
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

  readAsArrayBuffer(file) {
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
const mockURLStore = new Map();
let mockURLCounter = 0;

const MockURL = {
  createObjectURL: (blob) => {
    const url = `blob://mock-${++mockURLCounter}`;
    mockURLStore.set(url, blob);
    return url;
  },
  revokeObjectURL: (url) => {
    mockURLStore.delete(url);
  },
};

// 글로벌 등록
Object.defineProperty(global, 'File', { value: MockFile, writable: true });
Object.defineProperty(global, 'Blob', { value: MockBlob, writable: true });
Object.defineProperty(global, 'FileReader', {
  value: MockFileReader,
  writable: true,
});
Object.defineProperty(global, 'URL', { value: MockURL, writable: true });

// FormData polyfill (필요시)
if (typeof FormData === 'undefined') {
  class MockFormData {
    constructor() {
      this.data = new Map();
    }

    append(key, value) {
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

    set(key, value) {
      this.data.set(key, value);
    }

    get(key) {
      return this.data.get(key);
    }

    has(key) {
      return this.data.has(key);
    }

    delete(key) {
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

  Object.defineProperty(global, 'FormData', {
    value: MockFormData,
    writable: true,
  });
}

module.exports = {};