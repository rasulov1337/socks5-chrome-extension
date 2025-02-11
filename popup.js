document.addEventListener("DOMContentLoaded", () => {
    const destinationInputEl = document.getElementById("destinationInput");
    const addressInputEl = document.getElementById("addressInput");
    const addressListEl = document.getElementById("addressList");
    const addButton = document.getElementById("saveAddresses");
    const saveDestinationButton = document.getElementById(
        "saveDestinationButton"
    );
    const template = document.getElementById("addressEntryTemplate");

    let addressList = [];

    const updateAddressList = (addressList) => {
        chrome.storage.local.set({ addressList: addressList }, () => {
            console.log("Address list was saved:", addressList);
        });
    };

    const refreshAddressList = () => {
        addressListEl.replaceChildren();

        chrome.storage.local.get(
            ["addressList", "proxyEnabled", "proxyDestination"],
            (result) => {
                // Destination address
                if (result.proxyDestination) {
                    destinationInputEl.value = result.proxyDestination;
                }

                // Address list
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
            }
        );
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

    const handleSaveDestination = () => {
        const value = destinationInputEl.value.trim();

        if (!value) {
            alert("Destination can't be empty");
            return;
        }

        chrome.storage.local.set(
            { proxyDestination: destinationInputEl.value },
            () => {
                console.log("Proxy address saved");
            }
        );
    };

    chrome.runtime.sendMessage({ action: "enableProxy" }, (response) => {
        chrome.storage.local.set({ proxyEnabled: true }, () => {
            console.log("Proxy enabled");
        });
    });

    addButton.onclick = handleAdd;
    saveDestinationButton.onclick = handleSaveDestination;
    refreshAddressList();
});
