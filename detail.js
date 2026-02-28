
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("dragstart", e => e.preventDefault());

const params = new URLSearchParams(window.location.search);
const videoId = params.get("id");

let allVideos = [];
let player;

fetch('videos.json')
.then(res => res.json())
.then(data => {

  allVideos = data;
  const video = data.find(v => v.id === videoId);

  if(!video){
    document.body.innerHTML = "Video tidak ditemukan";
    return;
  }

  document.getElementById("title").innerText = video.title;
  document.getElementById("thumb").src = video.thumbnail;

  const wrapper = document.getElementById("videoWrapper");
  wrapper.classList.add(video.orientation === "portrait" ? "portrait" : "landscape");

  const videoElement = document.getElementById("player");
  videoElement.src = video.video;

  player = new Plyr('#player', {
    controls: ['play','progress','current-time','mute','volume','fullscreen'],
    settings: [],
    disableContextMenu: true
  });

  loadRecommendations(videoId);
});

/* PLAY */
document.getElementById("playBtn").addEventListener("click", function(){

  const video = document.getElementById("player");

  video.style.display="block";
  document.getElementById("thumb").style.display="none";
  this.style.display="none";

  player.play();
});

/* REKOMENDASI */
function loadRecommendations(currentId){

  const grid = document.getElementById("recommendGrid");
  grid.innerHTML="";

  const filtered = allVideos.filter(v=>v.id!==currentId);
  const shuffled = filtered.sort(()=>0.5-Math.random());
  const selected = shuffled.slice(0,4);

  selected.forEach(video=>{

    const orientationClass = video.orientation==="portrait"?"portrait":"landscape";

    const card = document.createElement("div");
    card.className="recommend-card";

    card.innerHTML=`
      <div class="recommend-thumb ${orientationClass}">
        <img src="${video.thumbnail}" draggable="false">
        <video class="preview-video" muted loop playsinline src="${video.video}"></video>
        <div class="duration-badge">${video.duration || ""}</div>
      </div>
      <div class="rec-title">${video.title}</div>
    `;

    const previewVideo = card.querySelector(".preview-video");
    const thumbDiv = card.querySelector(".recommend-thumb");

    let holdTimer;

    function startPreview(){
      previewVideo.style.display="block";
      previewVideo.play();
    }

    function stopPreview(){
      previewVideo.pause();
      previewVideo.style.display="none";
    }

    thumbDiv.addEventListener("touchstart",()=>{holdTimer=setTimeout(startPreview,300);});
    thumbDiv.addEventListener("touchend",()=>{clearTimeout(holdTimer);stopPreview();});
    thumbDiv.addEventListener("mousedown",()=>{holdTimer=setTimeout(startPreview,300);});
    thumbDiv.addEventListener("mouseup",()=>{clearTimeout(holdTimer);stopPreview();});
    thumbDiv.addEventListener("mouseleave",stopPreview);

    card.onclick=()=>{
      window.location.href="detail.html?id="+video.id;
    };

    grid.appendChild(card);
  });
}
