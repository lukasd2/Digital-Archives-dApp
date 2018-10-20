require('buffer');
const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }); // leaving out the arguments will default to these values

App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,
  ipfsHash: '',
  ipfsHashStore: [],
  store: [],
  data: {},

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
      return contractInstance.getArtworks(); //async again -- returns an array of ids all artworks available
    }).then(function (artworksIds) {
      //retrieve the placeholder and clear it
      $('#archivesRow').empty();
      for (var i = 0; i < artworksIds.length; i++) {
        var artworkId = artworksIds[i];
        //take artworks from the mapping
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

  displayArtworks: function (id, author, name, descriptionHash, dataHash, validation) {
    var artRow = $('#archivesRow');
    var archiviesTemplate = $('#archiviesTemplate');
    archiviesTemplate.find('.panel-title').text("Title: "+name);
    //archiviesTemplate.find('img').attr('src', data[i].picture);
    archiviesTemplate.find('.art-id').text(id);
    archiviesTemplate.find('.art-author').text(author);
    archiviesTemplate.find('.art-name').text(name);
    archiviesTemplate.find('.art-description').text(`https://ipfs.io/ipfs/${descriptionHash}`);
    if(id == 5) {
      App.testing(descriptionHash);
    }
    archiviesTemplate.find('.art-validity').text(validation);
    archiviesTemplate.find('.art-validity').attr('data-id', id);
    archiviesTemplate.find('.alert').attr('data-id', id);
    archiviesTemplate.find('img').attr('src', `https://ipfs.io/ipfs/${dataHash}`);
    archiviesTemplate.find('.btn-adopt').attr('data-id', id);
    artRow.append(archiviesTemplate.html());
  },

  testing: (desc) => {
    let contentRow = $('#column-test-content');
    ipfs.files.cat(desc, function (err, file) {
      if (err) {
        throw err
      }
      //console.log(file.toString('utf8'));
      let test =  file.toString('utf8');
      contentRow.text(test);
      //console.log("heey", test);
      return test;
    });
  },

  uploadData: () => {
    App.filesToIPFS(App.store);
  },

  generateMetadata: function (hash) {
    if(App.loading) {
      return;
    }
    console.log("test", hash)
    App.loading = true;
    console.log("step start generateMetadata");
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
    /*
    const data = [
      {
        title: `<meta name="DC.Title" content="${title.val()}">`,
        creator: `<meta name="DC.Creator" content="${creator.val()}">`
        
      },
      {test: `${hash}`},
      {test2: `${App.ipfsHashStore}`}
  ]*//*
  const data = 
    {
      description: generatedXMLCode,
      test: hash,
      test2: App.ipfsHashStore
    };*/
    const data = 
    {
      name: title.val(),
      description: generatedXMLCode,
      objectPreview: hash,
      objectFiles: App.ipfsHashStore
    };
  App.data = data;
  console.log(App.ipfsHash);
  console.log("step end generateMetadata");
  App.descriptionToIPFS(data);
  App.loading = false;
  return;
  },

  uploadArtw: function (hash, objectDesc) {
    if(App.loading) {
      return;
    }
    /*
    var artwName = $('#artw_name').val();
    var artwDescription = $('#artw_name').val();
    if ((artwName.trim() == "") || (artwDescription.trim() == "")) {
      //nothing to send exit from the function
      return false;
    }*/
     //retrieve details of the artw
    console.log("JUST BEFORE THE EVENT App.ipfsHash", App.ipfsHash);
    console.log("JUST BEFORE THE EVENT hash", hash);
    console.log("blob", objectDesc);
    console.log(objectDesc.description)
    //console.log(artwName, artwDescription, App.ipfsHash);
    console.log(objectDesc.name, hash, App.ipfsHash);
    App.contracts.Archives.deployed().then(function (instance) {
      return instance.publishArtwork(objectDesc.name, hash, App.ipfsHash, {
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

  filesToIPFS: async function (fileSequence) {
    console.log("filesToIPFS", fileSequence);
    App.loading = true;
    await ipfs.files.add(fileSequence, (err, result) => {
      if (err) {
        console.error(err);
        return
      }
      for(let key in result) {
        console.log("keys", key);
        App.ipfsHashStore.push(result[key].hash);
      }
      console.log("ipfs result", result);
      const hash = result[0].hash;
      App.ipfsHash = hash;
      App.loading = false;
      console.log('added data hash:', hash);
      App.generateMetadata(hash);

      /*ipfs.files.cat(hash, function (err, file) {
        if (err) {
          throw err
        }
        //console.log(file.toString('utf8'));
        let test =  file.toString('utf8');
        //console.log("heey", test);
      });*/
  });
  /*;*/
  //console.log(`https://ipfs.io/ipfs/${await App.ipfsHash}`);
  },
  descriptionToIPFS: async function (objectDescription) {
    console.log("descriptionToIPFS", objectDescription);
    let uploadDesc = Buffer.from(JSON.stringify(objectDescription));
    App.loading = true;
    await ipfs.files.add(uploadDesc, (err, result) => {
      App.loading = false;
      if (err) {
        console.error(err);
        return
      }
      console.log("ipfs result", result);
      const hash = result[0].hash;
      console.log('added data hash:', hash);
      App.uploadArtw(hash, objectDescription);
      ipfs.files.cat(hash, function (err, file) {
        if (err) {
          throw err
        }
        //console.log(file.toString('utf8'));
        let test =  file.toString('utf8');
        console.log("heey", test);
      });
      return hash;
    })
  },

  Loading: function (val) {
    const loader = document.getElementById("loader");
    const btnSendArt = document.getElementById("sendToChain");
    if (val == true) {
      //btnSendArt.classList.add("disabled");
      loader.style.display = "block";
    } else {
      //btnSendArt.classList.remove("disabled");
      loader.style.display = "none";
    }
  },

  //listen for events global
  bindEvents: function () {
    var imagePreview = document.getElementById("imagePreview");
    imagePreview.src = "http://place-hold.it/150x150";
    //event listeners
    var uploadFile = document.getElementById("captureFileUpload");
    uploadFile.addEventListener("change", fileUpload);
    function fileUpload(ev) {
      console.log(ev);
      const files = ev.target.files;
      let fileResult = document.getElementById("filePreview");
      //let store = [];
      let sessionIndex = App.store.length;
      let eventIndex = 0;
      console.log("sessionIndex",sessionIndex);
      for(let i = sessionIndex; i < (sessionIndex+files.length); i++) {
        let file = files[eventIndex];
        if(!file.type.match('image')) continue;
        let readerIndex = eventIndex; //looks like there is some problem with chaining events
        eventIndex++;
        const reader = new window.FileReader();
        console.log(file);
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
          App.store.push(Buffer(reader.result));
          console.log(Buffer(reader.result));
          let preview = document.createElement('img');
          let deleteBtn = document.createElement('button');
          deleteBtn.classList = 'delete is-small';
          deleteBtn.setAttribute('data-id', i);
          preview.setAttribute('data-id', i);
          preview.src = URL.createObjectURL(ev.target.files[readerIndex]);
          preview.addEventListener('click', choose);
          //imagePreview.src = URL.createObjectURL(ev.target.files[i]);
          let test = document.createElement('span'); //TODO testing purposes
          test.append(preview);
          test.append(deleteBtn);
          fileResult.append(test);
          //console.log("this is it", res);
        }
      }
    function choose (ev) {
      let fileResult = document.getElementById("filePreview");
      let imgList = fileResult.querySelectorAll('img');
      for(let element of imgList) {
        element.classList = '';
      }
      let selectedElementId = ev.target.getAttribute('data-id')
      console.log("before", App.store);
      console.log("selectedElementId",selectedElementId);
      if(selectedElementId == App.store[0]) {
        ev.target.classList.toggle("mainPreview");
        return;
      }
      let temp = App.store[0];
      App.store[0] = App.store[selectedElementId];
      App.store[selectedElementId] = temp;
      console.log("after", App.store);
      console.log(ev);
      console.log(ev.target);
      ev.target.classList.toggle("mainPreview");
      console.log("num", selectedElementId);
      //App.store.splice(ev.target.id, 1);
      //console.log("this", this);
      //this.parentNode.removeChild(this);

      //console.log(App.store);
    }
    }

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