export function fixProfileImagePath(path: string): string {
  if (!path) return "/placeholder.svg";
  let fixedPath = path.replace(/\\/g, "/");
  const uploadsIndex = fixedPath.indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    fixedPath = fixedPath.substring(uploadsIndex);
  }
  const backendBaseUrl = "http://localhost:3000"; // your backend base url here
  return backendBaseUrl + fixedPath;
}
