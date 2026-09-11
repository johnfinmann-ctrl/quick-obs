import { test, expect } from "@playwright/test";

/**
 * Verificerer IndexedDB-migrationen fra version 1 til 2: en "gammel"
 * medie-post (uden Fase 2.1-metadatafelter) skal automatisk faa
 * tilfoejet sikre standardvaerdier (origin: "imported",
 * capturedAtUtc: null osv.) foerste gang appen aabner databasen efter
 * opdateringen - uden at opdigte GPS/tid for den gamle post.
 */
test("gammel v1-medie-post migreres korrekt til v2 uden opdigtet metadata", async ({ page }) => {
  // Naviger til origin'et, men lad Playwright standse foer app-scripts naar at aabne DB'en.
  await page.route("**/assets/*.js", (route) => route.abort());
  await page.goto("/", { waitUntil: "commit" }).catch(() => {});

  await page.evaluate(() => {
    return new Promise<void>((resolve, reject) => {
      indexedDB.deleteDatabase("quick-obs").onsuccess = () => {
        const req = indexedDB.open("quick-obs", 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          db.createObjectStore("drafts", { keyPath: "kind" });
          const reportsStore = db.createObjectStore("reports", { keyPath: "id" });
          reportsStore.createIndex("kind", "kind", { unique: false });
          reportsStore.createIndex("updatedAt", "updatedAt", { unique: false });
          db.createObjectStore("media", { keyPath: "id" });
          db.createObjectStore("contacts", { keyPath: "id" });
          db.createObjectStore("settings", { keyPath: "key" });
        };
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction("media", "readwrite");
          tx.objectStore("media").put({
            id: "legacy-media-1",
            blob: new Blob(["x"], { type: "image/jpeg" }),
            mimeType: "image/jpeg",
            kind: "photo",
            sizeBytes: 1,
            createdAt: new Date().toISOString(),
          });
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      };
    });
  });

  // Fjern JS-blokeringen og genindlaes - dette er foerste gang appens
  // egen kode (version 2) aabner den seedede v1-database.
  await page.unroute("**/assets/*.js");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const migrated = await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("quick-obs");
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("media", "readonly");
        const getReq = tx.objectStore("media").get("legacy-media-1");
        getReq.onsuccess = () => {
          const rec = getReq.result;
          db.close();
          resolve(rec);
        };
        getReq.onerror = () => reject(getReq.error);
      };
      req.onerror = () => reject(req.error);
    });
  });

  expect(migrated).toBeTruthy();
  const rec = migrated as Record<string, unknown>;
  expect(rec.origin).toBe("imported");
  expect(rec.capturedAtUtc).toBeNull();
  expect(rec.timeZone).toBeNull();
  expect(rec.gps).toBeNull();
});
