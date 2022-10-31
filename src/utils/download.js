export const download = (blobPart, filename, type) => {
  const blob = new Blob([blobPart], { type });
  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.download = filename;
  anchor.click();
};
