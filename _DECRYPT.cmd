@echo off
set MYDIR=%~dp0%
set FILE=%1%
set OUTFILE=%FILE:csv.encrypted=csv%
%MYDIR%data\gpg4usb\bin\gpg.exe --homedir %MYDIR%data\gpghome --decrypt -o %OUTFILE% %FILE%  
echo Decrypted file is at %OUTFILE%
pause

@echo on