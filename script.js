const slides=[...document.querySelectorAll(".slide")];
const nextBtn=document.getElementById("nextBtn"),prevBtn=document.getElementById("prevBtn");
const slideNumber=document.getElementById("slideNumber"),slideTotal=document.getElementById("slideTotal"),progressBar=document.getElementById("progressBar");
const fullscreenBtn=document.getElementById("fullscreenBtn"),menuBtn=document.getElementById("menuBtn");
const overview=document.getElementById("overview"),overviewGrid=document.getElementById("overviewGrid"),closeOverview=document.getElementById("closeOverview");
const drawingModal=document.getElementById("drawingModal"),closeModal=document.getElementById("closeModal"),modalImg=document.getElementById("modalImg"),modalLabel=document.getElementById("modalLabel");
let current=0;

slideTotal.textContent=String(slides.length).padStart(2,"0");

function showSlide(index){
  current=(index+slides.length)%slides.length;
  slides.forEach((slide,i)=>slide.classList.toggle("active",i===current));
  slideNumber.textContent=String(current+1).padStart(2,"0");
  progressBar.style.width=`${((current+1)/slides.length)*100}%`;
  window.scrollTo(0,0);
}
function next(){showSlide(current+1)}
function prev(){showSlide(current-1)}

nextBtn.addEventListener("click",next);
prevBtn.addEventListener("click",prev);

document.addEventListener("keydown",e=>{
  if(drawingModal.classList.contains("open")){
    if(e.key==="Escape") closeDrawing();
    return;
  }
  if(overview.classList.contains("open")){
    if(e.key==="Escape") closeOverviewPanel();
    return;
  }
  if(["ArrowRight","ArrowDown","PageDown"," "].includes(e.key)){e.preventDefault();next()}
  if(["ArrowLeft","ArrowUp","PageUp"].includes(e.key)){e.preventDefault();prev()}
  if(e.key==="Home"){e.preventDefault();showSlide(0)}
  if(e.key==="End"){e.preventDefault();showSlide(slides.length-1)}
  if(e.key.toLowerCase()==="f"){toggleFullscreen()}
  if(e.key.toLowerCase()==="m"){openOverview()}
});

let touchStartX=0,touchStartY=0;
document.addEventListener("touchstart",e=>{touchStartX=e.changedTouches[0].screenX;touchStartY=e.changedTouches[0].screenY},{passive:true});
document.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].screenX-touchStartX,dy=e.changedTouches[0].screenY-touchStartY;
  if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)){dx<0?next():prev()}
},{passive:true});

let wheelLocked=false;
document.addEventListener("wheel",e=>{
  if(overview.classList.contains("open")||drawingModal.classList.contains("open")) return;
  if(Math.abs(e.deltaY)<25)return;
  if(wheelLocked)return;
  wheelLocked=true;
  e.deltaY>0?next():prev();
  setTimeout(()=>wheelLocked=false,550);
},{passive:true});

function buildOverview(){
  overviewGrid.innerHTML="";
  slides.forEach((slide,i)=>{
    const b=document.createElement("button");
    b.className="overview-item";
    b.innerHTML=`<b>${String(i+1).padStart(2,"0")}</b><span>${slide.dataset.title||"Slide"}</span>`;
    b.addEventListener("click",()=>{showSlide(i);closeOverviewPanel()});
    overviewGrid.appendChild(b);
  });
}
function openOverview(){overview.classList.add("open");overview.setAttribute("aria-hidden","false")}
function closeOverviewPanel(){overview.classList.remove("open");overview.setAttribute("aria-hidden","true")}
menuBtn.addEventListener("click",openOverview);closeOverview.addEventListener("click",closeOverviewPanel);
overview.addEventListener("click",e=>{if(e.target===overview)closeOverviewPanel()});

function openDrawing(path,label){
  modalLabel.textContent=label||"DRAWING";
  modalImg.src="assets/"+path;
  modalImg.alt=label||"Architectural drawing";
  modalImg.onerror=()=>{modalImg.removeAttribute("src");modalImg.alt="Image not found";};
  drawingModal.classList.add("open");drawingModal.setAttribute("aria-hidden","false");
}
function closeDrawing(){drawingModal.classList.remove("open");drawingModal.setAttribute("aria-hidden","true");modalImg.removeAttribute("src")}
closeModal.addEventListener("click",closeDrawing);
drawingModal.querySelector(".modal-backdrop").addEventListener("click",closeDrawing);

document.querySelectorAll(".drawing-card,.elevation-grid button").forEach(el=>{
  el.addEventListener("click",()=>openDrawing(el.dataset.image,el.dataset.label||el.textContent.trim()));
});

const units={
 "01":{title:"Unit 01",desc:"Place the sourced plan for the first selected housing type here.",file:"plans/unit-type-01-plan.png"},
 "02":{title:"Unit 02",desc:"Place the sourced plan for the second selected housing type here.",file:"plans/unit-type-02-plan.png"},
 "03":{title:"Unit 03",desc:"Place the sourced plan for the third selected housing type here.",file:"plans/unit-type-03-plan.png"},
 "04":{title:"Unit 04",desc:"Place the sourced plan for the fourth selected housing type here.",file:"plans/unit-type-04-plan.png"},
 "05":{title:"Unit 05",desc:"Place the sourced plan for the fifth selected housing type here.",file:"plans/unit-type-05-plan.png"}
};
const unitPlan=document.getElementById("unitPlan"),unitLabel=document.getElementById("unitLabel"),unitTitle=document.getElementById("unitTitle"),unitDescription=document.getElementById("unitDescription");
function selectUnit(id){
  const u=units[id];unitLabel.textContent="UNIT "+id;unitTitle.textContent=u.title;unitDescription.textContent=u.desc;
  unitPlan.innerHTML=`<span>${u.title.toUpperCase()} FLOOR PLAN</span><small>${u.file}</small>`;
  unitPlan.style.backgroundImage=`url("${encodeURI("assets/"+u.file)}")`;
  unitPlan.style.backgroundSize="contain";unitPlan.style.backgroundRepeat="no-repeat";unitPlan.style.backgroundPosition="center";
}
document.querySelectorAll(".unit-tab").forEach(tab=>tab.addEventListener("click",()=>{
  document.querySelectorAll(".unit-tab").forEach(t=>t.classList.remove("active"));tab.classList.add("active");selectUnit(tab.dataset.unit);
}));

document.querySelectorAll(".type-card").forEach(card=>card.addEventListener("click",()=>{
  const unitSlideIndex=slides.findIndex(s=>s.classList.contains("unit-slide"));
  showSlide(unitSlideIndex);
  const tab=document.querySelector(`.unit-tab[data-unit="${card.dataset.type}"]`);
  if(tab)tab.click();
}));

async function toggleFullscreen(){
  try{
    if(!document.fullscreenElement){
      await document.documentElement.requestFullscreen();
      document.body.classList.add("presentation-fullscreen");
      fullscreenBtn.textContent="⛶";
      fullscreenBtn.title="Exit full screen";
    }else{
      await document.exitFullscreen();
    }
  }catch(err){
    document.body.classList.toggle("presentation-fullscreen");
  }
}
document.addEventListener("fullscreenchange",()=>{
  const active=!!document.fullscreenElement;
  document.body.classList.toggle("presentation-fullscreen",active);
  fullscreenBtn.title=active?"Exit full screen":"Full screen";
});
fullscreenBtn.addEventListener("click",toggleFullscreen);

buildOverview();
selectUnit("01");
showSlide(0);
document.getElementById("presentation").focus();
