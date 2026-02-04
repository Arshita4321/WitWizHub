

export const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error(
    "VITE_API_URL is NOT defined. Check Vercel Environment Variables."
  );
} else {
  console.log(" API_BASE_URL loaded:", API_BASE_URL);
}
