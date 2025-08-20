const mockHkdf = jest.fn(async () => new Uint8Array(32));
module.exports = {
  __esModule: true,
  default: mockHkdf, // default import용
  hkdf: mockHkdf, // named import용 (혹시 모를 경우)
};
