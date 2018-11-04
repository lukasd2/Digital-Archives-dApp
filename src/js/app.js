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
  metaData: {},
  artworkCheckerPermissions: false,

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
      $('#account').text(account);
      web3.eth.getBalance(account, function (err, balance) {
        if (err === null) {
          $('#accountBalance').text(web3.fromWei(balance, 'ether') + ' ETH');
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
      App.showPermissions();
      return App.reloadArtworks();
    })
  },

  showPermissions: () => {
    let contractInstance;
    App.contracts.Archives.deployed().then(function (instance) {
      contractInstance = instance;
      return contractInstance.whitelist(App.account); //async again -- returns an array of ids all artworks available
    }).then(function (bool) {
      if(bool) {
        $('#accountPermission').text("Artwork Checker");
      } else {
        $('#accountPermission').text("User");
      }
    });
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
          App.displayArtworks(artwork[0], artwork[1], artwork[2], artwork[3], artwork[4], artwork[5], artwork[6]);
        });
      }
      App.loading = false;
    }).catch(function (error) {
      console.error(error.message);
      App.loading = false;
    });
  },

  displayArtworks: function (id, author, name, descriptionHash, dataHash, validation, voteNum) {
    const artRow = $('#archivesRow');
    const archiviesTemplate = $('#archiviesTemplate');
    archiviesTemplate.find('.panel-title').text('Title: '+name);
    archiviesTemplate.find('.art-id').text(id);
    archiviesTemplate.find('.artwork-object').attr('data-id', id);
    archiviesTemplate.find('.artwork-object').attr('data-val', validation);
    archiviesTemplate.find('.art-author').text(author);
    archiviesTemplate.find('.progress').attr('value', voteNum);
    archiviesTemplate.find('.art-name').text(name);
    archiviesTemplate.find('.art-description').text(`https://ipfs.io/ipfs/${descriptionHash}`);
    archiviesTemplate.find('.art-validity').text(validation);
    archiviesTemplate.find('.art-validity').attr('data-id', id);
    archiviesTemplate.find('.alert').attr('data-id', id);
    archiviesTemplate.find('img').attr('src', `https://ipfs.io/ipfs/${dataHash}`);
    archiviesTemplate.find('.object-button').attr('data-id', id);
    artRow.append(archiviesTemplate.html());
  },

  uploadData: () => {
    App.filesToIPFS(App.store);
  },

  generateMetadata: function (hash) {
    if(App.loading) {
      return;
    }
    App.loading = true;
    console.log('step start generateMetadata');
    const contentRow = $('#column-test-content');
    let generatedXMLCode = '';
  	let generatedHTMLCode = '';
    let title = '';
    title = $('input[name="title"]');
    let creator = '';
    creator = $('input[name="creator"]');
    let subject  = '';
    subject = $('input[name="subject"]');
    let publisher = [];
	  publisher = $('input[name="publisher"]');
    let description  = '';
    description = $('textarea[name="description"]');
    let date  = '';
    date = $('input[name="date"]');
    let type   = '';
    type = $('input[name="type"]');
    let format = [];
    format = $('input[name="format"]');
    let relation = [];
	  relation = $('input[name="relation"]');
    let source  = '';
    source = $('input[name="source"]');
    let language  = '';
    language = $('input[name="language"]');
    let coverage  = '';
    coverage = $('input[name="coverage"]');
    let rights  = '';
    rights = $('input[name="rights"]');
    const optionSimpleDC = document.getElementById('dublinCoreBtn');
    const optionExtendedDC = document.getElementById('dublinExtBtn');
    const optionCRMMetadata = document.getElementById('crmMetadataBtn');
    if(optionSimpleDC.classList.contains('is-active')) {
      generatedXMLCode = `
      <span class="item 1">Titolo: <dc:title>${title.val()}</dc:title></span>
      <span class="item 2">Creatore: <dc:creator>${creator.val()}</dc:creator></span>
      <span class="item 3">Soggetto: <dc:subject>${subject.val()}</dc:subject></span>
      <span class="item 4">Editore: <dc:publisher>${publisher.val()}</dc:publisher></span>
      <span class="item 5">Descrizione: <dc:description>${description.val()}</dc:description></span>
      <span class="item 6">Data: <dc:date>${date.val()}</dc:date></span>
      <span class="item 7">Tipo: <dc:type>${type.val()}</dc:type></span>
      <span class="item 8">Formato: <dc:format>${format.val()}</dc:format></span>
      <span class="item 9">Relazione: <dc:relation>${relation.val()}</dc:relation></span>
      <span class="item 10">Fonte: <dc:source>${source.val()}</dc:source></span>
      <span class="item 11">Lingua: <dc:language>${language.val()}</dc:language></span>
      <span class="item 12">Copertura: <dc:coverage>${coverage.val()}</dc:coverage></span>
      <span class="item 13">Gestione dei diritti: <dc:rights>${rights.val()}</dc:rights></span>
      `;
    } else if (optionExtendedDC.classList.contains('is-active')) {
      generatedXMLCode = `
      <span class="item 1">Titolo: <dc:title>${title.val()}</dc:title></span>
      <span class="item 2">Creatore: <dc:creator>${creator.val()}</dc:creator></span>
      <span class="item 3">Soggetto: <dc:subject>${subject.val()}</dc:subject></span>
      <span class="item 4">Editore: <dc:publisher>${publisher.val()}</dc:publisher></span>
      <span class="item 5">Descrizione: <dc:description>${description.val()}</dc:description></span>
      <span class="item 6">Data: <dc:date>${date.val()}</dc:date></span>
      <span class="item 7">Tipo: <dc:type>${type.val()}</dc:type></span>
      <span class="item 8">Formato: <dc:format>${format.val()}</dc:format></span>
      <span class="item 9">Relazione: <dc:relation>${relation.val()}</dc:relation></span>
      <span class="item 10">Fonte: <dc:source>${source.val()}</dc:source></span>
      <span class="item 11">Lingua: <dc:language>${language.val()}</dc:language></span>
      <span class="item 12">Copertura: <dc:coverage>${coverage.val()}</dc:coverage></span>
      <span class="item 13">Gestione dei diritti: <dc:rights>${rights.val()}</dc:rights></span>
      `;
    } else if (optionCRMMetadata.classList.contains('is-active')) {
      generatedXMLCode = `CIDOC option`
    } else {
      return; 
    }
    /*generatedHTMLCode = `
    <meta name='DC.Title' content='${title.val()}'> 
    <meta name='DC.Creator' content='${creator.val()}'> 
    <meta name='DC.Subject' content='${subject.val()}'>
    <meta name='DC.Description' content='${description.val()}'>
    `*/
    console.log(generatedXMLCode);
    console.log(generatedHTMLCode);
    contentRow.text(generatedHTMLCode);
    contentRow.text(generatedHTMLCode);
    if(hash === false) {return generatedXMLCode}
    contentRow.append(generatedHTMLCode);
    contentRow.append(generatedXMLCode);
    /*
    const data = [
      {
        title: `<meta name='DC.Title' content='${title.val()}'>`,
        creator: `<meta name='DC.Creator' content='${creator.val()}'>`
        
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
  App.metaData = data;
  console.log(App.ipfsHash);
  console.log('step end generateMetadata');
  App.descriptionToIPFS(data);
  App.loading = false;
  return;
  },

  uploadArtw: function (hash, objectDesc) {
    if(App.loading) {
      return;
    }
    //retrieve details of the artw
    console.log('JUST BEFORE THE EVENT App.ipfsHash', App.ipfsHash);
    console.log('JUST BEFORE THE EVENT hash', hash);
    console.log('blob', objectDesc);
    console.log(objectDesc.description)
    console.log('...Uploading your object to blockchain...');
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
        console.log( key + ': ' + value );
        var x = document.createElement('li');
        x.innerHTML =  key + ': ' + value; 
        receiptRow.append(x);
        console.log('...Done Uploading your object to blockchain...');
      });
    }).catch(function (error) {
      console.error(error);
    });
  },

  filesToIPFS: async function (fileSequence) {
    console.log('filesToIPFS', fileSequence);
    App.loading = true;
    App.loadingProgress(1);
    console.log('...Uploading your files to IPFS...');
    await ipfs.files.add(fileSequence, (err, result) => {
      if (err) {
        console.error(err);
        return
      }
      for(let key in result) {
        console.log('keys', key);
        App.ipfsHashStore.push(result[key].hash);
      }
      console.log('ipfs result', result);
      const hash = result[0].hash;
      App.ipfsHash = hash;
      App.loading = false;
      console.log('added data hash:', hash);
      console.log('...DONE Uploading your files to IPFS...');
      App.generateMetadata(hash);
  });
  },

  descriptionToIPFS: async function (objectDescription) {
    console.log('descriptionToIPFS', objectDescription);
    console.log('...Uploading your metadata description to IPFS...');
    let uploadDesc = Buffer.from(JSON.stringify(objectDescription));
    App.loading = true;
    await ipfs.files.add(uploadDesc, (err, result) => {
      App.loading = false;
      if (err) {
        console.error(err);
        return
      }
      console.log('ipfs result', result);
      const hash = result[0].hash;
      console.log('added data hash:', hash);
      console.log('...Done Uploading your metadata description to IPFS...');
      App.uploadArtw(hash, objectDescription);
      ipfs.files.cat(hash, function (err, file) {
        if (err) {
          throw err
        }
      });
      return hash;
    })
  },

  loadingProgress: function (step) {
    switch (step) {
      case 1:
      console.log('loadingProgress');
    }
    const loader = document.getElementById('loader');
    const btnSendArt = document.getElementById('sendToChain');
  },

  //listen for events global
  bindEvents: function () {
    //New Artwork Insertion Modal Open @dev 
    const newArtworkBtn = document.getElementById('newArtwork');
    newArtworkBtn.addEventListener('click', () => {
      const openModal = document.getElementById('openModal');
      openModal.classList.add('is-active');
    }); 
    //New Artwork Insertion Modal Close
    const closeModal = openModal.querySelector('.delete');
    closeModal.addEventListener('click', () => { 
      openModal.classList.remove('is-active');
    });

    const dublinCoreBtn = document.getElementById('dublinCoreBtn');
    const dublinExtBtn = document.getElementById('dublinExtBtn');
    const crmMetadataBtn = document.getElementById('crmMetadataBtn');
    dublinCoreBtn.addEventListener('click', dublinCoreSimple, false);
    dublinExtBtn.addEventListener('click', dublinCoreExtended, false);
    crmMetadataBtn.addEventListener('click', crmMetadataAdvanced, false);

    function dublinCoreSimple () {
      setMetadataVisibility();
      dublinCoreBtn.classList.add('is-active');
      const metadata = document.getElementById('dublinCoreMetadata');
      metadata.classList.remove('is-hidden');
    }

    function dublinCoreExtended () {
      setMetadataVisibility();
      dublinExtBtn.classList.add('is-active');
      const metadata = document.getElementById('dublinCoreExt');
      metadata.classList.remove('is-hidden');
    }

    function crmMetadataAdvanced () {
      setMetadataVisibility();
      crmMetadataBtn.classList.add('is-active');
      const metadata = document.getElementById('crnMetadata');
      metadata.classList.remove('is-hidden');
    }
    
    function setMetadataVisibility () {
      $("#metadataOptions > li.is-active").removeClass("is-active");
      $(".insertionForm > #dublinCoreMetadata, #dublinCoreExt, #crmMetadata").addClass("is-hidden");
    }
    //Binding of artwork object to IPFS preview by data-id 
    const artworkContainer = document.getElementById('archivesRow');
    artworkContainer.addEventListener('click', (ev) => {
        if(ev.target.classList.contains('object-button')) {
          const artworkPreview = document.getElementById('artwork-preview');
          App.dataToModal(ev, artworkPreview);
        }
      }, false);
    //Event listeners
    let uploadFile = document.getElementById('captureFileUpload');
    uploadFile.addEventListener('change', fileUploadForm);
    function fileUploadForm(ev) {
      console.log(ev);
      const files = ev.target.files;
      let fileResult = document.getElementById('filePreview');
      let sessionIndex = App.store.length;
      let eventIndex = 0;
      console.log('sessionIndex',sessionIndex);
      for(let i = sessionIndex; i < (sessionIndex+files.length); i++) {
        let file = files[eventIndex];
        if(!file.type.match('image')) continue;
        let readerIndex = eventIndex; //looks like there is some problem with chaining events, seems like reassing solves the issue
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
          preview.addEventListener('click', chooseMainThumbnail);
          let test = document.createElement('span'); //TODO testing purposes
          test.append(preview);
          test.append(deleteBtn);
          fileResult.append(test);       
         }
      }
      function chooseMainThumbnail (ev) {
        let fileResult = document.getElementById('filePreview');
        let imgList = fileResult.querySelectorAll('img');
        for(let element of imgList) {
          element.classList = '';
        }
        let selectedElementId = ev.target.getAttribute('data-id')
        console.log('before', App.store);
        console.log('selectedElementId',selectedElementId);
        if(selectedElementId == App.store[0]) {
          ev.target.classList.toggle('mainPreview');
          return;
        }
        let temp = App.store[0];
        App.store[0] = App.store[selectedElementId];
        App.store[selectedElementId] = temp;
        console.log('after', App.store);
        console.log(ev);
        console.log(ev.target);
        ev.target.classList.toggle('mainPreview');
        console.log('num', selectedElementId);
      }
    }

    App.contracts.Archives.deployed().then(function (instance) {
      instance.LogSendArtw({}, {}).watch(function (error, event) {
        if (!error) {
          console.log('event LogSendArtw fired', event.args._name);
          $('#events').append(`
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
          console.log('event validateArtw fired', event.args._id);
          $('#events').append(`
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

  dataToModal: function(ev, artworkPreview) {
    //console.log('data to modal', ev.target.getAttribute('data-id'));
    artworkPreview.classList.add('is-active'); //TODO
    let artId;
    if (isNaN(ev)) artId =  ev.target.getAttribute('data-id');
    else artId = ev ;
    App.contracts.Archives.deployed().then(function (instance) {
      contractInstance = instance;
      return artId;
    }).then(function (artId) {
        const artworkId = artId; //TODO temporary then select from ev target!
        //take artworks from the mapping
        contractInstance.artworks(artworkId).then(function (artwork) {
          console.log(artwork[0], artwork[1], artwork[2], artwork[3], artwork[4], artwork[5]);
          App.loadModalData(artwork[0], artwork[1], artwork[2], artwork[3], artwork[4], artwork[5]);
        });
      });
  },

  loadModalData: function (id, author, name, descriptionHash, dataHash, validation) {
    const titlePreamble = document.getElementById('artworkNamePreamble');
    const authorPreamble = document.getElementById('authorAddressPreamble');
    const previewPreamble = document.getElementById('previewPreamble');
    const title = document.querySelector('.description-title');
    const content = document.querySelector('.description-content');
    const mediaContent = document.querySelector('.description-footer');
    const artworkActions = document.querySelector('.artwork-actions');
    const btnAprove = artworkActions.querySelector('.btn-adopt');
    const btnModify = artworkActions.querySelector('.btn-modify-metadata');
    ipfs.files.cat(descriptionHash, function (err, file) {
      if (err) { throw err; }
      let ipfsResult =  file.toString('utf8');
      var objectResult = JSON.parse(ipfsResult);
      content.append(objectResult);
      content.innerHTML = objectResult.description;
      previewPreamble.src = `https://ipfs.io/ipfs/${objectResult.objectPreview}`;
      titlePreamble.textContent = name;
      authorPreamble.textContent = author;
      title.textContent = name;
      if(App.account === author && validation === false) {
        btnAprove.disabled = false;
        btnAprove.setAttribute('data-id', id);
        btnAprove.classList.remove('hidden');
        btnAprove.onclick =  () => App.validateArtwork(id); //old style solution same reason as btnModify.onclick. Also removingEventListener at each function call should fix it.
        //addEventListener was assigned on each function call  
      } else {
        btnAprove.removeAttribute('data-id');
        btnAprove.disabled = true;
      }
      if(App.account === author) {
        btnModify.disabled = false;
        btnModify.setAttribute('data-id', id);
        btnModify.onclick = () => {App.modifyMetadata(id, objectResult)}; //ad-hoc solution since an addEventListener would take into account all functions calls, possibliy to be fixed with currying or bind
      };
      for(key of objectResult.objectFiles) {
        let objectFilePreview = document.createElement('img');
        objectFilePreview.setAttribute('src', `https://ipfs.io/ipfs/${key}`);
        content.append(objectFilePreview);
      }
    });
  },

  modifyMetadata: (id, objectResult) => {
    console.log('event modifyMetadata', id);
    console.log("modifyMETADAT", objectResult);
    const openModal = document.getElementById('openModal');
    openModal.classList.add('is-active');
    const modalFooter = document.querySelector('.modal-card-foot');
      const modifyArtworkBtn = document.createElement('button');
      modifyArtworkBtn.appendChild(document.createTextNode("Modifica la descrizione"));
      modifyArtworkBtn.classList = 'button is-success';
      modifyArtworkBtn.id = 'modifyBtn';
      modalFooter.append(modifyArtworkBtn);
    modifyArtworkBtn.addEventListener('click', async ()  => {
      const newMetadata = App.generateMetadata(false);
      objectResult.description = newMetadata;
      let uploadDesc = Buffer.from(JSON.stringify(objectResult));
      App.loading = true;
      await ipfs.files.add(uploadDesc, (err, result) => {
      App.loading = false;
      if (err) {
        console.error(err);
        return
      }
      console.log('ipfs result', result);
      const hash = result[0].hash;
      console.log('added data hash:', hash);
      console.log('...Done Uploading your metadata description to IPFS...');
      App.modifyArtwork(id, hash);
      });
    });
  },

  modifyArtwork: (id, hash) => {
    const idToApprove = id.toNumber();
    console.log('modifyArtwork id to Modifyt', idToApprove);
    App.contracts.Archives.deployed().then(function (instance) {
      return instance.modifyArtworkDescription(idToApprove, hash, {
        from: App.account,
        gas: 500000
      });
    }).then(function (result) {
      console.log('modifyArtworkDescription', result);
      const artworkPreview = document.getElementById('artwork-preview');
      App.reloadArtworks();
      App.dataToModal(id, artworkPreview);
    });
},

  validateArtwork: (id) => {
    const idToApprove = id.toNumber();
    console.log('validateArtwork id to Approve', idToApprove);
    App.contracts.Archives.deployed().then(function (instance) {
      return instance.approveArtwork(idToApprove, {
        from: App.account
        //gas: 500000
      });
    }).then(function (result) {
      console.log('ValidateArtworkresult', result);
      App.reloadArtworks();
    });
  },

  filterValidObjects: () => {
    const objectRow = document.getElementById('archivesRow');
    const button = document.getElementById('filterValidObjects');
    const objects = objectRow.querySelectorAll('.artwork-object[data-val=false]');
    objects.forEach((object) => {
      button.classList.toggle('is-active');
      object.classList.toggle('is-hidden');
    });
  },

  filterPendingObjects: () => {
    const objectRow = document.getElementById('archivesRow');
    const button = document.getElementById('filterPendingObjects');
    const objects = objectRow.querySelectorAll('.artwork-object[data-val=true]');
    objects.forEach((object) => {
      button.classList.toggle('is-active');
      object.classList.toggle('is-hidden');
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});