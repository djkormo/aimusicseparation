Vue.component("dropzone",{
  template: `<div class='dropzone'></div>`,
  props: {
    currentProject: null,
  },
  data() {
    return {
      uploadDropzone: null,
      modelName: Date.now().toString()
    };
  },
  methods: {
      reload(){
      }
  },
  mounted(){
    this.uploadDropzone= new Dropzone(this.$el, {
        url:"/api/music/"+this.modelName, 
        paramName: "file",
        method: "post",
        timeout: 36000000,
        responseType: 'arraybuffer',
        success: function(file, response){
            var imageBlob = response;
            console.log(response);
            console.log(file);


            var processTrack = function(zip, name){
                zip.files[name+".mp3"].async("base64").then(function (data64) {
                    document.getElementById(name).src='data:audio/mp3;base64,'+data64
                });
            };

            var new_zip = new JSZip();
            new_zip.loadAsync(response)
                .then(function(zip) {
                    processTrack(zip,"bass");
                    processTrack(zip,"drums");
                    processTrack(zip,"other");
                    processTrack(zip,"vocals");
                });


            file.arrayBuffer().then(function(res){ 
                data64 = btoa(
                    new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                document.getElementById('original').src = 'data:audio/mp3;base64,'+data64
            });
        }
    });
  }
})

Vue.component('train', {
  data: function () {
    return {
      show: true,
      snackbarContainer: document.querySelector('#toast'),
      packages: null,
      intervalId: null
    }
  },
  props: {
    currentProject: null
  },
  methods: {
    train_info(){
	    axios.get("/api/training").then(response => {
            this.packages=response.data;
	    });
    },
    download(modelName) {
        console.log(modelName);
	    axios.get("/api/training/"+modelName,{
            responseType: 'arraybuffer'
        }).then(response => {
            var blob=new Blob([response.data])
            console.log(blob);
            saveAs(blob,'trt_graph.pb');
	    });
    }
  },
  created(){
      //this.intervalId = setInterval(this.train_info, 5000);
      //  axios.get("/static/woman.jpg",{
      //        responseType: 'arraybuffer'
      //    }).then(response => {
      //        var blob=new Blob([response.data])
      //        console.log(blob);
      //        var formData = new FormData();
      //        formData.append("file", blob);
      //        axios.post('/api/scissors/333', formData, {
      //            headers: {
      //              'Content-Type': 'multipart/form-data'
      //            }, responseType: 'arraybuffer'

      //        }).then(res => {
      //            console.log(res);

      //        var imageBlob = res.data;
      //        var imageBytes = btoa(
      //          new Uint8Array(res.data)
      //            .reduce((data, byte) => data + String.fromCharCode(byte), '')
      //        );

      //            var outputImg = document.getElementById('output');
      //            outputImg.src = 'data:image/png;base64,'+imageBytes;

      //        });
	  //    });
     
  },
  updated(){
      if(this.$refs.dropzone !== undefined){
        this.$refs.dropzone.reload(this.currentProject);
      }
  },
  template: `
  <main class="mdl-layout__content mdl-color--grey-100" v-if="show">
  <div class="mdl-grid demo-content">
    <div class="demo-card-square mdl-card mdl-cell mdl-cell--12-col">
        <div class="mdl-card__title mdl-card--expand">
            <!--<h2 class="mdl-card__title-text">AI Scissors</h2>-->
            <img src="/static/logo.png" width="170px" class="center"/>
        </div>
        <!--<div class="mdl-card__supporting-text">
            Upload image file.
        </div>-->


        <div class="mdl-card__actions mdl-card--border">
            <dropzone :current-project="currentProject" ref="dropzone"></dropzone>
        <div class="mdl-grid">
            <ul class="demo-list-icon mdl-list">
                <li class="mdl-list__item">
                    <span class="mdl-list__item-primary-content"><b>Original: &nbsp;</b>
                    <audio controls id="original" /></span>
                </li>
            </ul>
        </div>
        <div class="mdl-grid">
            <ul class="demo-list-icon mdl-list">
                <li class="mdl-list__item">
                    <span class="mdl-list__item-primary-content"><b>Bass: &nbsp;</b>
                    <audio controls id="bass" /></span>
                </li>
                <li class="mdl-list__item">
                    <span class="mdl-list__item-primary-content"><b>Drums: &nbsp;</b>
                    <audio controls id="drums" /></span>
                </li>
            </ul>
            <ul class="demo-list-icon mdl-list">
                <li class="mdl-list__item">
                    <span class="mdl-list__item-primary-content"><b>Other: &nbsp;</b>
                    <audio controls id="other" /></span>
                </li>
                <li class="mdl-list__item">
                    <span class="mdl-list__item-primary-content"><b>Vocals: &nbsp;</b>
                    <audio controls id="vocals" /></span>
                </li>
            </ul>
        </div>
        </div>
    </div>
    </div>
</main>
  `
});
