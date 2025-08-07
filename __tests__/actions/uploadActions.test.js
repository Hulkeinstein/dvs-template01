import { uploadCourseThumbnail } from '@/app/lib/actions/uploadActions';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  })),
}));

describe('uploadActions', () => {
  let mockSupabase;
  let mockUpload;
  let mockGetPublicUrl;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpload = jest.fn();
    mockGetPublicUrl = jest.fn();

    mockSupabase = {
      storage: {
        from: jest.fn(() => ({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        })),
      },
    };

    createClient.mockReturnValue(mockSupabase);
  });

  describe('uploadCourseThumbnail', () => {
    it('should upload base64 image and return public URL', async () => {
      const base64Data = 'data:image/jpeg;base64,dGVzdCBpbWFnZSBkYXRh';
      const fileName = 'test-course.jpg';
      const mockPath = `course-thumbnails/${Date.now()}-${fileName}`;
      const mockPublicUrl =
        'https://storage.example.com/public/course-thumbnails/test.jpg';

      mockUpload.mockResolvedValue({ data: { path: mockPath }, error: null });
      mockGetPublicUrl.mockReturnValue({ data: { publicUrl: mockPublicUrl } });

      const result = await uploadCourseThumbnail(base64Data, fileName);

      expect(result.success).toBe(true);
      expect(result.url).toBe(mockPublicUrl);
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('course-images');
      expect(mockUpload).toHaveBeenCalled();

      // Check that the upload was called with a Blob
      const uploadCall = mockUpload.mock.calls[0];
      expect(uploadCall[1]).toBeInstanceOf(Blob);
    });

    it('should handle upload errors', async () => {
      const base64Data = 'data:image/jpeg;base64,dGVzdCBpbWFnZSBkYXRh';
      const fileName = 'test-course.jpg';
      const mockError = new Error('Upload failed');

      mockUpload.mockResolvedValue({ data: null, error: mockError });

      const result = await uploadCourseThumbnail(base64Data, fileName);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });

    it('should validate file size before upload', async () => {
      // Create a large base64 string (simulating > 5MB file)
      const largeBase64Data =
        'data:image/jpeg;base64,' + 'A'.repeat(7 * 1024 * 1024);
      const fileName = 'large-file.jpg';

      const result = await uploadCourseThumbnail(largeBase64Data, fileName);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds');
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should validate file type before upload', async () => {
      const base64Data = 'data:application/pdf;base64,dGVzdCBwZGYgZGF0YQ==';
      const fileName = 'test.pdf';

      const result = await uploadCourseThumbnail(base64Data, fileName);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid file type');
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should handle missing file data', async () => {
      const result = await uploadCourseThumbnail(null, 'test.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No file data provided');
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should sanitize file names', async () => {
      const base64Data = 'data:image/jpeg;base64,dGVzdCBpbWFnZSBkYXRh';
      const fileName = 'test course@#$.jpg';
      const mockPublicUrl =
        'https://storage.example.com/public/course-thumbnails/test.jpg';

      mockUpload.mockResolvedValue({
        data: { path: 'test-path' },
        error: null,
      });
      mockGetPublicUrl.mockReturnValue({ data: { publicUrl: mockPublicUrl } });

      await uploadCourseThumbnail(base64Data, fileName);

      const uploadCall = mockUpload.mock.calls[0];
      const uploadedFileName = uploadCall[0];

      // Check that special characters are removed/replaced
      expect(uploadedFileName).toMatch(
        /^course-thumbnails\/\d+-test-course.jpg$/
      );
    });
  });
});
