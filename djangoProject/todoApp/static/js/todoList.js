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
	
	var DEBUG = false;
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
		$entryElement.find('.TODO_entryDescription').popover();
		var editevent = $(list.element).hasClass('TODO_singleClickEdit') ? 'click' : 'dblclick';
		$entryElement.on(editevent, function() {
			api.requestEditEntry(entry);
			return false;
		});
	};
	var setEntryData = function($entryElement, entry) {
		$entryElement.find('.TODO_entryName').text(entry.name);
		$entryElement.find('.TODO_entryDueDate').text(formatDate(entry.dueDate));
		$entryElement.find('.TODO_entryProgress').attr('aria-valuenow', entry.progress);
		$entryElement.find('.TODO_entryProgress').css({width: entry.progress + "%"});
		$entryElement.find('.TODO_entryProgressLabel').text(entry.progress);
		$entryElement.find('.TODO_entryDescription').attr('data-content', entry.description);
	}
	
	var formatDate = function(dateString) {
		var date = new Date(dateString);
		return $.format.date(date, 'yyyy/MM/dd');
	};
	var formatDateForSlider = function(dateString) {
		var date = new Date(dateString);
		console.log('for slider:', $.format.date(date, 'yyyy-MM-dd'));
		return $.format.date(date, 'yyyy-MM-dd');
	};
	var parseDate = function(dateString) {
		var date = new Date(dateString);
		return date.toISOString();
	};
	
	var getAllEntries = function(params) {
		// params.callback = function()
		var successCallback = function(data, status) {
			data.forEach(function(entry) {
				entry.elements = [];
			});
			if(typeof params.callback == 'function') {
				params.callback(data);
			}
		};
		if(!DEBUG) {
			$.ajax({
				url: '/list/',
				type: 'GET',
				dataType: 'json'
			}).done(successCallback);
		} else {
			successCallback(DEBUG_mockupEntries, null);
		}
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
	
	var createEntry = function(data) {
		var successCallback = function(response) {
			data.elements = [];
			data.id = response.id;
			entries.push(data);
			addEntryToLists(data);
		};
		if(!DEBUG) {
			$.ajax({
				url: '/list/',
				type: 'POST',
				data: data,
				dataType: 'json',
				beforeSend: function(xhr, settings) {
					if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
						xhr.setRequestHeader("X-CSRFToken", csrftoken);
					}
				},
				success: successCallback
			});
		} else {
			successCallback();
		}
	};
	var saveEntry = function(oldEntry, data) {
		var successCallback = function() {
			oldEntry.name = data.name;
			oldEntry.description = data.description;
			oldEntry.dueDate = data.dueDate;
			oldEntry.progress = data.progress;
			oldEntry.elements.forEach(function(element) {
				setEntryData($(element), oldEntry);
			});
		};
		if(!DEBUG) {
			$.ajax({
				url: '/list/' + oldEntry.id + '/',
				type: 'PUT',
				data: data,
				beforeSend: function(xhr, settings) {
					if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
						xhr.setRequestHeader("X-CSRFToken", csrftoken);
					}
				},
				success: successCallback
			});
		} else {
			successCallback();
		}
	};
	var deleteEntry = function(entry) {
		var successCallback = function() {
			entry.elements.forEach(function(element) {
				element.remove();
			});
			entries.splice(entries.indexOf(entry), 1);
		};
		if(!DEBUG) {
			$.ajax({
				url: '/list/' + entry.id + '/',
				type: 'DELETE',
				beforeSend: function(xhr, settings) {
					if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
						xhr.setRequestHeader("X-CSRFToken", csrftoken);
					}
				},
				success: successCallback
			});
		} else {
			successCallback();
		}
	}
	
	var api = {};
	api.requestDeleteEntry = function(params) {
		// params.id = id
		// params.callback = function(...)
		
		var entry = getEntry(params.id);
		if(entry != null) {
			var $dialog = $('#confirmDeletePopup').clone();
			$dialog[0].id = '';
			$dialog.find('.TODO_acceptButton').click(function(event){
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
		
		var $dialog = $('#editPopup').clone();
		initDialog($dialog, {
			name: '',
			description: '',
			progress: 0,
			dueDate: (new Date()).toISOString()
		}, function(){
			createEntry({
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
		$dialog.appendTo($(document.body));
		
		var valueChangeEvent = function(event) {
			$dialog.find('.TODO_entryProgressDisplay').text(event.value.newValue + ' %');
		};
		
		$dialog.find('.TODO_entryName').val(entry.name);
		$dialog.find('.TODO_entryDescription').val(entry.description);
		$dialog.find('.TODO_entryProgress').slider({
			value: entry.progress,
			formatter: function(value) {
				return value + ' %';
			},
			change: valueChangeEvent,
			slide: valueChangeEvent
		}).change(valueChangeEvent);
		$dialog.find('.TODO_entryProgressDisplay').text(entry.progress + ' %');
		$dialog.find('.TODO_entryDueDate').val(formatDateForSlider(entry.dueDate));
		
		$dialog.find('.TODO_acceptButton').click(callback);
		
		$dialog.bind('hidden.bs.modal', function() {
			$dialog.remove();
		});
		$dialog.attr('tabindex',1);
		$dialog.modal('show');
	};
	return api;
})();