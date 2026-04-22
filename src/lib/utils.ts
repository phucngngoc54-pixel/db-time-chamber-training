
export const processDriveUrl = (url: string) => {
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      // Using the lh3 format which is often more reliable for direct img src in these environments
      return `https://lh3.googleusercontent.com/u/0/d/${match[1]}`;
    }
  }
  return url;
};
