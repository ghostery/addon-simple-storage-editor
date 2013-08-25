// Copyright 2013 Evidon.  All rights reserved.
// Use of this source code is governed by a Apache License 2.0
// license that can be found in the LICENSE file.

var editor;

self.port.on('list-addon', function (data) {
	var contents = document.getElementById('extensions-tbody');

	var row = document.createElement('tr'),
	 cell = document.createElement('td');

	cell.id = 'addon-name-' + data.id;
	cell.appendChild(document.createTextNode(data.name));
	row.appendChild(cell);

	cell = document.createElement('td');
	cell.appendChild(document.createTextNode(data.id));
	row.appendChild(cell);

	cell = document.createElement('td');
	cell.id = 'status-' + data.id;
	cell.appendChild(document.createTextNode(!data.status));
	row.appendChild(cell);

	cell = document.createElement('td');
	var a = document.createElement('a');
 	a.id = data.id;
 	a.href = '#';
 	a.addEventListener('click', function (e) {
 		self.port.emit('get-ss', {id: this.id});
		e.preventDefault();
	});

	a.appendChild(document.createTextNode('Edit Storage'));

	cell.appendChild(a);

	a = document.createElement('a');
 	a.id = data.id;
 	a.href = '#';
 	a.addEventListener('click', function (e) {
 		self.port.emit('toggle-addon', {id: this.id});
		e.preventDefault();
	});

	cell.appendChild(document.createTextNode(' | '));
	a.appendChild(document.createTextNode('Toggle Addon'));

	cell.appendChild(a);
	row.appendChild(cell);

	contents.appendChild(row);
});

self.port.on('toggle-addon-complete', function(data) {
	var status = document.getElementById('status-' + data.id);
	status.innerHTML = !data.status;
});

self.port.on('get-json', function(data) {
	document.getElementById('contents').style.display = 'none';
	document.getElementById('editor').style.display = '';

	var container = document.getElementById('json-editor');

	if (!editor) {
		editor = new jsoneditor.JSONEditor(container);
	}

	editor.set(JSON.parse(data.json));

	document.getElementById('editor-addon-name').innerHTML = document.getElementById('addon-name-' + data.id).innerHTML  + ' (' + data.id + ')';

	document.getElementById('save-json').addEventListener('click', function (e) {
 		var json = editor.get(),
 		 status = document.getElementById('status-' + data.id),
 		 result = true;

		if (status.innerHTML == 'true') { 
 			result = confirm('In order to save simple-storage for an addon,\n' +
 							 'the addon will be disabled, new json will be \n' +
 							 'saved and the addon will be re-enabled.\n\n' +
 							 'Press OK to allow, Cancel to stop.');
 		}

 		if (result == true) {
	 		self.port.emit('send-ss', {
	 			id: data.id,
	 			json: json
	 		});
	 	}

		document.getElementById('editor').style.display = 'none';
 		document.getElementById('contents').style.display = '';

		e.preventDefault();
	});

	document.getElementById('cancel').addEventListener('click', function (e) {
		document.getElementById('editor').style.display = 'none';
 		document.getElementById('contents').style.display = '';

		e.preventDefault();
	});
});

self.port.on('no-addons', function (data) {
	var contents = document.getElementById('contents');
	contents.innerHTML = 'Looks like you do not have any addons that store data via simple storage';
});