document.addEventListener("DOMContentLoaded", () => {
    const imageInput = document.getElementById("id_image");
    const imagePreview = document.getElementById("imagePreview");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");
    const removeImageBtn = document.getElementById("removeImageBtn");

    // Show image preview when a new file is selected
    imageInput?.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreviewContainer.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove image preview and clear input
    removeImageBtn?.addEventListener("click", () => {
        imageInput.value = "";
        imagePreview.src = "#";
        imagePreviewContainer.style.display = "none";
    });

    // If an image exists from editing, load it
    const existingImageUrl = imagePreview.getAttribute("data-src");
    if (existingImageUrl) {
        imagePreview.src = existingImageUrl;
        imagePreviewContainer.style.display = "block";
    }
});
