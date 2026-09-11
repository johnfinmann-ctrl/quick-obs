/**
 * Fast, tilgaengelig farvepalette, administrator kan vaelge mellem for et
 * modul (i stedet for et frit farvevalg, som let kan give utilstraekkelig
 * kontrast). Alle farver er kontrolleret til at fungere med lys tekst.
 */
export const MODULE_COLOR_PALETTE: { value: string; labelId: string }[] = [
  { value: "#2E8B3D", labelId: "admin.formLibrary.color.green" },
  { value: "#2D4A27", labelId: "admin.formLibrary.color.darkGreen" },
  { value: "#1B3A5C", labelId: "admin.formLibrary.color.navy" },
  { value: "#3B6E71", labelId: "admin.formLibrary.color.petrol" },
  { value: "#1F4B4D", labelId: "admin.formLibrary.color.darkPetrol" },
  { value: "#B3261E", labelId: "admin.formLibrary.color.red" },
  { value: "#6B1F2A", labelId: "admin.formLibrary.color.bordeaux" },
  { value: "#9C7A2E", labelId: "admin.formLibrary.color.ochre" },
  { value: "#5B6660", labelId: "admin.formLibrary.color.grey" },
  { value: "#0F9B8E", labelId: "admin.formLibrary.color.turquoise" },
];
