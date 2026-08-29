import { mapCustomer } from "../mappers";
import * as platformAuth from "../platform/auth";
import { projectUserToCustomer } from "../platform/mappers";

/** customers → auth-service: пользователи текущего проекта. */
export async function getAdminCustomers() {
  const users = await platformAuth.listProjectUsers();
  return users.map((user) => mapCustomer(projectUserToCustomer(user)));
}
