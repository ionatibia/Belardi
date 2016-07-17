$(document).ready(function() {
	//para crear usuario
	$('#signup').submit(function(event) {
		event.preventDefault();
		var data = $(this).serializeArray();

		$.ajax({
			url: 'http://localhost:8000/auth/signup',
			type: 'post',
			dataType: 'json',
			data: data,
			success: function (data) {
				$.cookie('token', data.token, { expires: 1 });
				alert($.cookie('token'));
			}
		})
		.fail(function() {
			console.log("error");
		})		
	});


	//login de usuarios
	$('#login').submit(function(event) {
		event.preventDefault();
		var data = $(this).serializeArray();

		$.ajax({
			url: 'http://localhost:8000/auth/login',
			type: 'post',
			dataType: 'json',
			data: data,
			success: function (data) {
				$.cookie('token', data.token, { expires: 1 });
				alert($.cookie('token'));
			}
		})
		.fail(function() {
			console.log("error");
		})		
	});


	//para entrar en una página privada
	$('#privado').click(function(event) {
		//si localmente no tengo el token hay que hacer login
		if ($.cookie('token') == undefined) {
			//a login
			alert("No tienes token");
		}else{
			$.ajax({
				url: 'http://localhost:8000/private',
				type: 'get',
				dataType: 'html',
				//esto es lo IMPORTANTE añadir el atributo headers que es un objeto con el atributo 'x-access-token' (lo mismo que en el servidor) + el valor del token guardado
				headers:{
					'x-access-token':token
				},
				success: function (data) {
					alert(data);//la api me devuelve el _id de usuario que ha decodificado desde el token enviado 
				}
			})
			.fail(function() {
				console.log("error");
			})	
		}
	});

});