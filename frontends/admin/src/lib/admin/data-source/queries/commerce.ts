import { mapCustomer } from "../mappers";
import * as platformAuth from "../platform/auth";
import { projectUserToCustomer } from "../platform/mappers";
import { fromSource } from "./shared";
import { readStoredCustomers } from "@/lib/admin/customers/store";

/** customers → auth-service: пользователи текущего проекта. */
export async function getAdminCustomers() {
  return fromSource(async () => {
    const users = await platformAuth.listProjectUsers();
    return users.map((user) => mapCustomer(projectUserToCustomer(user)));
  }, readStoredCustomers);
}
