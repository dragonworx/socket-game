export function getIsAdmin() {
  const adminCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("admin="));
  if (adminCookie) {
    return adminCookie.split("=")[1] === "true";
  }
  return false;
}
