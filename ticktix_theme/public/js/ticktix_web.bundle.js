// Website / portal pages: add a slim top bar so signed-in users can get back to the desk.
(function () {
	const cookie = (name) => {
		const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
		return m ? decodeURIComponent(m[1]) : "";
	};
	const run = () => {
		const user = cookie("user_id");
		if (!user || user === "Guest") return;
		if (document.querySelector(".tw-topbar") || document.querySelector("nav.navbar")) return;
		const full = (cookie("full_name") || user).replace(/\+/g, " ");
		const bar = document.createElement("div");
		bar.className = "tw-topbar";
		bar.innerHTML = `
			<a class="tw-back" href="/app">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
				Back to Desk
			</a>
			<span class="tw-user"></span>`;
		bar.querySelector(".tw-user").textContent = full;
		document.body.insertBefore(bar, document.body.firstChild);
	};
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
	else run();
})();
