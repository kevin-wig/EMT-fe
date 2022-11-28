import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportAsPdf = (id, fileName) => {
  const data = document.getElementById(id);
  html2canvas(data).then(canvas => {
    const imgWidth = 210;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    const contentDataURL = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setDocumentProperties({ title: "EMT" });
    pdf.addImage(contentDataURL, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(fileName);
  }).catch((e) => {
    console.error(e)
  });
};

export const getScreenShot = async (id) => {
  const data = document.getElementById(id);
  if (data) {
    return html2canvas(data).then(canvas => {
      return new Promise((resolve => {
        canvas.toBlob((res) => {
          resolve(res);
        });
      }))
    }).catch((e) => {
      console.error(e)
    });
  } else {
    return null;
  }
};
