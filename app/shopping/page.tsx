import { redirect } from "next/navigation";

/** The page moved to /support so the URL matches the menu label. Kept as a
 *  redirect rather than deleted: the old address is in the sitemap, in
 *  families' bookmarks, and in messages people have already sent each other. */
export default function ShoppingRedirect() {
  redirect("/support");
}
