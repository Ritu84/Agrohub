import { decode } from "base64-arraybuffer";

// Function to upload an image to Supabase storage
const uploadImage = async (base64Image, folder, fileName) => {
  try {
    const bucketName = "agrohub"; // Your bucket name
    const apiKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaXBkc2l0Zm5ycmNqcGNxeG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg4NDE0OTQsImV4cCI6MjA0NDQxNzQ5NH0.BSr37Mkn84LfH8DhQv0Hdg06_klslB1eba2KA9e8gPM"; // Replace with your Supabase API Key
    const projectUrl = "https://fgipdsitfnrrcjpcqxog.supabase.co"; // Your Supabase project URL

    // Decode base64 to binary data
    const arrayBuffer = decode(base64Image);

    // Upload the file
    const response = await fetch(
      `${projectUrl}/storage/v1/object/${bucketName}/${folder}/${fileName}`,
      {
        method: "POST", // Use PUT if the file already exists
        headers: {
          "Content-Type": "image/jpeg", // Adjust based on the file type
          Authorization: `Bearer ${apiKey}`,
        },
        body: arrayBuffer,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.message}`);
    }

    // Generate the public URL
    const publicUrl = `${projectUrl}/storage/v1/object/public/${bucketName}/${folder}/${fileName}`;
    console.log("Image uploaded successfully. Public URL:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export { uploadImage };
