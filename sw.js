chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "enableProxy") {
        chrome.storage.local.get(
            ["addressList", "proxyDestination"],
            (result) => {
                if (!result.addressList || !result.proxyDestination) return;

                let addresses = result.addressList || [];

                const patternsJSON = JSON.stringify(addresses);

                // PAC script
                const pacScriptData = `
          function FindProxyForURL(url, host) {
            var patterns = ${patternsJSON};
            for (var i = 0; i < patterns.length; i++) {
              if (shExpMatch(host, patterns[i])) {
                return "SOCKS5 ${result.proxyDestination}; DIRECT";
              }
            }
            return "DIRECT";
          }
        `;

                const config = {
                    mode: "pac_script",
                    pacScript: {
                        data: pacScriptData,
                    },
                };

                chrome.proxy.settings.set(
                    { value: config, scope: "regular" },
                    function () {
                        console.log("Proxy enabled");
                        sendResponse({ status: "enabled" });
                    }
                );
            }
        );

        return true;
    } else if (message.action === "disableProxy") {
        chrome.proxy.settings.clear({ scope: "regular" }, () => {
            console.log("Proxy disabled");
            sendResponse({ status: "disabled" });
        });
        return true;
    }
});
