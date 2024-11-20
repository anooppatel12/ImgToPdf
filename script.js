document.getElementById("imageUpload").addEventListener("change", handleFileSelect);
document.getElementById("generatePdf").addEventListener("click", generatePdf);

let imageFiles = [];

function handleFileSelect(event) {
  const files = event.target.files;
  const previewContainer = document.getElementById("previewContainer");

  // Loop through selected files and generate previews
  Array.from(files).forEach((file) => {
    // Check if the file is already in the imageFiles array to avoid duplicates
    if (!imageFiles.includes(file)) {
      const reader = new FileReader();

      reader.onload = function (e) {
        // Create a container for each image (with delete button)
        const previewItem = document.createElement("div");
        previewItem.classList.add("preview-item");

        const img = document.createElement("img");
        img.src = e.target.result;
        previewItem.appendChild(img);

        // Create a delete icon
        const deleteIcon = document.createElement("div");
        deleteIcon.classList.add("delete-icon");
        deleteIcon.textContent = "×";
        previewItem.appendChild(deleteIcon);

        // Append the preview item to the container
        previewContainer.appendChild(previewItem);

        // Add the file to the imageFiles array for later use
        imageFiles.push(file);

        // Add event listener for the delete icon
        deleteIcon.addEventListener("click", () => removeImage(previewItem, file));
      };

      reader.readAsDataURL(file);
    }
  });
}

function removeImage(previewItem, file) {
  // Remove the file from the imageFiles array
  const index = imageFiles.indexOf(file);
  if (index > -1) {
    imageFiles.splice(index, 1);
  }

  // Remove the image preview item from the DOM
  previewItem.remove();
}

async function generatePdf() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  if (imageFiles.length === 0) {
    alert("Please upload at least one image!");
    return;
  }

  // Show progress bar
  document.querySelector(".progress-container").style.display = "block";
  const progressBar = document.getElementById("progressBar");

  // Loop through all selected files and convert to PDF
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const imgData = await toBase64(file);
    const img = new Image();
    img.src = imgData;

    // Wait for the image to load before adding it to the PDF
    await new Promise((resolve) => {
      img.onload = () => {
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (img.height * imgWidth) / img.width;

        // Add a new page for each image except the first one
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, imgWidth, imgHeight);

        // Update progress bar
        const progress = ((i + 1) / imageFiles.length) * 100;
        progressBar.style.width = progress + "%";

        resolve();
      };
    });
  }

  // Hide progress bar and save the PDF
  document.querySelector(".progress-container").style.display = "none";
  pdf.save("converted.pdf");
}

// Helper function to convert file to Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
