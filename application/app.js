window.addEventListener("load", function () {
    console.log("ALLA");

    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "SoftLeft":
                // loadData_Apps();
                onClick_Copy();
                break;
            case "Q":
                loadData_Apps_Test();
                break;
            case "SoftRight":
            case "E":
                onClick_Uninstall();
                break;
            case "Enter":
                onClick_Enter();
                break;
            case "*":
                // onClick_Test();
                break;
        }
    });

    focusable.setScrollEl(document.getElementById("Items"));
    focusable.initDis = 0;
    focusable.distanceToCenter = true;

    loadData_Apps();
});

const onClick_Enter = () => {
    if (!mItem) {
        return;
    }
    mItem.mozApp.launch();
};

const onClick_Uninstall = () => {
    if (!mItem || mItem.uninstalled) {
        return;
    }
    let b = confirm(`确认卸载 ${mItem.name} ？`);
    if (b) {
        let request = navigator.mozApps.mgmt.uninstall(mItem.mozApp);
        // request.onsuccess = (result) => {
        //     console.log(result);
        //     alert("卸载成功");
        // };
        // request.onerror = (error) => {
        //     console.log(error);
        //     alert("卸载失败");
        // };
        mItem.uninstalled = true;
        mItem.view.classList.add("Uninstalled");
        mItem.view.removeAttribute("focusable");
        // document.getElementById("Items").removeChild(mItem.view);
    }
};

function pickUpAppIconInProperSize(e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 56;
    return e[
        Object.keys(e).sort(function (e, n) {
            return (e - n) * (e >= t ? 1 : -1);
        })[0]
    ];
}

const getAppIconUrl = (e, t, n) => {
    if (((t = t || e.manifest.icons), !t)) return null;
    var i = pickUpAppIconInProperSize(t, n);
    return /^(http|data)/.test(i) || (i = e.origin + i), i;
};

let mLoaded = false;
let mItem = null;
let mLoading = false;

const loadData_Apps = () => {
    if (mLoaded) {
        return;
    }
    let items = document.getElementById("Items");
    let result = navigator.mozApps.mgmt.getAll();
    result.onsuccess = (result) => {
        mLoaded = true;
        let apps = result.target.result.reverse();
        console.log(apps);
        apps.forEach((o, index) => {
            let item = {
                icon: getAppIconUrl(o),
                name: o.manifest.name,
                description: o.manifest.description,
                type: o.manifest.type,
                origin: o.origin,
                version: o.manifest.version,
                role: o.manifest.role,
                developer: o.manifest.developer,
                mozApp: o,
            };
            let developer = item.developer && item.developer.name;
            let view = document.createElement("div");
            view.classList.add("Item", "flex-h");
            view.setAttribute("focusable", "");
            if (index == 0) {
                view.addEventListener("up", () => {
                    focusable.requestFocus(items.children[items.children.length - 1]);
                });
            } else if (index == apps.length - 1) {
                view.addEventListener("down", () => {
                    focusable.requestFocus(items.children[0]);
                });
            }
            view.innerHTML = `
                <img class="Icon" src="${item.icon}"/>
                <div class="View2 flex-v flex-1">
                    <div class="Name">${item.name}</div>
                    ${developer ? `<div class="Developer">${developer}</div>` : ""}
                    <div class="Description">${item.description}</div>
                    <div class="Type">${[item.version && "v" + item.version, item.type, item.role].filter((o) => o).join("/")}</div>
                </div>
            `;
            view.addEventListener("onFocus", () => {
                mItem = item;
            });
            item.view = items.appendChild(view);
        });
    };
    result.onerror = (error) => {
        console.log("error", error);
    };
    // console.log(apps);
};

const loadData_Apps_Test = () => {
    Array.from({ length: 63 }).forEach((o, index) => {
        let item = {
            icon: "",
            name: "name" + index,
            description: "description1111111111111111111111111111111111111111111" + index,
            type: "type" + index,
        };
        let view = document.createElement("div");
        view.classList.add("Item", "flex-h");
        view.setAttribute("focusable", "");
        view.innerHTML = `
            <img class="Icon" src="${item.icon}"/>
            <div class="View2 flex-v flex-1">
                <div class="Name">${item.name}</div>
                <div class="Description">${item.description}</div>
                <div class="Type">${item.type}</div>
            </div>
        `;
        view.addEventListener("onFocus", () => {
            mItem = item;
        });
        document.getElementById("Items").appendChild(view);
    });
};

const onClick_Test = () => {
    console.log(navigator);
};

const onClick_Copy = () => {
    if (mLoading || !mItem) {
        return;
    }
    let sdcard = navigator.getDeviceStorage("sdcard");
    let request0 = sdcard.available();
    request0.onsuccess = (success) => {
        if (success.target.result != "available") {
            alert("无效的SD卡");
            return;
        }
        mLoading = true;
        let app = mItem.origin.substr(6);
        let sdcard = "/sdcard/ALLA/apps/";
        // let sdcard = "/storage/emulated/ALLA/apps/";
        let cmd1 = `mkdir -p ${sdcard}`;
        let cmd2 = `cp -r /system/b2g/webapps/${app} ${sdcard}`;
        let cmd3 = `cp -r /data/local/webapps/${app} ${sdcard}`;
        let cmd = [cmd1, cmd2, cmd3];
        let error = () => {
            alert("操作失败");
            mLoading = false;
        };
        let request = navigator.engmodeExtension.startUniversalCommand(cmd.join(";"), true);
        request.onsuccess = (result) => {
            alert("已备份至" + sdcard + app);
            mLoading = false;
        };
        request.onerror = error;
    };

    request0.onerror = () => {
        alert("无效的SD卡");
    };
};