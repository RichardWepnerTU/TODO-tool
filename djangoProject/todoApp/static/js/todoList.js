var TODO_backend = (function(){
	function getCookie(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
	var csrftoken = getCookie('csrftoken');
	function csrfSafeMethod(method) {
		// these HTTP methods do not require CSRF protection
		return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
	}
	
	var DEBUG_mockupEntries = [
		{
			id: 1,
			name:'-',
			description:'-',
			progress:50,
			dueDate:'--/-/-',
			elements:[]
		},
		{
			id: 2,
			name:'My Test',
			description:'I need to do some tests',
			progress:10,
			dueDate:'2017/05/12',
			elements:[]
		}
	];
	$(document).ready(function() {
		documentReady = true;
		if(entriesLoaded) {
			finishInitialization();
		}
	});
	
	var finishInitialization = function() {
		if(!initializationDone) {
			initializationDone = true;
			console.log('actually initialize');
			
			// findlists
			var $lists = $('.TODO_list');
			for(var i = 0; i < $lists.length; i++) {
				var element = $lists[i];
				lists.push({
					element:element,
					template: $(element).find('.TODO_entryTemplate')[0]
				});
			}
			
			entries.forEach(addEntryToLists);
			
			$('.TODO_createEntryButton').click(function() {
				api.requestCreateEntry();
			});
		}
	};
	
	var lists = [];
	var entries = [];
	var entriesLoaded = false;
	var documentReady = false;
	var initializationDone = false;
	
	var entriesLoadedCallback = function(result) {
		entriesLoaded = true;
		entries = result;
		if(documentReady) {
			finishInitialization();
		}
	}
	
	var addEntryToLists = function(entry) {
		lists.forEach(addEntryToList.bind(this, entry));
	};
	
		
	var addEntryToList = function(entry, list) {
		var $entryElement = $(list.template).clone();
		console.log($entryElement, "test");
		$entryElement.removeClass('TODO_entryTemplate');
		setEntryData($entryElement, entry);
		$entryElement.find('.TODO_entryEditButton').click(function() {
			api.requestEditEntry({id: entry.id});
			return false;
		});
		$entryElement.find('.TODO_entryDeleteButton').click(function() {
			api.requestDeleteEntry({id: entry.id});
			return false;
		});
		$entryElement.appendTo($(list.element));
		$entryElement[0].entryId = entry.id;
		entry.elements.push($entryElement[0]);
		// TODO: add edit callback
		// TODO: add delete callback
		console.warn('addEntryToList not implemented');
	};
	var setEntryData = function($entryElement, entry) {
		$entryElement.find('.TODO_entryName').text(entry.name);
		$entryElement.find('.TODO_entryDueDate').text(formatDate(entry.dueDate));
		$entryElement.find('.TODO_entryProgress').attr('aria-valuenow', entry.progress);
		$entryElement.find('.TODO_entryProgress').css({width: entry.progress + "%"});
		$entryElement.find('.TODO_entryProgressLabel').text(entry.progress);
		$entryElement.find('.TODO_entryDescription').attr('data-content', entry.description);
	}
	
	var formatDate = function(date) {
		// TODO: implement
		return date;
	};
	var parseDate = function(dateString) {
		return dateString;
	};
	
	var getAllEntries = function(params) {
		// params.callback = function()
		
		$.ajax({
			url: '/list/',
			type: 'GET',
			dataType: 'json'
		}).done(function(data, status) {
			console.log('done')
			console.log(data);
			data.forEach(function(entry) {
				entry.elements = [];
			});
			if(typeof params.callback == 'function') {
				params.callback(data);
			}
		});
	};
	
	getAllEntries({
		callback: entriesLoadedCallback
	});
	
	var getEntry = function(id) {
		var entry = null;
		entries.forEach(function(element) {
			if(element.id == id) {
				entry = element;
				return false;
			}
		});
		return entry;
	};
	
	var saveEntry = function(oldEntry, data) {
		$.ajax({
			url: '/list/' + oldEntry.id,
			type: 'PUT',
			data: data,
			beforeSend: function(xhr, settings) {
				if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
					xhr.setRequestHeader("X-CSRFToken", csrftoken);
				}
			},
			success: function() {
				oldEntry.name = data.name;
				oldEntry.description = data.description;
				oldEntry.dueDate = data.dueDate;
				oldEntry.progress = data.progress;
				oldEntry.elements.forEach(function(element) {
					setEntryData(element, oldEntry);
				});
			}
		});
	};
	var deleteEntry = function(entry) {
		$.ajax({
			url: '/list/' + entry.id,
			type: 'DELETE',
			beforeSend: function(xhr, settings) {
				try {
				if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
					xhr.setRequestHeader("X-CSRFToken", csrftoken);
				}
				} catch(exception) {
					console.log(exception);
				}
			},
			success: function() {
				entry.elements.forEach(function(element) {
					element.remove();
				});
				entries.splice(entries.indexOf(entry), 1);
			}
		});
	}
	
	var api = {};
	api.requestDeleteEntry = function(params) {
		// params.id = id
		// params.callback = function(...)
		
		// TODO: implement
		console.warn('requestDeleteEntry not implemented');
		var entry = getEntry(params.id);
		console.log(entry);
		if(entry != null) {
			console.log('found entry');
			var $dialog = $('#confirmDeletePopup').clone();
			$dialog[0].id = '';
			$dialog.find('.TODO_acceptButton').click(function(event){
				console.log(event);
				deleteEntry(entry);
				// TODO: move to callback
				$dialog.modal('hide');
				return false;
			});
			$dialog.bind('hidden.bs.modal', function() {
				$dialog.remove();
			});
			$dialog.modal('show');
		}
	};
	api.requestEditEntry = function(params) {
		// params.id = id
		// params.callback = function(...)
		
		var entry = getEntry(params.id);
		if(entry != null) {
			console.log('found entry');
			var $dialog = $('#editPopup').clone();
			initDialog($dialog, entry, function(){
				saveEntry(entry, {
					id: entry.id,
					name: $dialog.find('.TODO_entryName').val(),
					description: $dialog.find('.TODO_entryDescription').val(),
					progress: $dialog.find('.TODO_entryProgress').val(),
					dueDate: parseDate($dialog.find('.TODO_entryDueDate').val())
				});
				// TODO: move to callback
				$dialog.modal('hide');
				return false;
			});
		}
	};
	api.requestCreateEntry = function(params) {
		// TODO: define parameters
		// TODO: implement
		
		console.log('found entry');
		var $dialog = $('#editPopup').clone();
		initDialog({
			name: '',
			description: '',
			progress: 0,
			dueDate: '2017/05/12'
		}, function(){
			saveEntry(entry, {
				name: $dialog.find('.TODO_entryName').val(),
				description: $dialog.find('.TODO_entryDescription').val(),
				progress: $dialog.find('.TODO_entryProgress').val(),
				dueDate: parseDate($dialog.find('.TODO_entryDueDate').val())
			});
			// TODO: move to callback
			$dialog.modal('hide');
			return false;
		});
	};
	var initDialog = function($dialog, entry, callback) {
		$dialog[0].id = '';
		$dialog.removeClass('TODO_dialogTemplate');
		
		$dialog.find('.TODO_entryName').val(entry.name);
		$dialog.find('.TODO_entryDescription').val(entry.description);
		$dialog.find('.TODO_entryProgress').val(entry.progress);
		$dialog.find('.TODO_entryDueDate').val(entry.dueDate);
		
		$dialog.find('.TODO_acceptButton').click(callback);
		
		$dialog.bind('hidden.bs.modal', function() {
			$dialog.remove();
		});
		$dialog.appendTo($(document.body));
		$dialog.modal('show');
	};
	return api;
})();