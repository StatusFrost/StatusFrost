window.addEvent("domready", function () {
    // Option 1: Use the manifest:
    new FancySettings.initWithManifest(function (settings) {
        //If the value has not been initialized, default to true. Analytics are opt-out.
        if(Object.keys(localStorage).indexOf("store.settings.cb_enableAnalytics") == -1) {
            settings.manifest.cb_enableAnalytics.set(true);
        }
    });
});
