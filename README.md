# Blockchain & IPFS Digital Archives storage

Description TODO

###### Created on: 11/2018 / Live version: https://lukasd2.github.io/Digital-Archives-dApp/src/artworks.html

#### With Ethereum blockchain we can track every transaction made e.g. using this app interface!
#### https://ropsten.etherscan.io/address/0x21af2ac807dd0ce64e242c35f57219341218d3d1
(old deployment used before the presentation) https://ropsten.etherscan.io/address/0xb6d296f2402fee810171a5d9b148f1744d10413c

## Getting Started 

The easiest way to interact with this app is through Metamask plugin:  
1. Install Metamask (https://metamask.io/) available for Chrome, Firefox and Opera or get Brave Browser (https://brave.com/)
2. Access Metamask and create a new account (new seedphrase)
3. Using Metamask switch to Ropsten Testnet 
4. In order to make transaction within the app add founds to your account, these can be requested through metamask using Ropsten Faucet (it should be the left button, called "Deposit" below the box where amount of ether is displayed)
5. Voilà you should be able to interact with Ethereum dApps (precisely smart contracts) located on Ropsten (like this one)

Also you can find multiple tutorials on how to interact with dApps like this one: https://blog.wetrust.io/how-to-install-and-use-metamask-7210720ca047

## Architettura

Queste sono le tecnologie principali utilizzate (per dettagli sullo sviluppo vedi sezione ["Development"](https://github.com/lukasd2/DigitalArchivesPrototype#development)): 

1. Back-end: blockchain Ethereum (smart contracts scritti in Solidity)
2. Storage-layer: IPFS
2. Connessione back-end e front-end:  javascript + web3.js (libreria che permette di interagire con i contratti)
2. Connessione back-end e storage-layer: Infura (API che fornisce l'accesso al nodo IPFS)
3. Front-end: prototipo con Bootstrap
