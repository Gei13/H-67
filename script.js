const slides = [...document.querySelectorAll(".slide")];
const sectionName = document.getElementById("sectionName");
const slideNo = document.getElementById("slideNo");
const progressBar = document.getElementById("progressBar");
let current = 0;
let locked = false;

function render(index, direction = 1){
  if(index < 0) index = slides.length - 1;
  if(index >= slides.length) index = 0;
  if(index === current && slides[current].classList.contains("active")) return;
  const old = slides[current];
  const next = slides[index];
  old.classList.remove("active");
  old.classList.add("leaving");
  next.style.transform = direction > 0 ? "translateX(4%)" : "translateX(-4%)";
  requestAnimationFrame(() => {
    next.classList.add("active");
    next.style.transform = "";
  });
  setTimeout(()=>old.classList.remove("leaving"),650);
  current = index;
  updateUI();
}

function updateUI(){
  sectionName.textContent = slides[current].dataset.title;
  slideNo.textContent = `${String(current+1).padStart(2,"0")} / ${String(slides.length).padStart(2,"0")}`;
  progressBar.style.width = `${((current+1)/slides.length)*100}%`;
}
function next(){render(current+1,1)}
function prev(){render(current-1,-1)}

document.getElementById("next").addEventListener("click",next);
document.getElementById("prev").addEventListener("click",prev);

document.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();next()}
  if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();prev()}
  if(e.key==="Home"){e.preventDefault();render(0, -1)}
  if(e.key==="End"){e.preventDefault();render(slides.length-1,1)}
  if(e.key==="Escape") closeViewer();
});

let wheelLock = false;
window.addEventListener("wheel",e=>{
  if(Math.abs(e.deltaY)<18 || wheelLock) return;
  wheelLock=true;
  e.deltaY>0?next():prev();
  setTimeout(()=>wheelLock=false,850);
},{passive:true});

let touchStartX=0,touchStartY=0;
window.addEventListener("touchstart",e=>{touchStartX=e.changedTouches[0].clientX;touchStartY=e.changedTouches[0].clientY},{passive:true});
window.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-touchStartX;
  const dy=e.changedTouches[0].clientY-touchStartY;
  if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)) dx<0?next():prev();
},{passive:true});

const units = [
  ["UNIT 01","ONE-BEDROOM STUDY","assets/plans/unit-01.jpg"],
  ["UNIT 02","TWO-MODULE STUDY","assets/plans/unit-02.jpg"],
  ["UNIT 03","TWO-BEDROOM STUDY","assets/plans/unit-03.jpg"],
  ["UNIT 04","THREE-MODULE STUDY","assets/plans/unit-04.jpg"],
  ["UNIT 05","FOUR-BEDROOM STUDY","assets/plans/unit-05.jpg"]
];
const tabs=document.getElementById("unitTabs");
const plan=document.getElementById("planPlaceholder");
const unitLabel=document.getElementById("unitLabel");
const unitTitle=document.getElementById("unitTitle");
const unitText=document.getElementById("unitText");
units.forEach((u,i)=>{
  const b=document.createElement("button"); b.textContent=String(i+1).padStart(2,"0");
  b.onclick=()=>selectUnit(i); tabs.appendChild(b);
});
function selectUnit(i){
  const u=units[i];
  [...tabs.children].forEach((b,j)=>b.classList.toggle("active",i===j));
  unitLabel.textContent=u[0]; unitTitle.textContent=u[1];
  plan.style.backgroundImage=`url("${u[2]}")`;
  plan.style.backgroundSize="contain"; plan.style.backgroundPosition="center"; plan.style.backgroundRepeat="no-repeat";
  unitText.textContent="Use this panel for documented area, module count, terrace relationship, bedrooms and circulation notes.";
}
selectUnit(0);

const viewer=document.getElementById("viewer");
const viewerImg=document.getElementById("viewerImg");
const viewerFallback=document.getElementById("viewerFallback");
document.querySelectorAll(".sheet").forEach(sheet=>{
  sheet.addEventListener("click",()=>{
    const src=sheet.dataset.src;
    viewer.classList.add("open");
    viewerFallback.classList.remove("show");
    viewerImg.style.display="block";
    viewerImg.src=src;
    viewerImg.onerror=()=>{
      viewerImg.style.display="none";
      viewerFallback.classList.add("show");
    };
  });
});
function closeViewer(){viewer.classList.remove("open");viewerImg.src=""}
document.getElementById("closeViewer").onclick=closeViewer;
viewer.addEventListener("click",e=>{if(e.target===viewer)closeViewer()});

updateUI();
