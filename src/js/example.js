App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,
    loading: false,
    ipfsHash: '',
  
    init: function () {
        //file API https://developer.mozilla.org/en-US/docs/Web/API/File
        let filesInput = document.getElementById("files");
        filesInput.addEventListener("change", fileUpload);
        function fileUpload(ev) {
            console.log("ok");
            let files = ev.target.files;
            let fileResult = document.getElementById("result");
            for(let i = 0; i < files.length; i++) {
                let file = files[i];
                //Using FileReader caniuse
                if(!file.type.match('image')) continue;
                const fileReader = new FileReader();
                fileReader.addEventListener('load', function (ev) {
                    let imgFile = ev.target;
                    console.log(imgFile);
                    var div = document.createElement("div");
                    var button = document.createElement("button");
                    button.innerHTML = `click me ${i}`;
                    div.innerHTML = `<img class="thumbnail-${i}" src="${imgFile.result}"`;                  
                    fileResult.appendChild(div);
                    fileResult.appendChild(button);
                });
                fileReader.readAsDataURL(file);
            }
            console.log("hello", files);
            return files;
        }
    },
  
    loadData: async function (data) {
      console.log(data);
    },
  
    generateDC: function () {
      if(App.loading) {
        return;
      }
      console.log("files", files);
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
  
      const data = JSON.stringify({
        title: `<meta name="DC.Title" content="${title.val()}">`,
        creator: `<meta name="DC.Creator" content="${creator.val()}">`,
        image: App.ipfsHash
      });
  
      App.loadData(data);
    },
};

$(function () {
    $(window).load(function () {
      App.init();
    });
  });

  
  /*
  window.onload = function() {
  let textData = ["Permanente", "Trasparente", "Immutabile"];
  typeText(textData, 0);
};


const typeText = (textData, i) => {
  //console.log(textData, i);
  //console.log(elem);
  if(i < textData[i].length) {
    document.querySelector("p").innerText = textData[1];
  console.log(textData[1].substring(0, i+1));
  
  setTimeout(function() {
    typeText(textData, i+1);
  }, 200);
  }
}



  */