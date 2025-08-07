import {
  fileToBase64,
  base64ToBlob,
  validateFileSize,
  validateFileType,
} from '@/app/lib/utils/fileUpload';

describe('File Upload Utilities', () => {
  describe('fileToBase64', () => {
    it('should convert file to base64 string', async () => {
      const mockFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const result = await fileToBase64(mockFile);

      expect(result).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should reject if file reading fails', async () => {
      const mockFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      // Mock FileReader to simulate error
      const originalFileReader = global.FileReader;
      global.FileReader = jest.fn(() => ({
        readAsDataURL: jest.fn(),
        onerror: null,
        onload: null,
        error: new Error('Read error'),
        addEventListener: function (event, handler) {
          if (event === 'error') {
            setTimeout(
              () => handler({ target: { error: new Error('Read error') } }),
              0
            );
          }
        },
      }));

      await expect(fileToBase64(mockFile)).rejects.toThrow('Read error');

      global.FileReader = originalFileReader;
    });
  });

  describe('base64ToBlob', () => {
    it('should convert base64 string to blob', () => {
      const base64 = 'data:image/jpeg;base64,dGVzdCBjb250ZW50';

      const blob = base64ToBlob(base64);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
    });

    it('should handle base64 without data URL prefix', () => {
      const base64 = 'dGVzdCBjb250ZW50';

      const blob = base64ToBlob(base64, 'image/png');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });
  });

  describe('validateFileSize', () => {
    it('should return true for file within size limit', () => {
      const mockFile = new File(['a'.repeat(1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      });

      const result = validateFileSize(mockFile, 5); // 5MB limit

      expect(result).toBe(true);
    });

    it('should return false for file exceeding size limit', () => {
      // Create a mock file with size property
      const mockFile = {
        name: 'test.jpg',
        size: 10 * 1024 * 1024, // 10MB
        type: 'image/jpeg',
      };

      const result = validateFileSize(mockFile, 5); // 5MB limit

      expect(result).toBe(false);
    });
  });

  describe('validateFileType', () => {
    it('should return true for allowed file types', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

      const result = validateFileType(mockFile, allowedTypes);

      expect(result).toBe(true);
    });

    it('should return false for disallowed file types', () => {
      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

      const result = validateFileType(mockFile, allowedTypes);

      expect(result).toBe(false);
    });
  });
});
