$(document).ready(function(){
	wireButtons();
});

function wireButtons() {

	$('.submit-button').on('click', function(){
		submitData($(this));

	});

	$('a.btn.btn-default').on('click', function(){
		removeItem($(this));
	});

	$('.avatar-text-edit').on('keyup', function(){
		editAvatarString($(this));

		$(this).preventDefault();
	});

	$('.avatar-add-item-button').on('click', function(){

		addToAvatarList($(this));

	});

	$('.timer-input').on('keyup', function(){

		editTimer($(this));

	});

	$('a.btn.btn-default').on('click', function(e){
		e.preventDefault();
	});

	$('a.btn.btn-success').on('click', function(e){
		e.preventDefault();
	});
}

function submitData(evt) {
	var input = $(evt).parent().find('input');

	if ($(input).val().trim() == '') {
		alert('Enter a value');
		return;
	}

	$.ajax({
		url: '/add',
		method: "POST",
		data: { operation: $(evt).data('route'), data: $(input).val() },
		success: function(data) {
			console.log('submitData Ajax Success: ');
			console.dir(data);
			if ('success' == data.status) {
				console.log('is true');
				$(evt).parent().parent().find('.alert.alert-success').html('Successfully Added ' + $(input).val()).removeClass('hide').show();
				//Reset input
				$(input).val('');

				console.dir(data);

				var target_well = $(evt).parent().parent().find('.well');

				//Clear old panel data
				$(target_well).html('');

				data.update_data.forEach(function(item){

					var link = '<a href="#" class="btn btn-default"><i class="fa fa-close"></i> ' + item + '</a>';

					$(target_well).append($(link));

				});

				wireButtons();
			}
		},
		error: function(error) {
			console.log('submitData Ajax Error: ');
			console.dir(error);
		}
	});
}

function removeItem(evt) {

	debugger;

	if ((/\/avatars\//).test(window.location.href)) {

		//Route is structured differently on /avatar
		var
			avatarname = window.location.pathname.split('/').pop(),
			fieldname = $(evt).parent().parent().data('fieldname'),
			value = $(evt)[0].innerText.trim(),
			sectionname = $(evt).parent().parent().parent().parent().data('parentobject'),
			target_ul = $(evt).parent().parent()
		;

		var post_body = { avatarname: avatarname, sectionname: sectionname, fieldname: fieldname, value: value }

		$.ajax({
			url: '/delete_avatar_item',
			method: 'POST',
			data: post_body,
			success: function(data) {
				console.dir(data);
				if ('success' == data.status){
					console.log('successfully deleted avatar item');


					var updated_data = data.update_data.config[sectionname][fieldname];

					//Build html to render updated list
					var html = '<ul class="config-list" data-fieldname="'+ fieldname +'">';
					updated_data.forEach(function(item){

						html += '<li><a href="#" class="btn btn-default"><i class="fa fa-close"> ' + item + '</i></a></li>';

					});

					html += '</ul>';

					//Render updated list
					$(target_ul).html(html);

				}
			},
			error: function(error) {
				console.log('removeItem: avatar ajax error:');
				console.dir(error);
			}

		});

	} else {
		debugger;

		var
			value = $(evt)[0].innerText.trim(),
			route = $(evt).parent().parent().data('fieldname')
		;

		var post_body = { operation: route, data: value };
		console.dir(post_body);

		$.ajax({
			url: '/delete',
			method: 'POST',
			data: post_body,
			success: function(data) {
				console.dir(data);
				if ('success' == data.status) {
					console.log('successfully deleted');
					$(evt).parent().parent().find('.alert.alert-success').html('Successfully Deleted ' + value).removeClass('hide').show();

					var target_well = $(evt).parent().parent().find('.well');

					$(target_well).html('');

					data.update_data.forEach(function(item) {

						var link = '<a href="#" class="btn btn-default"><i class="fa fa-close"></i>' + item + '</a>';

						console.dir($(link));

						$(target_well).append($(link));
					});

					wireButtons();
				}
			},
			error: function(error) {
				console.log('removeItem Ajax Error:');
				console.dir(error);
			}
		});
	}
}

function removeAvatarItem(evt){

}

function editAvatarString(evt) {
	var
		avatarname = window.location.pathname.split('/').pop(),
		sectionname = $(evt).parent().parent().data('parentobject'),
		value = $(evt).val().trim(),
		fieldname = $(evt).data('fieldname');
	;

	$(evt).removeClass('saved').addClass('saving');

	$.ajax({
		url: '/modify_avatar_field',
		method: 'POST',
		data: { avatarname: avatarname, sectionname: sectionname, fieldname: fieldname, value: value },
		success: function(data) {
			console.log('editAvatarString ajax success: ');
			console.log(data);

			$(evt).removeClass('saving').addClass('saved');

			setTimeout(function(){
				$('.saved').removeClass('saved');
			}, 600);

		},
		error: function(error) {
			console.error('editAvatarString ajax failure: ' + error);
			$(evt).removeClass('saving').removeClass('saved').addClass('save-error');
		}
	});

}

function addToAvatarList(evt) {
	var
		avatarname = window.location.pathname.split('/').pop(),
		value = $(evt).parent().find('input').val(),
		sectionname = $(evt).parent().parent().data('parentobject'),
		fieldname = $(evt).data('fieldname'),
		target_ul = $(evt).parent().find('ul')
	;

	$.ajax({
		url: '/add_avatar_list_item',
		method: 'POST',
		data: { avatarname: avatarname, sectionname: sectionname, fieldname: fieldname, value: value },
		success: function(data) {
			console.log('addToAvatarList ajax success: ');

			//Get updated record set
			console.dir(data);
			//
			var updated_data = data.doc.config[sectionname][fieldname];

			//Build html to render updated list
			var html = '<ul class="config-list">';
			updated_data.forEach(function(item){

				html += '<li><a href="#" class="btn btn-default"><i class="fa fa-close"> ' + item + '</i></a></li>';

			});

			html += '</ul>';

			//Render updated list
			$(target_ul).html(html);

			//Clear input
			$(evt).parent().find('input').val('');
		},
		error: function(error) {

		}
	})
}

function editTimer(evt) {
	var
		avatarname = window.location.pathname.split('/').pop(),
		timername = $(evt).data('timername'),
		timertype = $(evt).data('timertype'),
		value = $(evt).val(),
		sectionname = 'timers'
	;

	$.ajax({
		url: '/modify_avatar_timer',
		method: 'POST',
		data: { avatarname: avatarname, sectionname: sectionname, value: value, timertype: timertype, timername: timername },
		success: function(data) {
			console.log('editTimer ajax success: ');
			console.dir(data);
		},
		error: function(error) {
			console.log('editTimer ajax error: ');
			console.dir(error);
		}
	});
}

