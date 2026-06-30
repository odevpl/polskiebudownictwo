<?php
declare(strict_types=1);
function smtpRead($s,array $codes):string{$r='';while(($l=fgets($s,515))!==false){$r.=$l;if(strlen($l)>=4&&$l[3]===' ')break;}if(!in_array((int)substr($r,0,3),$codes,true))throw new RuntimeException('Błąd SMTP: '.trim($r));return $r;}
function smtpCommand($s,string $c,array $codes):string{if(fwrite($s,$c."\r\n")===false)throw new RuntimeException('Nie udało się wysłać polecenia SMTP.');return smtpRead($s,$codes);}
function smtpSend(array $cfg,string $to,string $reply,string $subject,string $text,?string $html=null):void{
 $host=(string)($cfg['host']??'');$port=(int)($cfg['port']??587);$enc=strtolower((string)($cfg['encryption']??'tls'));$user=(string)($cfg['username']??'');$pass=(string)($cfg['password']??'');
 if(!$host||!$user||!$pass)throw new RuntimeException('Brak konfiguracji SMTP.');
 $s=stream_socket_client(($enc==='ssl'?'ssl://':'').$host.':'.$port,$ec,$em,15,STREAM_CLIENT_CONNECT);if(!$s)throw new RuntimeException("Połączenie SMTP nieudane: {$em}");stream_set_timeout($s,15);
 try{smtpRead($s,[220]);smtpCommand($s,'EHLO polskiebudownictwo.org',[250]);if($enc==='tls'){smtpCommand($s,'STARTTLS',[220]);if(!stream_socket_enable_crypto($s,true,STREAM_CRYPTO_METHOD_TLS_CLIENT))throw new RuntimeException('Nie udało się uruchomić TLS.');smtpCommand($s,'EHLO polskiebudownictwo.org',[250]);}
 smtpCommand($s,'AUTH LOGIN',[334]);smtpCommand($s,base64_encode($user),[334]);smtpCommand($s,base64_encode($pass),[235]);smtpCommand($s,'MAIL FROM:<'.$user.'>',[250]);smtpCommand($s,'RCPT TO:<'.$to.'>',[250,251]);smtpCommand($s,'DATA',[354]);
 $h=['From: Polskie Budownictwo <'.$user.'>','To: <'.$to.'>','Reply-To: <'.$reply.'>','Subject: =?UTF-8?B?'.base64_encode($subject).'?=','Date: '.date(DATE_RFC2822),'MIME-Version: 1.0'];$body=$text;
 if($html!==null){$b='pb_'.bin2hex(random_bytes(12));$h[]='Content-Type: multipart/alternative; boundary="'.$b.'"';$body="--{$b}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n{$text}\r\n--{$b}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n{$html}\r\n--{$b}--";}else{$h[]='Content-Type: text/plain; charset=UTF-8';}
 $body=preg_replace('/^\./m','..',str_replace(["\r\n","\r"],"\n",$body));smtpCommand($s,implode("\r\n",$h)."\r\n\r\n".str_replace("\n","\r\n",$body)."\r\n.",[250]);smtpCommand($s,'QUIT',[221]);}finally{fclose($s);}
}
