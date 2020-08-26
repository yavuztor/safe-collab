@echo off
MYDIR=%~dp0%
mkdir %MYDIR%\data\gpghome
PUSHD %MYDIR%\data
powershell -Command "wget https://gpg4usb.org/gpg4usb-0.3.3-1.zip"  -Outfile gpg4usb.zip
powershell -Command Expand-Archive gpg4usb.zip -DestinationPath data
echo "Generating keys..."
gpg4usb\bin\gpg.exe --gen-key --homedir gpghome

mkdir SEND_TO_COLLABORATOR
set /P EMAIL="Please enter the email you used to generate your keys:"
gpg4usb\bin\gpg.exe --armor --homedir gpghome --export %EMAIL% > SEND_TO_COLLABORATOR\public.key
echo "Your key is created at %MYDIR%\data\SEND_TO_COLLABORATOR\public.key. Please share your public key with your collaborator."
pause
start data\SEND_TO_COLLABORATOR
POPD
@echo on