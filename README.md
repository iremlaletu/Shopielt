
<details>
<summary><strong>Environment Validation (T3 Env + Zod)</strong></summary>

* This setup validates and types your environment variables at build/runtime so you fail fast with clear errors and never leak secrets to the browser.
</details>

<details>
<summary><strong>Checkout / Payment Notice</strong></summary>

* This project’s checkout functionality requires upgrading Wix Studio to a paid plan in order to enable real payment processing.
However, this project is intended only for development/demo purposes, so no upgrade will be performed and no real checkout will be implemented.

* Because of this, I enabled *manual payments* instead of real payment methods (Visa, credit or debit cards) to allow the checkout flow to proceed during development. Manual payments let us simulate the checkout process without any actual charges.

</details>


<details>
  <summary><strong>Profile Page Data Flow</strong></summary>

<br/>

* **Server fetch:** In `src/app/profile/page.tsx`, the member is fetched on the server (SSR) via `getLoggedInMember(getWixServerClient())` and passed to `MemberInfoForm` as an initial prop.

* **Client cache:** Inside `MemberInfoForm`, `useMember(initialData)` writes the initial data into React Query’s cache under the `["member"]` key. After mutations, the same key is reused so the UI updates instantly.

* **Update:** `useUpdateMember` (a React Query mutation) writes the updated member payload returned from `updateMemberInfo` into the cache using
  `setQueryData(["member"], updatedMember)`.
  There is no `router.refresh`; the UI updates directly from the cache.

* **Delete address:** After `useDeleteMemberAddresses` deletes the addresses in Wix, it clears `member.contact.addresses` in the cache, and the UI immediately shows “No address saved”.

* **Validation:** The form schema is defined with `zod`. Using `superRefine`, it enforces the rule “if any address field is filled, all are required” (i.e. `addressLine`, `city`, `country`, and `postalCode` must be provided together; otherwise, custom issues are added per field).
  This ensures that when you only want to update fields like username or last name, you are not forced to re-enter required address fields.

* **Fallback:** If the cache is empty, the component falls back to the SSR initial member (`currentMember ?? member`). This fallback is kept to always select the most up-to-date source, even in single-session scenarios.

* **Wix address update behavior:** Address updates are performed using the **override** behavior as defined in the Wix documentation.

* **References:**

  * Delete member emails (Wix Members API):
    [https://dev.wix.com/docs/api-reference/crm/members-contacts/members/member-management/members/delete-member-emails](https://dev.wix.com/docs/api-reference/crm/members-contacts/members/member-management/members/delete-member-emails)
  * Recommendation document reference (Wix eCommerce SDK):
    [https://dev.wix.com/docs/sdk/backend-modules/ecom/recommendations/list-available-algorithms](https://dev.wix.com/docs/sdk/backend-modules/ecom/recommendations/list-available-algorithms)

</details>

<details>
<summary><strong>Product Reviews & uploads media attachments </strong></summary>

- This setup starts from the Wix Studio project dashboard.
- Search for **“Wix Reviews”** in **Resources → Wix App Market**, install it in the project, and follow the setup instructions.
- In **Settings → Moderation**, enable **Images and Videos** and set **Ratings** to **All stars**.

- To create reviews programmatically, follow the official Wix Reviews API documentation:  
  https://dev.wix.com/docs/api-reference/crm/community/feedback-moderation/reviews/reviews/create-review?apiView=SDK

##### Media Attachments for Reviews

- Implementing media attachments for reviews requires **admin access**.
- Creating and uploading media URLs requires an **Admin API key**.
- The Admin API key can be generated from:  
  **Dashboard → Settings → Headless → Manage Admin API Key**
- Copy the key to env file.
- A Project Site ID is also required and can be obtained from Wix Studio. After retrieving the Site ID from URL, copy the value into the .env file, expose and destructure it in env.ts safely. The admin client is configured in lib/wix-client.server so it can be reused whenever admin level access is required.
- Again, URLs can only be generated via the admin client, so this logic must be handled in API routes where backend operations are performed.

- Used `ky` as a lightweight HTTP client on top of native Fetch to simplify request handling, query parameters, and response parsing, and easier file upload configuration (including disabling timeouts for large or parallel uploads).

- Media Attachments response reference doc: https://dev.wix.com/docs/sdk/backend-modules/reviews/reviews/create-review

##### Review Moderation Flow
- Reviews are **not rendered immediately** after submission.
- When a user submits a review, it enters a **moderation state**.
- The review becomes visible on the site **only after approval by the site administrator via Wix Studio**.
- After submission, users are shown the following message:

  > *“Thank you for your review!  
  > Your review has been submitted successfully. It will be visible once it has been approved by our team.”*

- When a new review is submitted, an **email notification is automatically sent to the site administrator**, informing them that a review is awaiting approval.

</details>


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
