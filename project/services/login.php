<?php
	require_once 'DBConnector.php';
	require_once 'DBFunctions.inc';

	$connector = new DBConnector;
	$db = $connector->connect();

	$sql_tpl = <<<SQL
	SELECT password FROM user 
	WHERE name = '{user}' 
SQL;
	
	$user = $_POST['user'];
	$pw = $_POST['password'];

	$args = array('{user}' => $user);
	$res = db_query($db, $sql_tpl, $args);

	if($pw == $res[0]['password']){
		header('Content-Type: application/json; charset=utf-8');
		echo '{'
				.'"success": true'
			.'}';
	}else{
		header('Content-Type: application/json; charset=utf-8');
		echo '{'
				.'"success": false'
			.'}';
	}
?>