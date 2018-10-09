require('buffer');
const IPFS = require('ipfs-api');
let json = require('../../src/example.json');

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
    $.getJSON('Archives.json', function (archivesArtifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.Archives = TruffleContract(archivesArtifact);
      // set the provider for our contracts
      App.contracts.Archives.setProvider(App.web3Provider);
      //setup data
      //App.loadData();
      //listen to events
      App.bindEvents();
      //retrieve the article from the contract
      return App.reloadArtworks();
    })
  },

  loadData: async function () {
    /*fetch('http://github.com/lukasd2/Drukarnia-Format/blob/master/mergedDataset.json', {mode: 'no-cors'})
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      console.log(JSON.stringify(myJson));
    });*/
    var ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }); 
    console.log(json);
    const finaldata = JSON.stringify(json);
    console.log(finaldata);
    console.log("prova2");
    for(var key in json) {
      console.log(key, json[key]);
      var buf = Buffer.from(JSON.stringify(json[key]));
      const files = [
        {
          //path: '/src/example.json',
          content: buf
        }
      ]
      await ipfs.files.add(files, function (err, files) {
        // 'files' will be an array of objects containing paths and the multihashes of the files added
        if(err) {
          console.log(err);
        return;
        };
        console.log(files);
      })
    }
    /*var buf = Buffer.from(JSON.stringify(json));
    var temp = JSON.parse(buf.toString());
    console.log(buf);
    console.log(temp);
    const files = [
      {
        path: '../example.json',
        content: buf
      }
    ]*/
    
    /*ipfs.files.add(files, function (err, files) {
      // 'files' will be an array of objects containing paths and the multihashes of the files added
      if(err) {
        console.log(err);
      return;
      };
      console.log(files);
    })*/
      
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
          App.displayArtworks(artwork[0], artwork[1], artwork[2], artwork[3], artwork[4], artwork[5]);
        });
      }
      App.loading = false;
    }).catch(function (error) {
      console.error(error.message);
      App.loading = false;
    });
  },

  displayArtworks: function (id, author, name, description, dataHash, validation) {
    var artRow = $('#archivesRow');
    var archiviesTemplate = $('#archiviesTemplate');
    archiviesTemplate.find('.panel-title').text("Title: "+name);
    //archiviesTemplate.find('img').attr('src', data[i].picture);
    archiviesTemplate.find('.art-id').text(id);
    archiviesTemplate.find('.art-author').text(author);
    archiviesTemplate.find('.art-name').text(name);
    archiviesTemplate.find('.art-description').text(description);
    archiviesTemplate.find('.art-validity').text(validation);
    archiviesTemplate.find('.art-validity').attr('data-id', id);
    archiviesTemplate.find('.alert').attr('data-id', id);
    archiviesTemplate.find('img').attr('src', `https://ipfs.io/ipfs/${dataHash}`);
    archiviesTemplate.find('.btn-adopt').attr('data-id', id);
    artRow.append(archiviesTemplate.html());
  },
  /* TODO, not implemented with app.ValidateArtwork function 
  updateArtworkState: function () {
    console.log("updateArtworkState");
    var takeTheBox = document.querySelectorAll(".panel-body");
    var takeVal = document.querySelector("art-validity");
    takeTheBox.forEach(function(key) {
      console.log(takeVal.prev());
    });
    console.log(takeTheBox);
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
        });
      }
    });
  },*/

  generateDC: function () {
    if(App.loading) {
      return;
    }
    let contentRow = $('#column-test-content');
    let generatedXMLCode = '';
  	let generatedHTMLCode = '';
    let title = "";
    title = $('input[name="title"]');
    let creator = "";
    creator = $('input[name="creator"]');
    let subject  = "";
    subject = $('input[name="subject"]');
    let description  = "";
    description = $('textarea[name="description"]');
    /*let date  = "";
    date = $('input[name="date"]');
    let type   = "";
    type = $('input[name="type"]');
    let source  = "";
    source = $('input[name="source"]');
    let language  = "";
    language = $('input[name="language"]');
    let coverage  = "";
    coverage = $('input[name="coverage"]');*/
    console.log(title);
    generatedXMLCode = `
    <dc:title> ${title.val()} </dc:title>
    <dc:creator> ${creator.val()} </dc:creator>
    <dc:subject> ${subject.val()} </dc:subject>
    <dc:description> ${description.val()} </dc:description>
    `

    generatedHTMLCode = `
    <meta name="DC.Title" content="${title.val()}"> 
    <meta name="DC.Creator" content="${creator.val()}"> 
    <meta name="DC.Subject" content="${subject.val()}">
    <meta name="DC.Description" content="${description.val()}">
    `

    console.log(generatedXMLCode);
    console.log(generatedHTMLCode);
    contentRow.text(generatedHTMLCode);
    contentRow.text(generatedHTMLCode);
    contentRow.append(generatedHTMLCode);
    contentRow.append(generatedXMLCode);

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
      //the receipt
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
      //imagePreview.src = `https://ipfs.io/ipfs/${App.ipfsHash}`;URL.createObjectURL
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
  //listen for events global
  bindEvents: function () {
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
        imagePreview.src = URL.createObjectURL(ev.target.files[0]);
        //console.log("this is it", res);
        return App.AddFile(res);;
      }
    };

    App.contracts.Archives.deployed().then(function (instance) {
      instance.LogSendArtw({}, {}).watch(function (error, event) {
        if (!error) {
          console.log("event LogSendArtw fired", event.args._name);
          $("#events").append(`
          <li>
            <b>publishArtwork</b> contract has been called correctly, artwork
            <b>${event.args._name}</b> has been added to the blockchain by account: 
            <b>${event.args._author}</b>
          </li>
        `);
        } else {
          console.error(error);
        }
        //reload and update the interface
        App.reloadArtworks();
      });
    });

    App.contracts.Archives.deployed().then(function (instance) {
      instance.ValidateArtw({}, {}).watch(function (error, event) {
        if (!error) {
          console.log("event validateArtw fired", event.args._id);
          $("#events").append(`
          <li>
            <b>approveArtwork</b> contract has been called correctly, artwork with id: 
            <b>${event.args._id}</b> has been validated by the following artwork checker: 
            <b>${event.args._author}</b>
          </li>
        `);
        } else {
          console.error(error);
        }
        //reload and update the interface
        App.reloadArtworks();
      });
    });
  },

  ValidateArtwork: function (ev) {
    //console.log($(ev.target).data('id'));
    var infoBox = document.createElement('div');
    infoBox.className = "alert alert-success";
    const idToApprove = $(ev.target).data('id');
    console.log(idToApprove);
    App.contracts.Archives.deployed().then(function (instance) {
      return instance.approveArtwork(idToApprove, {
        from: App.account
        //gas: 500000
      });
    }).then(function (result) {
      //
      /* TODO - alert for each panel indicating its status
      var target = $('span[data-id="'+idToApprove+'"]');
      target.append(infoBox);
      console.log(target.append(infoBox));/*
      //App.updateArtworkState();
      App.reloadArtworks();*/

    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});