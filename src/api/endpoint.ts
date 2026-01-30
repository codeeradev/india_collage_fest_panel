export const API_BASE_URL = 'http://localhost:7860';
// export const API_BASE_URL = "https://india-collage-fest-api.onrender.com";
// export const API_BASE_URL = "http://172.93.223.239:3001/";

// Define all endpoints here
export const ENDPOINTS = {
  ADD_CATEGORY: 'admin/add-category',
  GET_CATEGORY: 'admin/get-category',
  ADD_SUBCATEGORY: 'admin/add-sub-category',
  ADD_CITY:'admin/add-city',
  GET_CITY:'admin/get-city',
  GET_SUBCATEGORY_BY_CATEGORY: (categoryId: string) => `admin/get-sub-category/${categoryId}`,
  EDIT_CITY: (id: string) => `admin/edit-city/${id}`,

  ADD_EVENT: "/add-event",
  GET_EVENTS: "admin/get-event",
  GET_APPROVALS_REQUEST: "admin/get-approvals-request",
  APPROVAL_ACTION: 'admin/approval-action',

  LOGIN_PANEL: 'admin/login-panel',

  EDIT_PROFILE: "admin/edit-profile",

  GET_PROFILE: (id: string) => `admin/get-profile/${id}`,
  EDIT_EVENT: (id: string) => `admin/editEvents/${id}`,

  GET_MY_MOU: "admin/organizer/mou",
  SEND_MOU_OTP: "admin/mou/send-otp",
  VERIFY_MOU_OTP: "admin/mou/verify-otp",

  PREVIEW_MOU: "admin/organizer/mou/preview",
};
