require('buffer');
const IPFS = require('ipfs-api')

App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,
  ipfsHash: '',

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    App.displayAccountInfo();
    return App.initContract();
  },

  displayAccountInfo: function () {
    //asynchronous
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
      }
      $("#account").text(account);
      web3.eth.getBalance(account, function (err, balance) {
        if (err === null) {
          $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
        }
      });
    });
  },

  initContract: function () {
    // fetch and store  
    $.getJSON('Archives.json', function (chainListArtifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.Archives = TruffleContract(chainListArtifact);
      // set the provider for our contracts
      App.contracts.Archives.setProvider(App.web3Provider);
      //listen to events 
      App.bindEvents();
      //retrieve the article from the contract
      return App.reloadArtworks();
    })
  },

  reloadArtworks: function () {
    //avoid reentry 
    if (App.loading) {
      return;
    }
    App.loading = true;
    // refresh account information (because the balance might have changed)
    App.displayAccountInfo();
    var contractInstance;
    App.contracts.Archives.deployed().then(function (instance) {
      contractInstance = instance;
      return contractInstance.getArtworks(); //async again -- returns an array of ids all artwks available
    }).then(function (artworksIds) {
      //retrieve the placeholder and clear it
      $('#archivesRow').empty();
      for (var i = 0; i < artworksIds.length; i++) {
        var artworkId = artworksIds[i];
        //take artwks from the mapping
        contractInstance.artworks(artworkId.toNumber()).then(function (artwork) {
          App.displayArtworks(artwork[0], artwork[1], artwork[2], artwork[3], artwork[4]);
        });
      }
      App.loading = false;
    }).catch(function (error) {
      console.error(error.message);
      App.loading = false;
    });
  },

  displayArtworks: function (id, author, name, description, dataHash) {
    var artRow = $('#archivesRow');
    var archiviesTemplate = $('#archiviesTemplate');
    archiviesTemplate.find('.panel-title').text("Title: "+name);
    //archiviesTemplate.find('img').attr('src', data[i].picture);
    archiviesTemplate.find('.art-id').text(id);
    archiviesTemplate.find('.art-author').text(author);
    archiviesTemplate.find('.art-name').text(name);
    archiviesTemplate.find('.art-description').text(description);
    archiviesTemplate.find('img').attr('src', `https://ipfs.io/ipfs/${dataHash}`);
    archiviesTemplate.find('.btn-adopt').attr('data-id', id);

    artRow.append(archiviesTemplate.html());
  },

  uploadArtw: function () {
    if(App.loading) {
      return;
    }
    var artwName = $('#artw_name').val();
    var artwDescription = $('#artw_name').val();
    if ((artwName.trim() == "") || (artwDescription.trim() == "")) {
      //nothing to send exit from the function
      return false;
    }
     //retrieve details of the artw
    console.log("JUST BEFORE THE EVENT", App.ipfsHash);
    console.log(artwName, artwDescription, App.ipfsHash);
    App.contracts.Archives.deployed().then(function (instance) {
      return instance.publishArtwork(artwName, artwDescription, App.ipfsHash, {
        from: App.account
        //gas: 500000
      });
    }).then(function (result) {
      console.log(result);
      var receiptRow = $('#receiptRow');
      //we update our interface in listen for events here we get the receipt
      $.each(result.receipt, function( key, value ) {
        console.log( key + ": " + value );
        var x = document.createElement("li");
        x.innerHTML =  key + ": " + value; 
        receiptRow.append(x);
      });
    }).catch(function (error) {
      console.error(error);
    });
  },

  AddFile: async function (res) {
    var ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }); // leaving out the arguments will default to these values
    console.log("addfile", res);
    App.Loading(true);
    await ipfs.files.add(res, (err, result) => {
      App.Loading(false);
      if (err) {
        console.error(err);
        return
      }
      console.log(App.ipfsHash);
      App.ipfsHash = result[0].hash;
      console.log("ipfshash", App.ipfsHash);
      imagePreview.src = `https://ipfs.io/ipfs/${App.ipfsHash}`;
    });
  },

  Loading: function (val) {
    const loader = document.getElementById("loader");
    const btnSendArt = document.getElementById("sendToChain");
    if (val == true) {
      btnSendArt.classList.add("disabled");
      loader.style.display = "block";
    } else {
      btnSendArt.classList.remove("disabled");
      loader.style.display = "none";
    }
  },

  bindEvents: function () {
    //var articlePrice = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");
    var res = null;
    var imagePreview = document.getElementById("imagePreview");
    imagePreview.src = "http://place-hold.it/400x300";
    //console.log(ipfs);
    //event listeners
    var uploadFile = document.getElementById("captureFileUpload");
    //var submitFile = document.getElementById("addFile");
    uploadFile.addEventListener("change", fileUpload);
    //submitFile.addEventListener("submit", addFile);
    function fileUpload(ev) {
      console.log("fileupl");
      ev.preventDefault();
      console.log("change");
      const file = ev.target.files[0];
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => {
        res = Buffer(reader.result);
        console.log(Buffer(reader.result));
        console.log("this is it", res);
        return App.AddFile(res);;
      }
    };

    App.contracts.Archives.deployed().then(function (instance) {
      instance.LogSendArtw({}, {}).watch(function (error, event) {
        if (!error) {
          //$("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
          console.log("event fired", event.args._name);
        } else {
          console.error(error);
        }
        //reload and update the interface
        App.reloadArtworks();
      });
    });
  }, 
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});