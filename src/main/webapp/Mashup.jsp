<!DOCTYPE html>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ page contentType="text/html; charset=UTF-8"%>
<html lang="es">

<head>
<title>Moovid</title>

<link
	href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700&display=swap"
	rel="stylesheet">
<link rel="stylesheet" type="text/css" href="mystyle.css">
<link rel="icon" type="image/png" href="images/Moovid logo color.png">
<script src="https://code.jquery.com/jquery-3.5.0.min.js"
	integrity="sha256-xNzN2a4ltkB44Mc/Jz3pT4iU1cmeR0FkXs4pru/JxaQ="
	crossorigin="anonymous"></script>
<meta charset="utf-8">
<meta name="google-signin-client_id"
	content="719553712189-o30q99ddl6293f6p5qrde7eak1a2u02b.apps.googleusercontent.com">
<meta name="google-signin-client_id"
	content="719553712189-o30q99ddl6293f6p5qrde7eak1a2u02b.apps.googleusercontent.com">
<script src="https://apis.google.com/js/platform.js" async defer></script>
<script src="https://apis.google.com/js/platform.js?onload=renderButton"
	async defer></script>
<script src="buttonscript.js"></script>
<script src="chat.js"></script>

</head>

<body>
	<img class="bg" src="images/background.png" />

	<div class="col-container">
		<div class="col-yellow1">
			<div class="title-container">
				<div class="title-inside-yellow">YOU</div>
				<div class="black-line"></div>
			</div>
			<div class="col-content middle">
				<div class="subtitle-for-yellow1">Inicia sesión con</div>
				<a id="photosbutton" href="/photoslogin" class="button3"> <img
					src="images/gfotos logo.png" id="gfotoslogo">
					<p>GOOGLE PHOTOS</p>
				</a> 
			</div>
		</div>

		<div class="col-yellow2">
			<div class="title-container">
				<div class="title-inside-yellow">MOOVID</div>
				<div class="black-line"></div>
			</div>

			<div class="chat-container" id="chat-container">
			</div>
			<div class="chat-footer">
				<input type="text" placeholder="Escribe tu mensaje aquí"
					id="chatbox" class="chatbot" value=""> <input type="button"
					value="ENVIAR" class="send-button" id="send-button">
			</div>
		</div>

	</div>

	<div>
		<footer id="footer">Moovid &copy; 2020</footer>
	</div>

</body>

</html>