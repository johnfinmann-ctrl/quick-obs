import { dbGetAll, dbPut, dbDelete, STORES } from "./db";
import type { EmergencyContact } from "../types";
import { SEED_CONTACTS } from "../config/contactsSeed";

export async function listContacts(): Promise<EmergencyContact[]> {
  const existing = await dbGetAll<EmergencyContact>(STORES.contacts);
  if (existing.length === 0) {
    for (const contact of SEED_CONTACTS) {
      await dbPut(STORES.contacts, contact);
    }
    return SEED_CONTACTS;
  }
  return existing;
}

export async function saveContact(contact: EmergencyContact): Promise<void> {
  await dbPut(STORES.contacts, contact);
}

export async function deleteContact(id: string): Promise<void> {
  await dbDelete(STORES.contacts, id);
}
