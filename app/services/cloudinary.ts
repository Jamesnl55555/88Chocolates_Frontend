type CloudinaryResponse = {
  secure_url: string;
};

export const uploadImage = async (uri: string): Promise<CloudinaryResponse> => {
  const data = new FormData();

  data.append("file", {
    uri,
    type: "image/jpeg",
    name: `profile_${Date.now()}.jpg`,
  } as any);

  data.append("upload_preset", "88_chocolates_image_upload");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dzvnorkel/image/upload",
    {
      method: "POST",
      body: data,
    }
  );

    const result = await response.json();
    console.log(result.secure_url);
    return result;
};