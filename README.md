# safe-collab: Use GPG to secure CSV data collaboration

A common scenario around data collaboration is sharing CSV files via FTP or any other file sharing platform. Securing the data during this collaboration is important, so that both parties sharing data are confident that what they receive is from the correct party and it's not modified in transfer. 

GPG is a nice tool to be used for this, however it is not a tool commonly used in Windows. This repository contains scripts to simplify this process.

## Getting started

* Head over to the [github releases](https://github.com/yavuztor/safe-collab/releases) and download the latest version. 
* Extract the zip file somewhere on your computer and open the extracted folder.
* Double-click on **_INITIAL_SETUP.cmd**. Follow the directions on the screen.
* The setup will create `data\SEND_TO_COLLABORATOR` folder with your public key in it. Send this key to your collaborator and ask them to send their public key to you.
* Once you have your collaborator's public key, drag and drop the public key file onto **_IMPORT_KEYS.cmd**. This will import the public key into GPG, so that you can send encrypted files to that collaborator. Remember your collaborator's email that corresponds to their public key.

## Sending a CSV file
* When you have your CSV file ready, drag and drop the CSV file onto **_ENCRYPT.cmd**. Follow the instructions on the screen.
* This last step creates 2 files: one ending with `.manifest` and another one ending with `.encrypted`. You can share these two files with your collaborator.

## Decrypting a file
* When you receive an encrypted CSV file (name ending with `.csv.encrypted`) from your collaborator, drag and drop the encrypted file onto **_DECRYPT.cmd**. The decrypted file will be created in the same folder with name ending with `.csv`.