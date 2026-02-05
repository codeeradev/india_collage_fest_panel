import { get } from "src/api/apiClient";
import { ENDPOINTS } from "src/api/endpoint";

export const getUsersApi = async (roleId?: number) => {
  const params: any = {};

  if (roleId) {
    params.roleId = roleId;
  }

  const response = await get(ENDPOINTS.GET_USERS, {
    params,
  });

  return response.data.users;
};
