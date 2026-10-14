(function () {
"use strict";
var K = { u: "bs_users", p: "bs_posts", c: "bs_comments", s: "bs_session" };
var CATS = ["Technology", "Education", "Lifestyle", "Programming"];
var $ = function (s) { return document.querySelector(s); };
var app = $("#app");
var q = "", cat = "All";

/* ---------- storage helpers (safe against missing/invalid data) ---------- */
function load(k) { try { var v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { alert("Could not save data. Is browser storage disabled?"); } }
function users() { return load(K.u).filter(function (u) { return u && u.id && u.email; }); }
function posts() { return load(K.p).filter(function (p) { return p && p.id && p.title && p.authorId; }); }
function comments() { return load(K.c).filter(function (c) { return c && c.id && c.postId && c.text; }); }
function me() { try { var id = localStorage.getItem(K.s); return users().find(function (u) { return u.id === id; }) || null; } catch (e) { return null; } }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function fmt(d) { var x = new Date(d); return isNaN(x) ? "Unknown date" : x.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
function go(h) { if (location.hash === h) route(); else location.hash = h; }

/* ---------- sample posts (only on the very first visit) ---------- */
try {
  if (localStorage.getItem(K.p) === null) {
    var t = Date.now(), D = 864e5;
    var mk = function (i, title, category, description, content) {
      return { id: "sample" + i, title: title, category: category, description: description, content: content, author: "BlogSpace Team", authorId: "sample", date: t - i * 3 * D };
    };
    save(K.p, [
      mk(1, "Getting Started with HTML and CSS", "Programming", "Learn how web pages are built from structure and style.", "HTML gives a web page its structure: headings, paragraphs, links and images.\n\nCSS controls how it looks: colors, fonts and layout.\n\nStart small. Build one page, change one thing at a time, and refresh the browser to see the result."),
      mk(2, "5 Study Habits That Actually Work", "Education", "Simple routines that make studying less stressful.", "1. Study in short focused sessions.\n2. Test yourself instead of only re-reading.\n3. Sleep well before exams.\n4. Teach a concept to a friend.\n5. Plan your week on Sunday."),
      mk(3, "Why Everyone Is Talking About AI", "Technology", "A beginner-friendly look at what AI tools can and cannot do.", "AI tools can summarize text, write code and answer questions.\n\nThey can also make mistakes, so always double-check important facts."),
      mk(4, "Small Habits for a Balanced Life", "Lifestyle", "Tiny changes that make daily life calmer.", "Drink water, take a short walk, and put your phone away an hour before bed.\n\nSmall habits repeated daily add up to big changes.")
    ]);
  }
} catch (e) { /* storage unavailable */ }

/* ---------- navigation ---------- */
function nav() {
  var u = me();
  $("#links").innerHTML = '<a href="#/">Home</a><a href="#/explore">Explore Blogs</a>' + (u
    ? '<a href="#/my">My Posts</a><a href="#/new">Create Post</a><span class="who">Hi, ' + esc(u.name) + '</span><button class="btn small ghost" data-a="logout">Logout</button>'
    : '<a href="#/login">Login</a><a class="btn small" href="#/register">Register</a>');
}
function msg(title, text, link) {
  app.innerHTML = '<div class="empty"><h2>' + esc(title) + '</h2><p>' + text + '</p>' + (link || "") + '</div>';
}

/* ---------- list / cards ---------- */
function cardHtml(p, mine) {
  return '<article class="card"><span class="tag">' + esc(p.category) + '</span><h3>' + esc(p.title) + '</h3><p class="meta">By ' + esc(p.author) + ' · ' + fmt(p.date) + '</p><p>' + esc(p.description) + '</p><div class="row"><a class="btn small" href="#/post/' + esc(p.id) + '">Read More</a>' +
    (mine ? '<a class="btn small ghost" href="#/edit/' + esc(p.id) + '">Edit</a><button class="btn small danger" data-a="delpost" data-v="' + esc(p.id) + '">Delete</button>' : "") + '</div></article>';
}
function grid() {
  var s = q.trim().toLowerCase();
  var list = posts().filter(function (p) {
    return (cat === "All" || p.category === cat) && (!s || (p.title + " " + p.description + " " + p.content).toLowerCase().indexOf(s) > -1);
  }).sort(function (a, b) { return b.date - a.date; });
  $("#grid").innerHTML = list.length ? '<div class="grid">' + list.map(function (p) { return cardHtml(p, false); }).join("") + "</div>"
    : '<div class="empty"><h2>No posts found</h2><p>Try a different search or category.</p></div>';
}
function home(banner) {
  app.innerHTML = (banner ? '<section class="hero"><h1>Welcome to BlogSpace</h1><p>Read, write and discuss ideas about technology, education, lifestyle and programming.</p></section>' : "") +
    '<div class="tools"><input id="q" type="search" aria-label="Search posts" placeholder="Search posts by title or content..." value="' + esc(q) + '"><div class="cats">' +
    ["All"].concat(CATS).map(function (c) { return '<button class="chip' + (c === cat ? " on" : "") + '" data-a="cat" data-v="' + c + '">' + c + "</button>"; }).join("") + '</div></div><div id="grid"></div>';
  grid();
}
function myPosts() {
  var u = me();
  if (!u) return msg("Please log in", "You need an account to see your posts.", '<a class="btn" href="#/login">Login</a>');
  var list = posts().filter(function (p) { return p.authorId === u.id; }).sort(function (a, b) { return b.date - a.date; });
  app.innerHTML = '<div class="row"><h1>My Posts</h1><a class="btn" href="#/new">Create New Post</a></div>' + (list.length
    ? '<div class="grid">' + list.map(function (p) { return cardHtml(p, true); }).join("") + "</div>"
    : '<div class="empty"><h2>You have not published anything yet</h2><p>Write your first post and share it with the world.</p><a class="btn" href="#/new">Create New Post</a></div>');
}

/* ---------- single post + comments ---------- */
function view(id) {
  var p = posts().find(function (x) { return x.id === id; });
  if (!p) return msg("Post not found", "It may have been deleted.", '<a class="btn" href="#/">Back to Home</a>');
  var u = me(), own = u && u.id === p.authorId;
  var cs = comments().filter(function (c) { return c.postId === id; }).sort(function (a, b) { return a.date - b.date; });
  app.innerHTML = '<article class="read"><a href="#/">&larr; Back</a><br><span class="tag">' + esc(p.category) + '</span><h1>' + esc(p.title) + '</h1><p class="meta">By ' + esc(p.author) + ' · ' + fmt(p.date) + '</p>' +
    (own ? '<div class="row"><a class="btn small ghost" href="#/edit/' + esc(p.id) + '">Edit</a><button class="btn small danger" data-a="delpost" data-v="' + esc(p.id) + '">Delete</button></div>' : "") +
    '<div class="body">' + esc(p.content) + '</div></article><section class="comments"><h2>Comments (' + cs.length + ')</h2>' +
    (u ? '<form data-form="comment" data-id="' + esc(id) + '" novalidate><label for="ctext">Add a comment</label><textarea id="ctext" name="text" rows="3" maxlength="500"></textarea><p class="err" role="alert"></p><button class="btn">Post Comment</button></form>'
       : '<p class="note">Please <a href="#/login">log in</a> to comment.</p>') +
    (cs.length ? cs.map(function (c) {
      var can = u && (u.id === c.authorId || u.id === p.authorId);
      return '<div class="comment"><p class="meta"><strong>' + esc(c.author) + '</strong> · ' + fmt(c.date) + '</p>' + esc(c.text) +
        (can ? '<div class="row"><button class="btn small danger" data-a="delcomment" data-v="' + esc(c.id) + '">Delete</button></div>' : "") + '</div>';
    }).join("") : '<p class="note">No comments yet. Be the first to share your thoughts!</p>') + '</section>';
}

/* ---------- forms ---------- */
function authForm(kind) {
  var reg = kind === "register";
  app.innerHTML = '<form class="box" data-form="' + kind + '" novalidate><h1>' + (reg ? "Create Account" : "Login") + '</h1>' +
    (reg ? '<label for="fname">Full name</label><input id="fname" name="fname" autocomplete="name">' : "") +
    '<label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email">' +
    '<label for="pw">Password</label><input id="pw" name="pw" type="password">' +
    (reg ? '<label for="pw2">Confirm password</label><input id="pw2" name="pw2" type="password">' : "") +
    '<p class="err" role="alert"></p><button class="btn">' + (reg ? "Register" : "Login") + '</button>' +
    '<p>' + (reg ? 'Already registered? <a href="#/login">Login</a>' : 'No account? <a href="#/register">Register</a>') + '</p></form>';
}
function postForm(id) {
  var u = me();
  if (!u) return msg("Please log in", "You need to log in to write posts.", '<a class="btn" href="#/login">Login</a>');
  var p = id ? posts().find(function (x) { return x.id === id; }) : { title: "", category: CATS[0], description: "", content: "" };
  if (!p) return msg("Post not found", "It may have been deleted.");
  if (id && p.authorId !== u.id) return msg("Not allowed", "You can only edit your own posts.", '<a class="btn" href="#/">Back to Home</a>');
  app.innerHTML = '<form class="box wide" data-form="post" data-id="' + esc(id || "") + '" novalidate><h1>' + (id ? "Edit Post" : "Create Post") + '</h1>' +
    '<label for="title">Blog title</label><input id="title" name="title" maxlength="100" value="' + esc(p.title) + '">' +
    '<label for="category">Category</label><select id="category" name="category">' + CATS.map(function (c) { return '<option' + (c === p.category ? " selected" : "") + '>' + c + "</option>"; }).join("") + '</select>' +
    '<label for="description">Short description</label><input id="description" name="description" maxlength="200" value="' + esc(p.description) + '">' +
    '<label for="content">Full blog content</label><textarea id="content" name="content" rows="12">' + esc(p.content) + '</textarea>' +
    '<p class="err" role="alert"></p><button class="btn">' + (id ? "Save Changes" : "Publish") + '</button> <a class="btn ghost" href="#/my">Cancel</a></form>';
}
function err(f, m) { f.querySelector(".err").textContent = m; }

document.addEventListener("submit", function (e) {
  var f = e.target, kind = f.dataset.form;
  if (!kind) return;
  e.preventDefault();
  var d = Object.fromEntries(new FormData(f)), u = me(), list;
  if (kind === "register") {
    var name = (d.fname || "").trim(), email = (d.email || "").trim().toLowerCase();
    if (!name || !email || !d.pw || !d.pw2) return err(f, "Please fill in all fields.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err(f, "Please enter a valid email address.");
    if (d.pw.length < 6) return err(f, "Password must be at least 6 characters.");
    if (d.pw !== d.pw2) return err(f, "Passwords do not match.");
    list = users();
    if (list.some(function (x) { return x.email === email; })) return err(f, "That email is already registered.");
    var nu = { id: uid(), name: name, email: email, password: d.pw }; // demo only: plain text!
    list.push(nu); save(K.u, list); localStorage.setItem(K.s, nu.id); go("#/");
  } else if (kind === "login") {
    var em = (d.email || "").trim().toLowerCase();
    if (!em || !d.pw) return err(f, "Please enter your email and password.");
    var found = users().find(function (x) { return x.email === em && x.password === d.pw; });
    if (!found) return err(f, "Incorrect email or password.");
    localStorage.setItem(K.s, found.id); go("#/");
  } else if (kind === "post") {
    if (!u) return err(f, "Please log in first.");
    var title = (d.title || "").trim(), desc = (d.description || "").trim(), content = (d.content || "").trim();
    if (!title || !desc || !content) return err(f, "Title, description and content are required.");
    if (CATS.indexOf(d.category) < 0) return err(f, "Please choose a valid category.");
    list = posts();
    if (f.dataset.id) {
      var p = list.find(function (x) { return x.id === f.dataset.id; });
      if (!p || p.authorId !== u.id) return err(f, "You can only edit your own posts.");
      p.title = title; p.category = d.category; p.description = desc; p.content = content;
      save(K.p, list); go("#/post/" + p.id);
    } else {
      var np = { id: uid(), title: title, category: d.category, description: desc, content: content, author: u.name, authorId: u.id, date: Date.now() };
      list.push(np); save(K.p, list); go("#/post/" + np.id);
    }
  } else if (kind === "comment") {
    if (!u) return err(f, "Please log in to comment.");
    var text = (d.text || "").trim();
    if (!text) return err(f, "Comment cannot be empty.");
    if (!posts().some(function (x) { return x.id === f.dataset.id; })) return err(f, "This post no longer exists.");
    list = comments();
    list.push({ id: uid(), postId: f.dataset.id, text: text, author: u.name, authorId: u.id, date: Date.now() });
    save(K.c, list); view(f.dataset.id);
  }
});

document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-a]");
  if (e.target.closest("#menuBtn")) { var o = $("#links").classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", o); return; }
  if (!b) return;
  var a = b.dataset.a, v = b.dataset.v, u = me();
  if (a === "cat") { cat = v; home(!!$(".hero")); }
  else if (a === "logout") { localStorage.removeItem(K.s); go("#/"); }
  else if (a === "delpost") {
    var p = posts().find(function (x) { return x.id === v; });
    if (!u || !p || p.authorId !== u.id) return alert("You can only delete your own posts.");
    if (!confirm('Delete "' + p.title + '"? This cannot be undone.')) return;
    save(K.p, posts().filter(function (x) { return x.id !== v; }));
    save(K.c, comments().filter(function (c) { return c.postId !== v; }));
    go("#/my");
  } else if (a === "delcomment") {
    var c = comments().find(function (x) { return x.id === v; });
    var post = c && posts().find(function (x) { return x.id === c.postId; });
    if (!u || !c || !(c.authorId === u.id || (post && post.authorId === u.id))) return alert("You cannot delete this comment.");
    if (!confirm("Delete this comment?")) return;
    save(K.c, comments().filter(function (x) { return x.id !== v; }));
    view(c.postId);
  }
});
document.addEventListener("input", function (e) { if (e.target.id === "q") { q = e.target.value; grid(); } });

/* ---------- router ---------- */
function route() {
  var parts = (location.hash.slice(1) || "/").split("/"), r = parts[1] || "", id = parts[2];
  nav(); $("#links").classList.remove("open"); window.scrollTo(0, 0);
  if (r === "explore") home(false);
  else if (r === "post") view(id);
  else if (r === "login") authForm("login");
  else if (r === "register") authForm("register");
  else if (r === "my") myPosts();
  else if (r === "new") postForm();
  else if (r === "edit") postForm(id);
  else home(true);
}
window.addEventListener("hashchange", route);
route();
})();
