// export const API_BASE_URL = "https://api.fivlia.in";
// export const API_BASE_URL = 'http://localhost:7860';
export const API_BASE_URL = "https://india-collage-fest-api.onrender.com";

// Define all endpoints here
export const ENDPOINTS = {
  ADD_CATEGORY: 'admin/add-category',
  GET_CATEGORY: 'admin/get-category',
  ADD_SUBCATEGORY: 'admin/add-sub-category',
  ADD_CITY:'admin/add-city',
  GET_CITY:'admin/get-city',
  GET_SUBCATEGORY_BY_CATEGORY: (categoryId: string) => `admin/get-sub-category/${categoryId}`,
  EDIT_CITY: (id: string) => `admin/edit-city/${id}`,
};
