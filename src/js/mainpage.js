window.addEventListener('load', function() {
    console.log("loaded");
    const messageElement = document.querySelector('.message');
    const messageContent = messageElement.querySelector('.message-body');
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3js = new Web3(web3.currentProvider);
      messageContent.innerHTML = `<p>Sei <strong>connesso con successo</strong> alla rete Ethereum.</p>
      <p>Stai utilizzando web3 nella versione <strong>${web3.version.api}.</p>`;
      console.log(web3js);
      web3.version.getNetwork((err, netId) => {
        switch (netId) {
          case "1":
            console.log('This is mainnet')
            break
          case "2":
            console.log('This is the deprecated Morden test network.')
            break
          case "3":
            console.log('This is the ropsten test network.')
            messageContent.innerHTML += `<p>Sei <strong>connesso con successo</strong> alla test network <strong>Ropsten</strong>.</p>`;
            break
          case "4":
            console.log('This is the Rinkeby test network.')
            break
          case "42":
            console.log('This is the Kovan test network.')
            break
          default:
            console.log('This is an unknown network.')
        }
      })
    } else {
      console.log('No web3? You should consider trying MetaMask!')
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
  })