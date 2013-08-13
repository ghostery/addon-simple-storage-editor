
// Addon SDK Modules
SDK = {
	Cc: require('chrome').Cc,
	Ci: require('chrome').Ci,
	Cu: require('chrome').Cu,
	Cm: require('chrome').Cm,
	Cr: require('chrome').Cr,
	components: require('chrome').components,
	events: require('sdk/system/events'),
	self: require('sdk/self'),
	timers: require('sdk/timers'),
	pageMod: require('sdk/page-mod'),
	tabs: require('sdk/tabs'),
	file: require('sdk/io/file'),
	winUtils: require('sdk/window/utils'),
	request: require('sdk/request'),
	preferences: require('sdk/preferences/service'),
	widgets: require('sdk/widget')
}
 
var widget = SDK.widgets.Widget({
	id: 'sse-widget-id',
	label: 'SSE',
	contentURL: SDK.self.data.url('images/sse.png'),
	onClick: function() {
		SDK.tabs.open(SDK.self.data.url('sse-viewer.html'));
	}
});


SDK.pageMod.PageMod({
	include: SDK.self.data.url('sse-viewer.html'),
	contentScriptWhen: 'start',
	contentScriptFile: SDK.self.data.url('js/sse-viewer.js'),
	onAttach: function (worker) {
		SDK.Cu.import('resource://gre/modules/AddonManager.jsm');
		var dirService = SDK.Cc['@mozilla.org/file/directory_service;1']
							.getService(SDK.Ci.nsIProperties);
		var dir = dirService.get('ProfD', SDK.Ci.nsIFile);
		dir.append('jetpack');

		var profPath = dir.path;

		if (dir && dir.exists() && dir.isDirectory()) {
			var dirContents = dir.directoryEntries;
			while (dirContents.hasMoreElements()) {
				var item = dirContents.getNext().QueryInterface(SDK.Ci.nsIFile);
				var addonID = item.path.substring(profPath.length + 1, item.path.length);

				AddonManager.getAddonByID(addonID, function(addon) {
					//[addon.id, addon.name]
					worker.port.emit('list-addon', {
						id: addon.id,
						name: addon.name
					});
				});
			}
		} else {
			// looks like no SS addons since the dir is empty or doesnt exist
			worker.port.emit('no-addons');
		}
	}
});