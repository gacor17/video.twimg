
let allVideos=[];
let currentPage=1;
let currentFilter = "latest";

const SHORTS_PER_PAGE=10;
const LANDSCAPE_PER_PAGE=3;


fetch('videos.json')
.then(res=>res.json())
.then(data=>{
allVideos=data;
renderFeed(allVideos,1);
});

function shuffleArray(arr){
return arr.sort(()=>Math.random()-0.5);
}

function formatViews(n){
if(n>=1e6)return(n/1e6).toFixed(1)+"M";
if(n>=1e3)return(n/1e3).toFixed(1)+"K";
return n;
}

function timeAgo(d){
const now=new Date();
const up=new Date(d);
const diff=Math.floor((now-up)/1000);
if(diff<3600)return"Baru saja";
if(diff<86400)return Math.floor(diff/3600)+" jam lalu";
return Math.floor(diff/86400)+" hari lalu";
}

function renderFeed(videos,page){
currentPage=page;
const container=document.getElementById("mainFeed");
container.innerHTML="";

let landscape=videos.filter(v=>v.orientation!=="portrait");
let shorts=videos.filter(v=>v.orientation==="portrait");

if(currentFilter==="all"){
landscape=shuffleArray([...landscape]);
shorts=shuffleArray([...shorts]);
}

if(currentFilter==="latest"){
const sortFn=(a,b)=>new Date(b.uploadDate)-new Date(a.uploadDate);
landscape=[...landscape].sort(sortFn);
shorts=[...shorts].sort(sortFn);
}

const totalPages=Math.ceil(
Math.max(
shorts.length/SHORTS_PER_PAGE,
landscape.length/LANDSCAPE_PER_PAGE
)
);

const startShort=(page-1)*SHORTS_PER_PAGE;
const startLand=(page-1)*LANDSCAPE_PER_PAGE;

const currentShorts=shorts.slice(startShort,startShort+SHORTS_PER_PAGE);
const currentLandscape=landscape.slice(startLand,startLand+LANDSCAPE_PER_PAGE);

if(currentShorts.length){
const sec=document.createElement("div");
sec.className="section-shorts";
sec.innerHTML=`<div class="section-title">Shorts</div>`;
const grid=document.createElement("div");
grid.className="shorts-grid";
currentShorts.forEach(v=>grid.appendChild(createCard(v,true)));
sec.appendChild(grid);
container.appendChild(sec);
}

if(currentLandscape.length){
const grid=document.createElement("div");
grid.className="video-grid";
currentLandscape.forEach(v=>grid.appendChild(createCard(v,false)));
container.appendChild(grid);
}

renderPagination(totalPages);
}

function renderPagination(totalPages){
const pagination=document.getElementById("pagination");
pagination.innerHTML="";
for(let i=1;i<=totalPages;i++){
const btn=document.createElement("div");
btn.className="page-btn";
btn.textContent=i;
if(i===currentPage){btn.classList.add("active");}
btn.onclick=()=>{
renderFeed(allVideos,i);
window.scrollTo({top:0,behavior:"smooth"});
};
pagination.appendChild(btn);
}
}

function createCard(video,isShort){
const card=document.createElement("div");
card.className=`card ${isShort?'short':''}`;
card.innerHTML=`
<div class="thumbnail">
<img src="${video.thumbnail}" loading="lazy">
<span class="duration-badge">${video.duration}</span>
</div>
<div class="info">
<div class="title">${video.title}</div>
<div class="meta">${formatViews(video.views)} views • ${timeAgo(video.uploadDate)}</div>
</div>
`;
card.onclick=()=>location.href="detail.html?id="+video.id;
return card;
}

function toggleSearch(){
const box=document.getElementById("searchBox");
box.style.display=box.style.display==="block"?"none":"block";
}

document.querySelectorAll(".tab-btn").forEach(btn=>{
btn.addEventListener("click",function(){
document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
this.classList.add("active");
currentFilter=this.dataset.type;
renderFeed(allVideos,1);
window.scrollTo({top:0,behavior:"smooth"});
});
});

let timeout;
document.getElementById("searchInput").addEventListener("input",function(){
clearTimeout(timeout);
timeout=setTimeout(()=>{
const val=this.value.toLowerCase().trim();
if(!val){
renderFeed(allVideos,1);
return;
}
renderFeed(allVideos.filter(v=>v.title.toLowerCase().includes(val)),1);
},300);
});
