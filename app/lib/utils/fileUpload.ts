export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file: no result'));
      }
    };

    reader.onerror = () => {
      reject(reader.error || new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

export const base64ToBlob = (
  base64Data: string,
  contentType: string = ''
): Blob => {
  let base64String = base64Data;
  let mimeType = contentType;

  // Extract mime type and base64 data if it's a data URL
  if (base64Data.includes(',')) {
    const parts = base64Data.split(',');
    const matches = parts[0].match(/data:([^;]+);/);
    if (matches) {
      mimeType = matches[1];
    }
    base64String = parts[1];
  }

  // Decode base64 string
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: mimeType });
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type);
};
