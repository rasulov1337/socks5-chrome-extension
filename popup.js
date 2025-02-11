document.addEventListener("DOMContentLoaded", () => {
    const addressInputEl = document.getElementById("addressInput");
    const addressListEl = document.getElementById("addressList");
    const addButton = document.getElementById("saveAddresses");
    const template = document.getElementById("addressEntryTemplate");

    let addressList = [];

    const updateAddressList = (addressList) => {
        chrome.storage.local.set({ addressList: addressList }, () => {
            console.log("Address list was saved:", addressList);
        });
    };

    const refreshAddressList = () => {
        addressListEl.replaceChildren();

        chrome.storage.local.get(["addressList", "proxyEnabled"], (result) => {
            if (result.addressList) {
                addressList = result.addressList;

                result.addressList.forEach((address) => {
                    const entryEl = template.content.cloneNode(true);
                    entryEl.querySelector(
                        ".address-entry__address"
                    ).textContent = address;
                    const crossButton = entryEl.querySelector(
                        ".address-entry__cross"
                    );
                    crossButton.onclick = handleDelete;
                    crossButton.dataset.address = address;

                    addressListEl.appendChild(entryEl);
                });
            } else {
                addressListEl.textContent = "Nothing here yet";
            }
        });
    };

    const handleDelete = (e) => {
        const address = e.target.dataset.address;
        addressList = addressList.filter((item) => item !== address);

        updateAddressList(addressList);
        refreshAddressList();
    };

    const handleAdd = () => {
        const val = addressInputEl.value.trim();
        addressInputEl.value = "";

        if (!val) {
            alert("Address can't be empty!");
            return;
        }
        addressList.push(val);
        updateAddressList(addressList);
        refreshAddressList();
    };

    chrome.runtime.sendMessage({ action: "enableProxy" }, (response) => {
        chrome.storage.local.set({ proxyEnabled: true }, () => {
            console.log("Proxy enabled");
        });
    });

    addButton.onclick = handleAdd;
    refreshAddressList();
});
