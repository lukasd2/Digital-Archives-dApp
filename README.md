# Scheletro progetto su Archivi Digitali

In questo prototipo sono implementate alcune funzionalità per un'applicazione il cui scopo principale è l'inserimento di opere d'arte minori sulle blockchain. Questo esempio può essere facilmente esteso e modificato per implementare nuove funzionalità.

### Architettura

1. Back-end blockchain Ethereum (smart contracts scritti in Solidity)
2. Storage-layer IPFS
2. Connessione back-end e front-end javascript + web3.js (libreria che permette di interagire con i contratti)
2. Connessione back-end e storage-layer Infura (API che fornisce l'accesso al nodo IPFS)
3. Front-end Prototipo in Bootstrap

Lo sviluppo passo dopo passo
1. Utilizzo del framework truffle (httpstruffleframework.com) e in particolare un truffle-box ufficiale, pet-shop (httpstruffleframework.comboxespet-shop) è un boilerplate che ho utilizzato come base del progetto per la struttura generale della directorystruttura dei file. 
1. Sempre all'interno del pacchetto truffle, ho utilizzato Ganache (httpstruffleframework.comganache) per simulare una blockchain virtuale Ethereum.
2. Per la parte relativa ai ruolipermessi dei vari utenti e in particolare per implementare il ruolo di artwork checker ho utilizzato contratti (whitelist.sol, RBAC.sol, Roles.sol e Ownable.sol) forniti e testati dalla comunità di OpenZeppelin (httpsgithub.comOpenZeppelinopenzeppelin-solidity)
1. Durante lo sviluppo ho utilizzato i pacchetti npm buffer (httpswww.npmjs.compackagebuffer) e ipfs-api (httpswww.npmjs.compackageipfs-api)
	1. buffer serve per manipolare i dati binari (sequenze di byte) nel progetto è utilizzato per codifcare l'upload di un file(per esempio un'immagine) in un formato addatto per essere caricato su IPFS. Ad esempio, nel nostro caso, quando facciamo l'upload il file diventa di tipo Uint8Array(38365) [137, 80, 78... etc.
	2. ipfs-api è una libreria (HTTP API implementata in javascript) che permette di connettersi al nodo IPFS come client. 
1. Infura (httpsinfura.io) offre un API per connettersi direttamente a IPFS (httpsinfura.iodocsipfsgetfiles_read) (senza la necessità di mantenere una sessione IPFS in locale quindi non è necessario mantenere una connessione attiva con gli altri peer sulla nostra macchina). 
## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

 [Dropwizard](httpwww.dropwizard.io1.0.2docs) - The web framework used
 [Maven](httpsmaven.apache.org) - Dependency Management
 [ROME](httpsrometools.github.iorome) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](httpsgist.github.comPurpleBoothb24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](httpsemver.org) for versioning. For the versions available, see the [tags on this repository](httpsgithub.comyourprojecttags). 

## Authors

 Billie Thompson - Initial work - [PurpleBooth](httpsgithub.comPurpleBooth)

See also the list of [contributors](httpsgithub.comyourprojectcontributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

 Hat tip to anyone whose code was used
 Inspiration
 etc
