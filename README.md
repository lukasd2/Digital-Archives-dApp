# Scheletro progetto su Archivi Digitali

In questo prototipo sono implementate alcune funzionalità per un'applicazione il cui scopo principale è l'inserimento di opere d'arte minori sulle blockchain. Questo esempio può essere facilmente esteso e modificato per implementare nuove funzionalità.

## Architettura

Queste sono le tecnologie principali utilizzate (per dettagli sullo sviluppo vedi sezione ["Development"](https://github.com/lukasd2/DigitalArchivesPrototype#development)): 

1. Back-end: blockchain Ethereum (smart contracts scritti in Solidity)
2. Storage-layer: IPFS
2. Connessione back-end e front-end:  javascript + web3.js (libreria che permette di interagire con i contratti)
2. Connessione back-end e storage-layer: Infura (API che fornisce l'accesso al nodo IPFS)
3. Front-end: prototipo con Bootstrap

## Funzionamento e features

Le funzionalità implementate in questo momento sono:
#### 1. Inserimento di opere d'arte minori sulla blockchain Ethereum:
In realtà è possible inserire e registrare qualsiasi file che verrà poi mantenuto in modo permanente e immutabile dentro la blockchain.
Queste sono le informazioni che vengono trasferite con la transazione (compilazione della form con descrizione etc.).
```
//Archives.sol 
struct Artwork {
        uint id;
        address author;
        string name;
        string description;
        string dataHash;// Hash del file relativo all'oggetto memorizzato su IPFS, ad esempio:
                        QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE 
                        vediamo se ritroviamo direttamente l'immagine direttamente memorizzata su ipfs:
                        https://ipfs.io/ipfs/QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE
                        il risultato dovrebbe essere un'immagine con le pale eoliche in bianco e nero
        bool validation; // Indica se l'opera è stata revisionata da un artwork checker 
}
```   
Molte caratteristiche dell'applicazione sono inerenti all'utilizzo di una blockchain pubblica. Al momento ho scelto di limitare il meno possibile quelli che si ritiene siano i maggiori vantaggi di una blockchain aperta. Dunque, i dati inseriti in questo momento sono pubblici, distribuiti (e decentralizzati) perché contenuti dentro la blockchain Ethereum e in parte memorizzati su IPFS. Ovviamente questo supponendo che questo prototipo fosse pubblicato allo stato attuale sulla blockchain Ethereum. 
Purtroppo, nonostante la scelta di Ethereum e IPFS, al momento tra i sistemi più maturi e più sviluppati, si tratta sempre di sistemi in via di sviluppo, allo stato attuale difficilmente adatte a ospitare un’applicazione reale. D’altra parte, un’applicazione di questo tipo può essere facilmente adattata e trasferita su una blockchain privata (ad esempio una blockchain regolata da Proof of Authority) oppure su un sistema alternativo (sidechains? Storj per data strorage ecc.).

Di seguito alcune idee che stavo considerando per continuare il progetto (cercando di trovare un equilibrio senza cercare di limitare funzionalità del protocollo Ethereum ma creando un’applicazione adatta ai requisiti iniziali).

- Aggiungere la possibilità di un upload "privato" visibile solo all'utente e artwork checkers, nascondere questi oggetti dall'interfaccia (front-end) è il primo passo ma inutile per quanto riguarda la visibilità pubblica delle transazioni sulla blockchain e IPFS.
- Per quanto riguardo l'upload dei file su IPFS si potrebbe usare la crittografia assimmetrica, ad esempio utizzando GPG (https://gnupg.org/) per encryption dei file prima di passarli all'IPFS. Un sistema di questo tipo è questo: https://github.com/TroyWilson1/ipfs-add-from-encrypted.
- Limitare la visibilità dei dati sulla blockchain è più difficile (https://medium.com/solidified/keeping-secrets-on-ethereum-5b556c3bb1ee) si potrebbe provare a usare le funzioni hash (https://keccak.team/index.html) come keccak256 in solidity e in web3js (https://web3js.readthedocs.io/en/1.0/web3-utils.html#soliditysha3). In più si può limitare ulteriormente l'accesso estendendo le funzionalità di rule-based access (il contratto whitelist.sol) in modo che certe funzioni possano essere chiamate solo da utenti autorizzati. 


#### 2. Storage layer su IPFS

Tutti i dati troppo grandi per essere memorizzati (immagini, pdf ecc.) sulle blockchain possono essere richiamati da IPFS. In questo progetto utilizziamo una struttura di questo tipo: 

```
//app.js
await ipfs.files.add(res, (err, result) => { //res contiene sequenze di byte prodotto dal buffer precedentemente 
      App.Loading(false);
      if (err) {
        console.error(err);
        return
      }
      App.ipfsHash = result[0].hash;
      imagePreview.src = `https://ipfs.io/ipfs/${App.ipfsHash}`; //quando la promise è conclusa, il valore (hash che indica la posizione su IPFS) viene aggiunto direttamente all'indirizzo. 
```

La compilazione del modulo per l’inserimento di una nuova opera d’arte include la spedizione del file su Ipfs. Prima quindi di poter spedire la transazione sulla blockchain, la richiesta viene processata e in attesa di un upload su IPFS. Se avviene con successo,  otteniamo l’indirizzo hash del nostro file che con la transazione (ora disponibile) memorizziamo in maniera permanente sulla blockchain.

La finalità di IPFS consiste proprio nel mantenere file in maniera permanente e in maniera distribuita. La tecnologia al momento non è pronta e i file non utilizzati (e non condivisi con altri peer) vengono rimossi dopo un certo periodo di tempo. Per non mantenere una o più sessioni attive in locale soltanto per mantenere i file su IPFS si è scelto di usare l’API di Infura che consente l’accesso e l’interazione con il sistema.

#### 3. Ruoli e interfaccia: 

Il funzionamento dei contratti riguardanti i permessi può essere esteso. Abbiamo il ruolo di artwork checker che si trova nella whitelist, questa stabilisce che soltanto chi si trova registrato nella whitelist può utilizzare funzionalità (contratti contrassegnati dal seguente modificatore): 


```
//whitelist.sol
modifier onlyIfWhitelisted(address _operator) {
    checkRole(_operator, ROLE_WHITELISTED);
    _;
  }
```

All'inizio chi crea il contratto (owner) ha la possibilità e i permessi di interagire con i contratti (whitelist.sol, roles.sol ecc) questo è stabilito nel file ownable.sol (con il modificatore onlyOwner nei contratti a livello di inheritance più alto).
In questo momento possiamo interagire con questi contratti direttamente sulla blockchain (ad esempio geth, la console di ganache ecc.).
Ecco come possiamo dare i permessi usando la console di truffle e ganache:

```sh
$ truffle console --network ganache
```

Ora nella console, truffle(ganache)>

Ci riferiamo all'istanza del nostro contratto (Archives):

```
Archives.deployed().then(function(instance){app=instance})
```

Restituisce l'astrazione del nostro contratto (vediamo ad esempio che app.address restituisce l'indirizzo sul quale è del nostro contratto). Aggiungiamo un utente come artwork checker:

```
app.addAddressToWhitelist('0xB2a8488116454e36cB971360e45A6cEc65575483')
```

Controlliamo se è avvenuto con successo, dovrebbe restituire true

```
app.whitelist('0xB2a8488116454e36cB971360e45A6cEc65575483')
```

In questo modo abbiamo aggiunto un utente (contrassegnato da address) con i permessi di artwork checker. Procediamo in maniera analoga per aggiungere altri utenti con permessi speciali. 

- A partire da questa struttura possiamo implementare vari meccanismi, ad esempio un'opera per essere "validata" dovrebbe ottenere l'approvazione di almeno 1/3 di artwork checkers totali. 


Per quanto riguarda front-end, l’interfaccia verrà progettata dall’inizio. Alcune funzionalità che possono essere aggiunte: 

- possibilità di filtare le opere in base allo stato (validato o non), al tipo (immagine, documento, ecc.)
- costruzione di una form vera e propria, idonea all'aggiungere di certi tipi di oggetti


## Development

Lo sviluppo passo dopo passo
1. Utilizzo del framework truffle (https://truffleframework.com) e in particolare un truffle-box ufficiale, pet-shop (https://truffleframework.com/boxes/pet-shop) è un boilerplate che ho utilizzato come base del progetto per la struttura generale della directorystruttura dei file. 
1. Sempre all'interno del pacchetto truffle, ho utilizzato Ganache (https://truffleframework.com/ganache) per simulare una blockchain virtuale Ethereum.
2. Per la parte relativa ai ruolipermessi dei vari utenti e in particolare per implementare il ruolo di artwork checker ho utilizzato contratti (whitelist.sol, RBAC.sol, Roles.sol e Ownable.sol) forniti e testati dalla comunità di OpenZeppelin (https://github.com/OpenZeppelin/openzeppelin-solidity)
1. Durante lo sviluppo ho utilizzato i pacchetti npm buffer (https://www.npmjs.com/package/buffer) e ipfs-api (https://www.npmjs.com/package/ipfs-api)
	1. buffer serve per manipolare i dati binari (sequenze di byte) nel progetto è utilizzato per codifcare l'upload di un file(per esempio un'immagine) in un formato addatto per essere caricato su IPFS. Ad esempio, nel nostro caso, quando facciamo l'upload il file diventa di tipo Uint8Array(38365) [137, 80, 78... etc.
	2. ipfs-api è una libreria (HTTP API implementata in javascript) che permette di connettersi al nodo IPFS come client. 
1. Infura (https://infura.io) offre un API per connettersi direttamente a IPFS (https://infura.io/docs/ipfs/get/files_read) (senza la necessità di mantenere una sessione IPFS in locale quindi non è necessario mantenere una connessione attiva con gli altri peer sulla nostra macchina). 

## Getting Started
Di seguito per iniziare lo sviluppo e interazione con questo progetto con il framework truffle e ganache.
I dettagli di configurazione sono contenuti nel file truffle.js.
Alcuni comandi utili:

Migrazione e reset dei contratti allo stato iniziale (+ starting deployment):

```sh
$ truffle migrate -all --reset --network ganache
```

Avvio di un live server (con lite server):

```sh
$ npm run dev
```


## L'applicazione:

#### 1. In alto abbiamo la sezione dove poter consulare i lavori memorizzati sulla blockchain. Il modulo (in verde) permette di interagire con il contratto e IPFS inserendo un nuovo oggetto (produce una transazione).

![mainpage](/src/img/1-mainpage.png)

#### 2.Durante l'inserimento del file, prima di poter effettuare la transazione, il file viene spedito su IPFS e il relativo indirizzo hash prodotto.

![steptwo](/src/img/2-step.png)

#### 3. Concluso questo passaggio è possibile procedere con la transazione (supponendo che la form sia compilata correttamente ecc.)

![transaction](/src/img/3-transaction.PNG)

#### 4. Risultato della transazione conclusa correttamente e aggiunta dell'oggetto sull'interfaccia

![final](/src/img/4-final.png)

#### 5.Nella barra "Events" è possibile vedere le ultime interazione (chiamate) al contratto. Qui vediamo che un artwork checker ha approvato l'oggetto numero (id: 3) cambiando il suo valore Validation: true.


![validation](/src/img/5-validation.PNG)

## Fine documentazione in development...
