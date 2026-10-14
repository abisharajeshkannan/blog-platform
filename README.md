# BlogSpace — Simple Blogging Platform

A beginner-friendly blog with posts, comments, demo accounts, search and category filters.
Built with only HTML, CSS and vanilla JavaScript. Data is saved in your browser's **localStorage**.

## Run it on Windows
1. Unzip the downloaded folder (right-click the ZIP → **Extract All**).
2. Open the `blog-platform` folder and double-click **index.html**.
3. That's it. No installation, no server.

Files: `index.html` (page), `style.css` (design), `script.js` (all the logic), `README.md` (this file).

## Upload to your own GitHub repository (easiest way)
1. Create a free account at https://github.com and log in.
2. Click **+** (top right) → **New repository**. Name it `blog-platform`, choose **Public**, click **Create repository**.
3. On the new repository page click **uploading an existing file**.
4. Drag in `index.html`, `style.css`, `script.js` and `README.md` (the files, not the outer folder).
5. Click **Commit changes**.

## Publish with GitHub Pages (optional)
1. In your repository, open **Settings → Pages**.
2. Under **Branch**, choose `main` and `/ (root)`, then **Save**.
3. After a minute your site appears at `https://YOUR-USERNAME.github.io/blog-platform/`.

Note: localStorage is per browser and per website address, so posts made locally will not appear on the published site (or on another computer).

## Important limitations — please read
- **Login is only a demonstration and is NOT secure.** Accounts and passwords are saved in plain text in localStorage, where anyone using the browser can read them.
- Ownership checks (only authors can edit/delete) run in JavaScript in the browser. A user can open developer tools and change localStorage, so these checks are **not real security**. Real authorization must be done on a server.
- Real authentication needs a **backend** with **securely hashed passwords** (e.g. bcrypt or Argon2) and a database. Do not enter a real password you use elsewhere.
- Data lives only in your browser. Clearing browser data deletes everything, and nothing is shared between users or devices.
- User text is always escaped before display, so typed HTML or scripts are shown as plain text and never executed.

## Testing checklist (try it yourself)
I wrote this code but did **not** run it in a browser, so please go through these checks:
1. Sample posts appear for a visitor. 2. Search and category filters work. 3. You can register. 4. You can log out and log in. 5. You can create a post. 6. You can edit and delete your own post. 7. Read More opens the full post. 8. You can add a comment. 9. You can delete your own comment. 10. As a post author you can delete comments on your post. 11. My Posts shows only your posts. 12. Everything remains after refresh. 13. Empty forms show errors. 14. Logged out, there is no comment box or Create Post link. 15. The layout works on a narrow (mobile-size) window.
