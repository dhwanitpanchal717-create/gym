const DEFAULT={
Push:[
{name:"Incline Barbell Press",sets:4,reps:"8"},
{name:"Machine Chest Press",sets:3,reps:"8"},
{name:"Overhead Triceps Extension",sets:3,reps:"10"},
{name:"Lateral Raises",sets:4,reps:"8"},
{name:"Triceps Pushdown",sets:3,reps:"10"}],
Pull:[
{name:"Lat Pulldown",sets:4,reps:"8–12"},
{name:"Machine Row",sets:3,reps:"12"},
{name:"Lat Pullover",sets:3,reps:"12"},
{name:"Reverse Pec Deck",sets:3,reps:"12"},
{name:"Biceps Curl",sets:3,reps:"10"}],
Legs:[
{name:"Seated Hamstring Curl",sets:4,reps:"8"},
{name:"Hack Squat",sets:4,reps:"8"},
{name:"Leg Press",sets:4,reps:"8"},
{name:"Calf Raises",sets:5,reps:"12"},
{name:"Clarify exercise",sets:4,reps:"8"}]
};
const KEY="dhwanit-fit-v2";
let data=JSON.parse(localStorage.getItem(KEY)||"null")||{exercises:structuredClone(DEFAULT),logs:[],weights:[{date:"2026-09-01",weight:44.1}],theme:"light"};
let workout="Push",index=0,manageFilter="Push",progressFilter="all",restTimer=null;

function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function show(id){
 document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));
 document.getElementById(id).classList.add("active");
 document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.nav===id));
 if(id==="home")renderHome(); if(id==="progress")renderProgress(); if(id==="body")renderBody(); if(id==="manage")renderManage(); window.scrollTo(0,0);
}
function notify(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function renderHome(){
 const w=data.weights.at(-1)?.weight||44.1; document.getElementById("homeWeight").textContent=w.toFixed(1);
 ["Push","Pull","Legs"].forEach(x=>document.getElementById(x.toLowerCase()+"Count").textContent=`${data.exercises[x].length} exercises`);
}
function openWorkout(day){workout=day;index=0;document.getElementById("workoutName").textContent=day;show("workout");renderExercise()}
function previous(name){
 const arr=data.logs.filter(x=>x.exercise===name);return arr.at(-1)||null
}
function renderExercise(){
 const arr=data.exercises[workout],ex=arr[index],prev=previous(ex.name);
 document.getElementById("workoutProgress").textContent=`${index+1}/${arr.length}`;
 document.getElementById("workoutBar").style.width=`${(index/arr.length)*100}%`;
 let rows="";
 for(let i=0;i<ex.sets;i++) rows+=`<div class="set-row"><span>${i+1}</span><input id="wt${i}" type="number" step="0.5" placeholder="${prev?.weights?.[i]??"kg"}"><input id="rp${i}" type="number" placeholder="${prev?.reps?.[i]??ex.reps}"><button id="done${i}" onclick="doneSet(${i})">✓</button></div>`;
 document.getElementById("exerciseView").innerHTML=`<div class="exercise-card">
 <div class="exercise-title"><div><h2>${esc(ex.name)}</h2><p>${ex.sets} sets · target ${esc(ex.reps)} reps</p></div></div>
 ${prev?`<div class="previous"><b>Last time</b><br>${prev.weights.map((w,i)=>`${w} kg × ${prev.reps[i]}`).join(" · ")}`:"<div class='previous'>No previous record. This will be your baseline.</div>"}
 <div class="set-head"><span>Set</span><span>Weight</span><span>Reps</span><span></span></div>${rows}
 <div id="rest" class="rest">Rest timer: ready</div>
 <div class="controls"><button class="secondary" onclick="startRest()">Start 90s rest</button><button class="primary" onclick="saveExercise()">Save & Next</button></div>
 </div>`;
}
function doneSet(i){document.getElementById("done"+i).classList.toggle("done");if(document.getElementById("done"+i).classList.contains("done"))startRest()}
function startRest(seconds=90){
 clearInterval(restTimer);let left=seconds,el=document.getElementById("rest");if(!el)return;
 const tick=()=>{el.textContent=`Rest timer: ${String(Math.floor(left/60)).padStart(2,"0")}:${String(left%60).padStart(2,"0")}`;if(left<=0){clearInterval(restTimer);el.textContent="Rest complete"}left--};tick();restTimer=setInterval(tick,1000)
}
function saveExercise(){
 const ex=data.exercises[workout][index],weights=[],reps=[];
 for(let i=0;i<ex.sets;i++){let w=Number(document.getElementById("wt"+i).value),r=Number(document.getElementById("rp"+i).value);if(!w||!r){notify("Enter weight and reps for every set");return}weights.push(w);reps.push(r)}
 data.logs.push({date:new Date().toISOString().slice(0,10),workout,exercise:ex.name,weights,reps});save();
 if(index<data.exercises[workout].length-1){index++;renderExercise()}else{notify(`${workout} saved`);show("home")}
}
function renderProgress(){
 const names=[...new Set(["Push","Pull","Legs"].flatMap(d=>data.exercises[d].map(e=>e.name)))].filter(n=>n!=="Clarify exercise");
 const list=names.filter(n=>progressFilter==="all"||data.exercises[progressFilter].some(e=>e.name===n));
 document.getElementById("progressView").innerHTML=list.map(n=>{
  const logs=data.logs.filter(x=>x.exercise===n),last=logs.at(-1);let best=0;
  logs.forEach(l=>l.weights.forEach(w=>best=Math.max(best,w)));
  const pr=logs.length>1&&best>Math.max(...logs.slice(0,-1).flatMap(l=>l.weights))?" · New best":"";
  return `<div class="progress-row"><header><b>${esc(n)}</b><span>${best?best+" kg":"—"} <small class="pr">${pr}</small></span></header><div class="last">${last?`Last: ${last.weights.map((w,i)=>`${w} × ${last.reps[i]}`).join(" · ")}`:"No record yet"}</div></div>`
 }).join("")||`<div class="card"><b>No workout data yet.</b><p class="hint">Complete a workout and your history will appear here.</p></div>`;
 document.querySelectorAll("#progress .tab").forEach((b,i)=>b.classList.toggle("active",["all","Push","Pull","Legs"][i]===progressFilter))
}
function renderBody(){
 const current=data.weights.at(-1)?.weight||44.1,goal=47,left=Math.max(0,goal-current);
 document.getElementById("bodyCurrent").textContent=current.toFixed(1);document.getElementById("homeWeight").textContent=current.toFixed(1);
 document.getElementById("goalLeft").textContent=left.toFixed(1)+" kg left";document.getElementById("goalBar").style.width=Math.min(100,Math.max(0,((current-44.1)/(goal-44.1))*100))+"%";
 document.getElementById("weightHistory").innerHTML=`<div class="card"><h3>Weight history</h3>${[...data.weights].reverse().slice(0,14).map(x=>`<div class="exercise-manage"><span>${x.date}</span><b>${x.weight.toFixed(1)} kg</b></div>`).join("")}</div>`
}
function saveWeight(){const w=Number(document.getElementById("weightInput").value);if(!w)return;data.weights.push({date:new Date().toISOString().slice(0,10),weight:w});save();document.getElementById("weightInput").value="";renderBody();notify("Weight saved")}
function renderManage(){
 document.getElementById("manageTabs").innerHTML=["Push","Pull","Legs"].map(x=>`<button class="tab ${manageFilter===x?"active":""}" onclick="manageFilter='${x}';renderManage()">${x}</button>`).join("");
 document.getElementById("manageView").innerHTML=data.exercises[manageFilter].map((e,i)=>`<div class="exercise-manage"><div><b>${esc(e.name)}</b><small>${e.sets} sets · ${esc(e.reps)} reps</small></div><div class="manage-actions"><button class="mini" onclick="editExercise(${i})">Edit</button><button class="mini danger" onclick="removeExercise(${i})">Delete</button></div></div>`).join("")||`<div class="card"><p class="hint">No exercises in this workout.</p></div>`
}
function openAddModal(existing=null,index=-1){
 const e=existing||{name:"",sets:3,reps:"8–12"};
 document.getElementById("modalContent").innerHTML=`<h2>${existing?"Edit exercise":"Add exercise"}</h2><div class="form">
 <label>Name<input id="mName" value="${esc(e.name)}" placeholder="e.g. Cable Fly"></label>
 <label>Sets<input id="mSets" type="number" min="1" max="10" value="${e.sets}"></label>
 <label>Target reps<input id="mReps" value="${esc(e.reps)}" placeholder="8–12"></label>
 <label>Workout<select id="mDay"><option>Push</option><option>Pull</option><option>Legs</option></select></label>
 <div class="modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="saveExerciseConfig(${index},${existing?1:0})">${existing?"Save changes":"Add exercise"}</button></div></div>`;
 if(existing)document.getElementById("mDay").value=manageFilter;
 document.getElementById("modal").classList.remove("hidden")
}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function saveExerciseConfig(index,editing){
 const name=document.getElementById("mName").value.trim(),sets=Number(document.getElementById("mSets").value),reps=document.getElementById("mReps").value.trim(),day=document.getElementById("mDay").value;
 if(!name||!sets||!reps){notify("Fill all fields");return}
 if(editing){const old=data.exercises[manageFilter].splice(index,1)[0];data.exercises[day].push({name,sets,reps}); if(old.name!==name)data.logs=data.logs.map(l=>l.exercise===old.name?{...l,exercise:name}:l)}
 else data.exercises[day].push({name,sets,reps});
 save();closeModal();manageFilter=day;renderManage();renderHome();notify(editing?"Exercise updated":"Exercise added")
}
function editExercise(i){openAddModal(data.exercises[manageFilter][i],i)}
function removeExercise(i){const e=data.exercises[manageFilter][i];if(confirm(`Remove "${e.name}" from ${manageFilter}?`)){data.exercises[manageFilter].splice(i,1);save();renderManage();renderHome();notify("Exercise removed")}}
function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="dhwanit-fit-backup.json";a.click();URL.revokeObjectURL(a.href)}
function importData(){const input=document.createElement("input");input.type="file";input.accept=".json";input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.exercises||!x.logs||!x.weights)throw 0;data=x;save();location.reload()}catch{notify("Invalid backup file")}};r.readAsText(f)};input.click()}
function resetHistory(){if(confirm("Clear all workout logs? Exercises will stay.")){data.logs=[];save();notify("Workout history cleared")}}
function resetEverything(){if(confirm("Reset exercises, history and body-weight data?")){localStorage.removeItem(KEY);location.reload()}}
document.getElementById("themeBtn").onclick=()=>{data.theme=data.theme==="dark"?"light":"dark";document.body.classList.toggle("dark",data.theme==="dark");save();document.getElementById("themeBtn").textContent=data.theme==="dark"?"☀":"☾"};
document.getElementById("dateText").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"short",year:"numeric"});
document.body.classList.toggle("dark",data.theme==="dark");document.getElementById("themeBtn").textContent=data.theme==="dark"?"☀":"☾";renderHome();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js");
