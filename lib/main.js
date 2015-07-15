// Copyright 2013 Evidon.  All rights reserved.
// Use of this source code is governed by a Apache License 2.0
// license that can be found in the LICENSE file.



// Addon SDK Modules
SDK = {
	Cc: require('chrome').Cc,
	Ci: require('chrome').Ci,
	Cu: require('chrome').Cu,
	Cm: require('chrome').Cm,
	Cr: require('chrome').Cr,
	self: require('sdk/self'),
	timers: require('sdk/timers'),
	pageMod: require('sdk/page-mod'),
	tabs: require('sdk/tabs'),
	file: require('sdk/io/file'),
	ActionButton: require('sdk/ui/button/action').ActionButton
}

SDK.Cu.import("resource://gre/modules/AddonManager.jsm");

SDK.ActionButton({
	id: 'sse-button-id',
	label: 'Simple Storage Editor',
	icon: {
		'14': './images/sse.png',
		'32': './images/icon.png',
		'64': './images/icon64.png'
	},
	onClick: () => SDK.tabs.open(SDK.self.data.url('sse-viewer.html'))
});

SDK.pageMod.PageMod({
	include: SDK.self.data.url('sse-viewer.html'),
	contentScriptWhen: 'start',
	contentScriptFile: [SDK.self.data.url('js/sse-viewer.js'), SDK.self.data.url('js/jsoneditor-min.js')],
	contentStyleFile: SDK.self.data.url('css/jsoneditor-min.css'),
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
					worker.port.emit('list-addon', {
						id: addon.id,
						name: addon.name,
						status: addon.userDisabled
					});
				});
			}
		} else {
			// looks like no SS addons since the dir is empty or doesnt exist
			worker.port.emit('no-addons');
		}

		worker.port.on('get-ss', function (data) {
			worker.port.emit('get-json', {
				json: getStorageForAddon(data.id),
				id: data.id
			});
		});

		worker.port.on('toggle-addon', function (data) {
			AddonManager.getAddonByID(data.id, function(addon) {
				addon.userDisabled = !addon.userDisabled;

				worker.port.emit('toggle-addon-complete', {id: data.id, status: addon.userDisabled});
			});
		});

		worker.port.on('send-ss', function (data) {
			AddonManager.getAddonByID(data.id, function(addon) {
				var wasActive = addon.isActive;

				if (wasActive) 
					addon.userDisabled = true;

				SDK.timers.setTimeout(function() {
					writeStorageForAddon(data.id, data.json);

					AddonManager.getAddonByID(data.id, function(addon) {
						if (wasActive) 
							addon.userDisabled = false;
					});
				}, 1000);
			});
		});
	}
});

function getPathForAddonSimpleStorage(id) {
	var dirService = SDK.Cc['@mozilla.org/file/directory_service;1']
						.getService(SDK.Ci.nsIProperties);
	var dir = dirService.get('ProfD', SDK.Ci.nsIFile);
	dir.append('jetpack');
	dir.append(id);
	dir.append('simple-storage');
	dir.append('store.json');

	return dir;
}

function writeStorageForAddon(id, json) {
	SDK.file.remove(getPathForAddonSimpleStorage(id).path);

	var stream = SDK.file.open(getPathForAddonSimpleStorage(id).path, "w");
	
	try {
		stream.write(JSON.stringify(json));
	} catch (err) {
		stream.close();
	}

	stream.close();
}

function getStorageForAddon(id) {
	var json = '';

	var dir = getPathForAddonSimpleStorage(id);

	if (dir && dir.exists()) {
		json = SDK.file.read(dir.path);
	}

	return json;
}