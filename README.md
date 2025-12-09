#### Environment Validation (T3 Env + Zod)

This setup validates and types your environment variables at build/runtime so you fail fast with clear errors and never leak secrets to the browser.

---

### GOTCHA

<details>
  <summary><strong>Suspense Behavior in <code>layout.tsx</code> and <code>page.tsx</code></strong></summary>

<br/>

* When the layout.tsx component wraps its <code> {children} </code> with a Suspense boundary, the layout’s fallback always appears first during the initial load. The page-level fallback (product skeletons) does not appear until the layout finishes loading. After the layout has resolved once, Next.js caches that layout segment.

* On later navigations (e.g., pagination or switching pages within the same collection), the layout typically does not suspend again. Therefore, its fallback will not show. If the page component suspends (e.g., fetching data), the pagelevel fallback will be shown—even though the layout technically wraps {children}.

* This explains why:

  * On the first visit: you see the **layout fallback first**, then the **page fallback**.
  * On pagination: you see **only the page fallback**, because the layout is already cached and does not suspend again
  * On navigating to a different collection: the layout suspends again → layout fallback shows first → then page fallback.

* If you remove the Suspense wrapper around {children}, the page fallback can appear immediately on the initial load, because it is no longer blocked by the layout’s Suspense tree—**as long as the layout itself does not suspend first**.

* This results in a “streaming header + independent product skeleton” UX, but requires careful boundary management.

</details>

---

<details>
  <summary><strong>Architecture Cache Behavior</strong></summary>

<br/>

* Functions wrapped with: `import { cache } from "react" ` (getWixServerClient, getCollectionsBySlug, getCollections) use **request-level memoization**. They only avoid duplicate work **within the same HTTP request**.

* On every new page load, navigation, or refresh, this cache is cleared and the functions run again.

* The product list (`queryProducts`) **always fetches fresh data from Wix** on every server request. This means newly added products will appear the next time the user triggers a server render (e.g. navigating back to the page or refreshing).

* If the user never returns to the page or never refreshes it, no new server request is made, so newly added products **won’t appear** during that session. This is expected behavior. Real-time updates would require SWR/React Query/WebSockets/etc. React Query is used only in client-side components where real-time updates matter (e.g., the Cart).

* Enabling `staleTimes.dynamic` improves performance by:

  * Reusing cached renders during fast navigation
  * Reducing unnecessary Wix API calls
  * Lowering server rendering load
  * Speeding up pagination transitions
  * Improving overall UX smoothness

* With: ```ts experimental.staleTimes.dynamic = 30 ``` the client router may reuse a previously rendered page for **up to 30 seconds**. After 30 seconds, the cached entry becomes **stale**, and the next navigation triggers a fresh server render.

</details>

---

<details>
  <summary><strong>UI Edge-Case</strong></summary>

<br/>

**Container-level Tailwind <code>group</code> breaks Card hover interactions behavior**

* Affected files: `shop/SearchFilterLayout.tsx`, `shop/page.tsx`, `components/product.tsx`

* When adding a pulse animation during collection filter changes, my first approach was to add a group class to the page ` <main> ` element and trigger the animation with `group-has-[data-pending]:animate-pulse`. However, this unintentionally broke the product cards’ hover image behavior (the second image swapped only after scrolling, or didn’t switch at all).

* **Why it happens:** Each product card already uses its own `group + group-hover` rules to swap images on hover. When the `<main>` wrapper also becomes a group, Tailwind treats the entire page as a single group. This overrides the card-level group-hover context, so the individual hover interactions stop working.

* **The fix:** Instead of putting group on the page container, I added a lightweight data-pending="true" attribute on `<main>` and used a small global CSS rule to trigger the pulse

* **TL;DR:** Avoid adding Tailwind’s generic `group` class to a parent container when child components rely on per-item `group-hover` interactions, such as product cards that swap images on hover.

</details>
