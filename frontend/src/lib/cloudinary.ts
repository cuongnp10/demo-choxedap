export const getCloudinaryUrl = (publicId: string) => {
    if (!publicId) return "";

    // Return early if the string is already a full URL or a base64 data URI
    if (
        publicId.startsWith("http://") ||
        publicId.startsWith("https://") ||
        publicId.startsWith("data:") ||
        publicId.startsWith("/")
    ) {
        return publicId;
    }

    // Base Cloudinary URL for the current project.
    // In the future, the Frontend will receive the public ID from the backend API.
    const cloudName = "djoyj4i4f";
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};
