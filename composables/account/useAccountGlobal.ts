import type { Account, Assistant, Driver } from "~/types/account/account.interface";

export const accountList = ref<Account[]>([]);
export const driverList = ref<Driver[]>([]);
export const assistantList = ref<Assistant[]>([]);