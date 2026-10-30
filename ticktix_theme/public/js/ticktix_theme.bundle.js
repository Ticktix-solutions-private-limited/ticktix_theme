// Ticktix Theme: on workspace pages, the sidebar toggle shrinks to icons
// instead of hiding. On list/form pages Frappe's default toggle is untouched.
(function () {
	const KEY = "tt_sidebar_mini";
	const cls = "tt-sidebar-mini";
	const get = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } };
	const set = (v) => { try { localStorage.setItem(KEY, v ? "1" : "0"); } catch (e) {} };

	$(document).ready(() => document.body.classList.toggle(cls, get()));

	// Capture phase: runs before Frappe's own handler.
	document.addEventListener(
		"click",
		(e) => {
			const btn = e.target.closest && e.target.closest(".sidebar-toggle-btn");
			if (!btn || window.innerWidth < 992) return;
			const page = btn.closest(".page-container");
			if (!page || !page.querySelector(".layout-side-section .desk-sidebar, .layout-side-section .form-sidebar")) return;
			e.stopImmediatePropagation();
			e.preventDefault();
			set(document.body.classList.toggle(cls));
			$(document.body).trigger("toggleSidebar");
		},
		true
	);
})();

// Tooltip with the workspace name while the sidebar is shrunk to icons.
(function () {
	let tip, current;
	const hide = () => {
		if (tip) tip.classList.remove("show");
		if (current && current.dataset.ttTitle) {
			current.setAttribute("title", current.dataset.ttTitle);
			delete current.dataset.ttTitle;
		}
		current = null;
	};
	document.addEventListener("mouseover", (e) => {
		const a = e.target.closest && e.target.closest(".desk-sidebar .item-anchor, .form-sidebar .form-sidebar-items > span:first-child");
		if (!a || !document.body.classList.contains("tt-sidebar-mini") || window.innerWidth < 992) {
			if (current && !a) hide();
			return;
		}
		if (a === current) return;
		hide();
		const label = a.querySelector(".sidebar-item-label, .ellipsis, .pill-label");
		const text = (label && label.textContent.trim()) || a.getAttribute("title");
		if (!text) return;
		current = a;
		if (a.getAttribute("title")) {
			a.dataset.ttTitle = a.getAttribute("title"); // suppress the slow native tooltip
			a.removeAttribute("title");
		}
		if (!tip) {
			tip = document.createElement("div");
			tip.className = "tt-tooltip";
			document.body.appendChild(tip);
		}
		tip.textContent = text;
		const r = a.getBoundingClientRect();
		tip.style.left = r.right + 10 + "px";
		tip.style.top = r.top + r.height / 2 - tip.offsetHeight / 2 + "px";
		tip.classList.add("show");
	});
	document.addEventListener("mouseout", (e) => {
		if (current && !current.contains(e.relatedTarget)) hide();
	});
	document.addEventListener("click", hide, true);
})();

// Form sidebar rail: clicking an icon expands the sidebar again.
document.addEventListener("click", (e) => {
	const item = e.target.closest && e.target.closest(".form-sidebar .form-sidebar-items");
	if (item && document.body.classList.contains("tt-sidebar-mini") && window.innerWidth >= 992) {
		e.stopPropagation();
		document.body.classList.remove("tt-sidebar-mini");
		try { localStorage.setItem("tt_sidebar_mini", "0"); } catch (err) {}
	}
}, true);

// Compact search placeholder + shortcut badge.
(function () {
	let tries = 0;
	const t = setInterval(() => {
		const input = document.getElementById("navbar-search");
		if (input) {
			clearInterval(t);
			input.setAttribute("placeholder", "Search or jump to…");
			const bar = input.closest(".search-bar");
			const mac = /Mac|iPhone|iPad/.test(navigator.platform);
			if (bar) bar.setAttribute("data-kbd", mac ? "⌘G" : "Ctrl G");
		} else if (++tries > 60) clearInterval(t);
	}, 250);
})();

// Mobile drawer: expanding a menu / section must not auto-close the drawer.
// Frappe closes it on any `button:not(.dropdown-toggle)` click, so we mark the
// expand buttons as dropdown-toggle for the duration of the click.
document.addEventListener(
	"click",
	(e) => {
		const b = e.target.closest && e.target.closest(".desk-sidebar .drop-icon, .desk-sidebar .standard-sidebar-label");
		if (!b || b.classList.contains("dropdown-toggle")) return;
		b.classList.add("dropdown-toggle");
		setTimeout(() => b.classList.remove("dropdown-toggle"), 0);
	},
	true
);

// Workspace cards: give each shortcut / report card a coloured initial tile.
(function () {
	// One-line description under each shortcut name; unknown names get "Open <name>".
	const SHORTCUT_SUBTITLES = {
		"item": "Manage items and products",
		"customer": "Manage your customers",
		"supplier": "Manage your suppliers",
		"sales invoice": "Create and manage invoices",
		"purchase invoice": "Record supplier bills",
		"sales order": "Track customer orders",
		"purchase order": "Track supplier orders",
		"leaderboard": "View your performance",
		"employee": "Manage your people",
		"lead": "Follow up with prospects",
	};
	const decorate = () => {
		document
			.querySelectorAll(".shortcut-widget-box .widget-head:not([data-tt]), .links-widget-box .widget-head:not([data-tt])")
			.forEach((head) => {
				const title = head.querySelector(".widget-title");
				const text = title && title.textContent.trim();
				if (!text) return;
				let h = 0;
				for (const c of text) h = (h * 31 + c.charCodeAt(0)) % 5;
				head.setAttribute("data-initial", text[0].toUpperCase());
				head.setAttribute("data-tone", String(h));
				head.setAttribute("data-tt", "1");
				if (head.closest(".shortcut-widget-box")) {
					const sub = head.querySelector(".widget-subtitle");
					if (sub && !sub.textContent.trim()) {
						sub.textContent = SHORTCUT_SUBTITLES[text.toLowerCase()] || "Open " + text;
						sub.classList.remove("hide");
					}
				}
			});
	};
	let queued = false;
	new MutationObserver(() => {
		if (queued) return;
		queued = true;
		requestAnimationFrame(() => { queued = false; decorate(); });
	}).observe(document.documentElement, { childList: true, subtree: true });
})();

// Profile menu: show who is signed in at the top of the user dropdown.
(function () {
	let tries = 0;
	const t = setInterval(() => {
		const menu = document.getElementById("toolbar-user");
		if (menu && window.frappe && frappe.session && frappe.avatar) {
			clearInterval(t);
			if (menu.querySelector(".tt-user-head")) return;
			const user = frappe.session.user;
			const name = frappe.session.user_fullname || (frappe.user && frappe.user.full_name && frappe.user.full_name()) || user;
			const head = document.createElement("div");
			head.className = "tt-user-head";
			head.innerHTML = `${frappe.avatar(user, "avatar-medium")}
				<div style="min-width:0">
					<div class="tt-user-name">${frappe.utils.escape_html(name)}</div>
					<div class="tt-user-email">${frappe.utils.escape_html(user)}</div>
				</div>`;
			menu.insertBefore(head, menu.firstChild);
		} else if (++tries > 80) clearInterval(t);
	}, 250);
})();

// Icons for the Help and profile dropdown items (inline SVG, matched by label).
(function () {
	const s = (d) =>
		`<svg class="tt-mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
	const I = {
		user: s('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
		settings: s('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
		sliders: s('<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'),
		refresh: s('<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>'),
		globe: s('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>'),
		grid: s('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
		expand: s('<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>'),
		moon: s('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
		logout: s('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>'),
		book: s('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
		chat: s('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
		alert: s('<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16.5h.01"/>'),
		info: s('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>'),
		keyboard: s('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
		lifebuoy: s('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="m5.6 5.6 3.5 3.5M14.9 14.9l3.5 3.5M14.9 9.1l3.5-3.5M9.1 14.9l-3.5 3.5"/>'),
		dot: s('<path d="m9 6 6 6-6 6"/>'),
	};
	const RULES = [
		[/log ?out|sign ?out/, "logout"],
		[/session default/, "sliders"],
		[/reload|refresh/, "refresh"],
		[/view website|website/, "globe"],
		[/apps?\b/, "grid"],
		[/full width/, "expand"],
		[/theme|dark|light/, "moon"],
		[/my profile|profile|account/, "user"],
		[/my settings|settings/, "settings"],
		[/documentation|docs|guide|manual/, "book"],
		[/forum|community|discuss|chat/, "chat"],
		[/report|issue|bug|feedback/, "alert"],
		[/shortcut|keyboard/, "keyboard"],
		[/support|help|contact/, "lifebuoy"],
		[/about|version/, "info"],
	];
	const iconFor = (text) => {
		const t = text.toLowerCase();
		for (const [re, k] of RULES) if (re.test(t)) return I[k];
		return I.dot;
	};
	const decorate = () => {
		document.querySelectorAll("#toolbar-help .dropdown-item, #toolbar-user .dropdown-item").forEach((el) => {
			if (el.dataset.ttI) return;
			const text = el.textContent.trim();
			if (!text) return;
			el.dataset.ttI = "1";
			el.insertAdjacentHTML("afterbegin", iconFor(text));
		});
	};
	let tries = 0;
	const t = setInterval(() => {
		if (document.getElementById("toolbar-user")) { decorate(); }
		if (++tries > 40) clearInterval(t);
	}, 500);
	document.addEventListener("click", (e) => {
		if (e.target.closest && e.target.closest(".dropdown-help, .dropdown-navbar-user")) setTimeout(decorate, 0);
	}, true);
})();
