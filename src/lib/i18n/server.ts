import { cookies } from "next/headers";
import { en } from "./en";
import { es } from "./es";
import type { Translations } from "./en";

export async function getT(): Promise<Translations> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value ?? "en";
  return lang === "es" ? es : en;
}
