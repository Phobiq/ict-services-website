(function () {
	var ipEl = document.getElementById("visitor-ip");
	var statusEl = document.getElementById("visitor-ip-status");
	var detailsEl = document.getElementById("visitor-ip-details");
	var copyBtn = document.getElementById("copy-ip-btn");
	var refreshBtn = document.getElementById("refresh-ip-btn");
	var currentIp = "";

	function setStatus(text, isError) {
		if (!statusEl) {
			return;
		}
		statusEl.textContent = text;
		statusEl.classList.toggle("text-danger", Boolean(isError));
		statusEl.classList.toggle("text-muted", !isError);
	}

	function setDetail(id, value) {
		var el = document.getElementById(id);
		if (el) {
			el.textContent = value || "—";
		}
	}

	function loadIp() {
		currentIp = "";
		if (ipEl) {
			ipEl.textContent = "…";
		}
		setStatus("IP-adres ophalen…");
		setDetail("ip-city", "…");
		setDetail("ip-country", "…");
		setDetail("ip-isp", "…");

		fetch("https://api.ipify.org?format=json")
			.then(function (response) {
				if (!response.ok) {
					throw new Error("Kon IP niet ophalen");
				}
				return response.json();
			})
			.then(function (data) {
				currentIp = data.ip || "";
				if (ipEl) {
					ipEl.textContent = currentIp || "Onbekend";
				}
				setStatus("Publiek IP-adres van dit apparaat");
				return fetch("https://ipwho.is/" + encodeURIComponent(currentIp));
			})
			.then(function (response) {
				if (!response || !response.ok) {
					return null;
				}
				return response.json();
			})
			.then(function (geo) {
				if (!geo || geo.success === false) {
					setDetail("ip-city", "—");
					setDetail("ip-country", "—");
					setDetail("ip-isp", "—");
					return;
				}
				var cityParts = [geo.city, geo.region].filter(Boolean);
				setDetail("ip-city", cityParts.join(", "));
				setDetail("ip-country", geo.country || "—");
				setDetail("ip-isp", (geo.connection && geo.connection.isp) || geo.isp || "—");
			})
			.catch(function () {
				if (!currentIp && ipEl) {
					ipEl.textContent = "Niet beschikbaar";
				}
				setStatus("Het IP-adres kon niet worden opgehaald. Controleer je internetverbinding.", true);
				setDetail("ip-city", "—");
				setDetail("ip-country", "—");
				setDetail("ip-isp", "—");
			});
	}

	if (copyBtn) {
		copyBtn.addEventListener("click", function () {
			if (!currentIp) {
				return;
			}
			navigator.clipboard.writeText(currentIp).then(function () {
				var original = copyBtn.textContent;
				copyBtn.textContent = "Gekopieerd";
				setTimeout(function () {
					copyBtn.textContent = original;
				}, 1500);
			});
		});
	}

	if (refreshBtn) {
		refreshBtn.addEventListener("click", loadIp);
	}

	loadIp();
})();
