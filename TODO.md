# TODO: Automatically remove out-of-stock products from MakeTransactionPage

## Plan Breakdown
1. [x] Create TODO.md
2. [x] Edit app/MakeTransactionPage.tsx: Filter products where quantity > 0 in fetchProducts function (both page=1 and pagination cases).
3. [x] Verify edit with read_file.
4. [x] Test by running the app and checking MakeTransactionPage (only in-stock products show).
5. [x] Confirm no changes needed in other pages (e.g., InventoryPage).
6. [ ] Mark complete and attempt_completion.

Current progress: Steps 1-5 done. Edit verified: fetchProducts now filters newProducts and prev with p.quantity > 0. InventoryPage unchanged (shows all stocks). Ready to complete.
