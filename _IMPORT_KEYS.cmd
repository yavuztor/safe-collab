@echo off
set MYDIR=%~dp0%

%MYDIR%\data\gpg4usb\bin\gpg.exe --homedir %MYDIR%\data\gpghome --import %1% 
@echo on