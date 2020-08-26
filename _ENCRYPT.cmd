@echo off
set MYDIR=%~dp0%

cscript %MYDIR%\create-manifest.js %1% 
@echo on