const LEGACY_STORAGE_KEY = "hollandPyramidData_v1";
const USER_STORAGE_PREFIX = "hollandPyramidData_user_v2_";
const LEGACY_CLAIM_KEY = "hollandPyramidLegacyClaimedBy";
const SUPABASE_URL = "https://sgniktsseqgadacayjyo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PmkgmhiLuPAln5c-paYn3w_dxhdiQsc";

const defaultProgram = {
  version: 1,
  title: "פירמידת הולנד - התחלה איטית",
  exercises: [
    {id:"chair-squat",name:"סקוואט לכיסא עם משקולות",short:"סקוואט",multiplier:2,unit:"חזרות",visual:"🏋️‍♂️ 🪑",instructions:["לעמוד מול כיסא יציב, רגליים בערך ברוחב הכתפיים.","להחזיק משקולת של 1.5 ק״ג בכל יד לצד הגוף.","לדחוף אגן לאחור, לגעת בכיסא ולחזור לעמידה בשליטה."]},
    {id:"incline-pushup",name:"שכיבות סמיכה על קיר או שיש",short:"שכיבות",multiplier:2,unit:"חזרות",visual:"🧍‍♂️↘️🧱",instructions:["להניח ידיים בגובה החזה על קיר או שיש יציב.","לשמור על הגוף ישר מהראש עד העקבים.","להתקרב למשטח ולדחוף חזרה."]},
    {id:"bent-row",name:"חתירה כפופה עם משקולות",short:"חתירה",multiplier:2,unit:"חזרות",visual:"🏋️‍♂️ ↩️",instructions:["להטות מעט את הגוף קדימה עם גב ישר וברכיים רכות.","להתחיל כשהידיים תלויות למטה.","למשוך את המרפקים לאחור לכיוון הצלעות ולהוריד בשליטה."]},
    {id:"shoulder-press",name:"לחיצת כתפיים עם משקולות",short:"כתפיים",multiplier:2,unit:"חזרות",visual:"🏋️‍♂️ ⬆️",instructions:["להתחיל עם המשקולות בגובה הכתפיים.","לדחוף למעלה מעל הראש.","להוריד חזרה באיטיות ובשליטה."]},
    {id:"march",name:"מארץ׳ במקום",short:"מארץ׳",multiplier:4,unit:"צעדים",visual:"🚶‍♂️",instructions:["לעמוד זקוף.","להרים ברך אחת ואז את השנייה.","לשמור על קצב נוח ויציב."]}
  ],
  levels: [
    {id:"L0A",name:"רמה 0A",pattern:[1,2,3],minSessions:6,maxAvgDifficultyForSuggestion:5.5,description:"אותו אימון קצר לפחות 6 פעמים. לא מתקדמים רק כי עבר שבוע."},
    {id:"L0B",name:"רמה 0B",pattern:[1,2,3,2,1],minSessions:6,maxAvgDifficultyForSuggestion:5.5,description:"מוסיפים ירידה קטנה בפירמידה. נשארים כאן לפחות 6 אימונים."},
    {id:"L0C",name:"רמה 0C",pattern:[1,2,3,4],minSessions:8,maxAvgDifficultyForSuggestion:5.5,description:"מוסיפים שיא של 4, אבל עדיין בלי פירמידה מלאה. לפחות 8 אימונים."},
    {id:"L0D",name:"רמה 0D",pattern:[1,2,3,4,3,2,1],minSessions:8,maxAvgDifficultyForSuggestion:5.5,description:"פירמידה בינונית. נשארים כאן לפחות 8 אימונים."},
    {id:"L1A",name:"רמה 1A",pattern:[1,2,3,4,5],minSessions:10,maxAvgDifficultyForSuggestion:5.5,description:"עולים עד 5 בלי ירידה. רק אחרי בסיס יציב."},
    {id:"L1B",name:"רמה 1B",pattern:[1,2,3,4,5,4,3,2,1],minSessions:10,maxAvgDifficultyForSuggestion:5.5,description:"הפירמידה המלאה. ההתקדמות מכאן תיעשה לפי הנתונים."}
  ]
};

function clone(x){return JSON.parse(JSON.stringify(x));}
function createDefaultState(){return {program:clone(defaultProgram),currentLevelIndex:0,history:[],meta:{stateDirty:false,lastSyncAt:null}};}
function normalizeState(p){
  const s=p&&typeof p==="object"?p:createDefaultState();
  if(!s.program||!Array.isArray(s.program.exercises)||!Array.isArray(s.program.levels))s.program=clone(defaultProgram);
  if(!Array.isArray(s.history))s.history=[];
  if(typeof s.currentLevelIndex!=="number")s.currentLevelIndex=0;
  s.currentLevelIndex=Math.max(0,Math.min(s.currentLevelIndex,s.program.levels.length-1));
  if(!s.meta||typeof s.meta!=="object")s.meta={};
  if(typeof s.meta.stateDirty!=="boolean")s.meta.stateDirty=false;
  if(!("lastSyncAt" in s.meta))s.meta.lastSyncAt=null;
  return s;
}
function readStoredState(key){
  try{const raw=localStorage.getItem(key);return raw?normalizeState(JSON.parse(raw)):null;}catch{return null;}
}
function userStorageKey(userId){return USER_STORAGE_PREFIX+userId;}
function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||""));}
function ensureWorkoutIds(){
  let changed=false;
  state.history.forEach(w=>{if(!isUuid(w.id)){w.id=crypto.randomUUID();changed=true;}});
  if(changed)saveLocalState();
}
function hasMeaningfulLegacy(s){
  if(!s)return false;
  if(s.history&&s.history.length)return true;
  if(s.currentLevelIndex>0)return true;
  return false;
}

let state=createDefaultState();
let currentUser=null;
let supabaseClient=null;
let workout=null;
let workoutInterval=null;
let restInterval=null;
let deferredInstallPrompt=null;
let cloudSyncInFlight=false;
let lastEmailForOtp="";

const $=id=>document.getElementById(id);
const screens=["auth","home","workout","finish","history","coach"];

function saveLocalState(){
  if(!currentUser)return;
  localStorage.setItem(userStorageKey(currentUser.id),JSON.stringify(state));
}
function saveState(syncProgram=false){
  if(syncProgram)state.meta.stateDirty=true;
  saveLocalState();
  if(syncProgram)void syncAll();
}
function fmtDuration(seconds){
  const m=Math.floor(seconds/60).toString().padStart(2,"0");
  const s=Math.floor(seconds%60).toString().padStart(2,"0");
  return m+":"+s;
}
function currentLevel(){return state.program.levels[state.currentLevelIndex];}
function setSyncStatus(text,type){
  const el=$("syncIndicator");
  const cloud=$("cloudStatus");
  if(el){
    el.textContent=text;
    el.className="sync-indicator"+(type?" "+type:"");
    el.classList.toggle("hidden",!currentUser);
  }
  if(cloud)cloud.textContent=text==="מסונכרן"?"הנתונים נשמרים מקומית ובענן.":text;
}
function showScreen(name){
  screens.forEach(s=>$("screen-"+s).classList.toggle("active",s===name));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));
  document.body.classList.toggle("workout-mode",name==="workout");
  document.body.classList.toggle("auth-mode",name==="auth");
  if(name==="home")renderHome();
  if(name==="history")renderHistory();
}
function buildSteps(level){
  const steps=[];
  level.pattern.forEach(stage=>state.program.exercises.forEach(ex=>steps.push({
    stage,exerciseId:ex.id,name:ex.name,short:ex.short,reps:ex.multiplier*stage,
    unit:ex.unit,visual:ex.visual,instructions:ex.instructions
  })));
  return steps;
}
function levelHistory(){const lvl=currentLevel();return state.history.filter(x=>x.levelId===lvl.id);}
function progressionStatus(){
  const lvl=currentLevel(),hist=levelHistory(),recent=hist.slice(0,lvl.minSessions);
  const rated=recent.filter(x=>Number.isFinite(x.difficulty));
  const avg=rated.length?rated.reduce((a,b)=>a+b.difficulty,0)/rated.length:null;
  const enough=hist.length>=lvl.minSessions;
  const difficultyOk=avg!==null&&avg<=lvl.maxAvgDifficultyForSuggestion;
  const atLast=state.currentLevelIndex>=state.program.levels.length-1;
  return {lvl,hist,avg,eligible:enough&&difficultyOk&&!atLast,atLast};
}

function renderHome(){
  const lvl=currentLevel();
  $("currentLevelName").textContent=lvl.name;
  $("currentLevelPattern").textContent=lvl.pattern.join(" ← ");
  $("totalWorkouts").textContent=state.history.length;
  if(state.history.length){
    const last=new Date(state.history[0].startedAt);
    $("lastWorkoutText").textContent=last.toLocaleDateString("he-IL",{day:"numeric",month:"short"});
  }else $("lastWorkoutText").textContent="עדיין לא";

  const ps=progressionStatus();
  const done=Math.min(ps.hist.length,ps.lvl.minSessions);
  $("levelProgressBar").style.width=Math.round(done/ps.lvl.minSessions*100)+"%";
  $("progressText").textContent=ps.hist.length+" אימונים ברמה הזו. מינימום לפני הצעת התקדמות: "+ps.lvl.minSessions+". "+(ps.avg!==null?"ממוצע קושי באימונים האחרונים: "+ps.avg.toFixed(1)+"/10.":"עדיין אין מספיק דירוגי קושי.");
  $("progressBadge").textContent=ps.eligible?"אפשר לשקול":ps.atLast?"רמה עליונה":"נשארים כאן";
  $("promotionBox").classList.toggle("hidden",!ps.eligible);
  if(ps.eligible)$("promotionReason").textContent="השלמת לפחות "+ps.lvl.minSessions+" אימונים והממוצע הוא "+ps.avg.toFixed(1)+"/10. ההתקדמות אינה אוטומטית.";

  const preview=$("exercisePreview");
  preview.innerHTML="";
  state.program.exercises.forEach(ex=>{
    const row=document.createElement("div");
    row.className="mini";
    row.innerHTML='<div class="name">'+ex.name+'</div><div class="mult">×'+ex.multiplier+" "+ex.unit+"</div>";
    preview.appendChild(row);
  });
}

function startWorkout(){
  const lvl=currentLevel();
  workout={
    startedAt:new Date().toISOString(),startedPerf:performance.now(),pausedMs:0,pauseStarted:null,
    elapsedSeconds:0,levelId:lvl.id,levelName:lvl.name,pattern:[...lvl.pattern],
    planSnapshot:clone({exercises:state.program.exercises,level:lvl}),steps:buildSteps(lvl),stepIndex:0
  };
  if(workoutInterval)clearInterval(workoutInterval);
  workoutInterval=setInterval(updateWorkoutClock,500);
  showScreen("workout");
  renderWorkoutStep();
  updateWorkoutClock();
}
function updateWorkoutClock(){
  if(!workout||workout.pauseStarted)return;
  workout.elapsedSeconds=Math.max(0,Math.floor((performance.now()-workout.startedPerf-workout.pausedMs)/1000));
  $("workoutTimer").textContent=fmtDuration(workout.elapsedSeconds);
}
function togglePause(){
  if(!workout)return;
  if(!workout.pauseStarted){workout.pauseStarted=performance.now();$("pauseWorkoutBtn").textContent="המשך";}
  else{workout.pausedMs+=performance.now()-workout.pauseStarted;workout.pauseStarted=null;$("pauseWorkoutBtn").textContent="השהה";updateWorkoutClock();}
}
function renderWorkoutStep(){
  const step=workout.steps[workout.stepIndex];
  $("currentExerciseName").textContent=step.name;
  $("currentExerciseReps").textContent=step.reps;
  $("currentExerciseUnit").textContent=step.unit;
  $("currentExerciseVisual").textContent=step.visual;
  $("currentExerciseCue").textContent=(step.instructions&&step.instructions[0])||"";
  const ul=$("currentExerciseInstructions");
  ul.innerHTML="";
  step.instructions.forEach(t=>{const li=document.createElement("li");li.textContent=t;ul.appendChild(li);});
  ul.classList.add("hidden");
  $("toggleInstructionsBtn").textContent="הצג הוראות";
  $("toggleInstructionsBtn").setAttribute("aria-expanded","false");
  const next=workout.steps[workout.stepIndex+1];
  $("nextExerciseText").textContent=next?next.name+" · "+next.reps+" "+next.unit:"סיום האימון";
  $("workoutCounter").textContent="תחנה "+(workout.stepIndex+1)+" מתוך "+workout.steps.length;
  $("workoutStage").textContent="שלב "+step.stage;
  $("workoutProgressBar").style.width=((workout.stepIndex+1)/workout.steps.length*100)+"%";
}
function finishWorkoutFlow(){
  if(workoutInterval)clearInterval(workoutInterval);
  updateWorkoutClock();
  $("finishSummary").textContent=workout.levelName+" · "+fmtDuration(workout.elapsedSeconds)+" · "+workout.steps.length+" תחנות";
  showScreen("finish");
}
function completeStep(){
  if(!workout)return;
  if(workout.stepIndex>=workout.steps.length-1){$("workoutProgressBar").style.width="100%";finishWorkoutFlow();return;}
  workout.stepIndex+=1;renderWorkoutStep();
}
function startRest(){
  if(restInterval)clearInterval(restInterval);
  let remaining=45;
  $("restTimer").textContent=fmtDuration(remaining);
  $("restOverlay").classList.remove("hidden");
  restInterval=setInterval(()=>{remaining-=1;$("restTimer").textContent=fmtDuration(remaining);if(remaining<=0)stopRest();},1000);
}
function stopRest(){if(restInterval)clearInterval(restInterval);restInterval=null;$("restOverlay").classList.add("hidden");}
function abandonWorkout(){
  if(!confirm("לצאת מהאימון בלי לשמור אותו?"))return;
  if(workoutInterval)clearInterval(workoutInterval);
  stopRest();workout=null;showScreen("home");
}
function valueOrNull(v){if(v==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;}

function saveFinishedWorkout(){
  if(!workout)return;
  const now=new Date().toISOString();
  const rec={
    id:crypto.randomUUID(),startedAt:workout.startedAt,endedAt:now,durationSeconds:workout.elapsedSeconds,
    levelId:workout.levelId,levelName:workout.levelName,pattern:workout.pattern,completedSteps:workout.steps.length,
    difficulty:Number($("difficultyInput").value),notes:$("notesInput").value.trim(),
    heartRate:{avg:valueOrNull($("avgHrInput").value),max:valueOrNull($("maxHrInput").value),resting:valueOrNull($("restingHrInput").value)},
    planSnapshot:workout.planSnapshot,clientUpdatedAt:now
  };
  state.history.unshift(rec);
  saveLocalState();
  $("difficultyInput").value=5;$("difficultyValue").textContent="5/10";$("notesInput").value="";
  $("avgHrInput").value="";$("maxHrInput").value="";$("restingHrInput").value="";
  workout=null;showScreen("home");
  void syncWorkout(rec);
}

function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function renderHistory(){
  const box=$("historyList");box.innerHTML="";
  if(!state.history.length){box.innerHTML='<div class="card muted center">עדיין אין אימונים ביומן.</div>';return;}
  state.history.forEach(item=>{
    const d=new Date(item.startedAt),hrBits=[];
    if(item.heartRate&&item.heartRate.avg)hrBits.push("ממוצע "+item.heartRate.avg);
    if(item.heartRate&&item.heartRate.max)hrBits.push("מקס׳ "+item.heartRate.max);
    const card=document.createElement("div");card.className="history-item";
    card.innerHTML='<div class="history-top"><div><strong>'+d.toLocaleDateString("he-IL",{weekday:"short",day:"numeric",month:"short",year:"numeric"})+'</strong><div class="muted small-text">'+d.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"})+'</div></div><div class="badge">'+escapeHtml(item.levelName)+'</div></div><div class="history-meta"><span class="chip">'+fmtDuration(item.durationSeconds)+'</span><span class="chip">קושי '+item.difficulty+'/10</span>'+(hrBits.length?'<span class="chip">דופק '+hrBits.join(" · ")+"</span>":"")+'</div>'+(item.notes?'<p style="margin:12px 0 0">'+escapeHtml(item.notes)+"</p>":"");
    box.appendChild(card);
  });
}
function promoteLevel(){
  const ps=progressionStatus();if(!ps.eligible)return;
  state.currentLevelIndex+=1;saveState(true);renderHome();
}
async function clearHistory(){
  if(!state.history.length)return;
  if(!confirm("למחוק את כל יומן האימונים? הפעולה תמחק גם את העותק בענן."))return;
  if(!navigator.onLine){alert("צריך חיבור לאינטרנט כדי למחוק את היומן בבטחה.");return;}
  setSyncStatus("מוחק מהענן…","syncing");
  const {error}=await supabaseClient.from("workouts").delete().eq("user_id",currentUser.id);
  if(error){setSyncStatus("המחיקה נכשלה","error");alert("המחיקה לא בוצעה. היומן המקומי נשאר ללא שינוי.");return;}
  state.history=[];saveLocalState();renderHistory();renderHome();setSyncStatus("מסונכרן","");
}

function downloadBlob(text,type,filename){
  const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function exportJson(){
  const payload={exportedAt:new Date().toISOString(),app:"Holland Pyramid",schemaVersion:2,user:currentUser?currentUser.email:null,currentLevelIndex:state.currentLevelIndex,currentLevel:currentLevel(),program:state.program,history:state.history};
  downloadBlob(JSON.stringify(payload,null,2),"application/json","holland-pyramid-export-"+new Date().toISOString().slice(0,10)+".json");
}
function csvEscape(v){return '"'+String(v==null?"":v).replaceAll('"','""')+'"';}
function exportCsv(){
  const rows=[["date","time","level","duration_seconds","difficulty","avg_hr","max_hr","resting_hr","notes"]];
  state.history.slice().reverse().forEach(x=>{
    const d=new Date(x.startedAt);
    rows.push([d.toLocaleDateString("en-CA"),d.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"}),x.levelName,x.durationSeconds,x.difficulty,x.heartRate&&x.heartRate.avg||"",x.heartRate&&x.heartRate.max||"",x.heartRate&&x.heartRate.resting||"",x.notes||""]);
  });
  downloadBlob(rows.map(r=>r.map(csvEscape).join(",")).join("\n"),"text/csv;charset=utf-8","holland-pyramid-log-"+new Date().toISOString().slice(0,10)+".csv");
}
function validateProgram(p){
  if(!p||!Array.isArray(p.exercises)||!p.exercises.length)throw new Error("חסרים תרגילים");
  if(!Array.isArray(p.levels)||!p.levels.length)throw new Error("חסרות רמות");
  p.exercises.forEach(ex=>{if(!ex.id||!ex.name||!Number.isFinite(Number(ex.multiplier)))throw new Error("מבנה תרגיל לא תקין");});
  p.levels.forEach(l=>{if(!l.id||!l.name||!Array.isArray(l.pattern)||!l.pattern.length)throw new Error("מבנה רמה לא תקין");});
}
async function importProgram(){
  const f=$("programFileInput").files[0];
  if(!f){$("importStatus").textContent="בחר קובץ JSON קודם.";return;}
  try{
    const data=JSON.parse(await f.text()),incoming=data.program||data;
    validateProgram(incoming);
    state.program=incoming;
    state.currentLevelIndex=Math.min(state.currentLevelIndex,incoming.levels.length-1);
    saveState(true);
    $("importStatus").textContent="התוכנית עודכנה ותסונכרן לענן.";
    renderHome();
  }catch(e){$("importStatus").textContent="הייבוא נכשל: "+e.message;}
}

function workoutToDb(x){
  return {
    id:x.id,user_id:currentUser.id,started_at:x.startedAt,ended_at:x.endedAt||null,
    duration_seconds:x.durationSeconds||0,level_id:x.levelId||null,level_name:x.levelName||null,
    pattern:x.pattern||[],completed_steps:x.completedSteps||0,difficulty:x.difficulty||null,notes:x.notes||null,
    heart_rate:x.heartRate||{},plan_snapshot:x.planSnapshot||{},
    client_updated_at:x.clientUpdatedAt||x.endedAt||x.startedAt||new Date().toISOString()
  };
}
function dbToWorkout(x){
  return {
    id:x.id,startedAt:x.started_at,endedAt:x.ended_at,durationSeconds:x.duration_seconds,
    levelId:x.level_id,levelName:x.level_name,pattern:x.pattern||[],completedSteps:x.completed_steps,
    difficulty:x.difficulty,notes:x.notes||"",heartRate:x.heart_rate||{},planSnapshot:x.plan_snapshot||{},
    clientUpdatedAt:x.client_updated_at||x.updated_at
  };
}
async function syncWorkout(rec){
  if(!currentUser)return;
  if(!navigator.onLine){setSyncStatus("לא מקוון · נשמר מקומית","offline");return;}
  try{
    setSyncStatus("מסנכרן…","syncing");
    const {error}=await supabaseClient.from("workouts").upsert(workoutToDb(rec),{onConflict:"id"});
    if(error)throw error;
    setSyncStatus("מסונכרן","");
  }catch(e){console.error(e);setSyncStatus("ממתין לסנכרון","error");}
}
async function syncUserState(){
  if(!currentUser||!navigator.onLine)return;
  const payload={user_id:currentUser.id,program:state.program,current_level_index:state.currentLevelIndex};
  const {error}=await supabaseClient.from("user_state").upsert(payload,{onConflict:"user_id"});
  if(error)throw error;
  state.meta.stateDirty=false;saveLocalState();
}
async function syncAll(){
  if(!currentUser||cloudSyncInFlight)return;
  if(!navigator.onLine){setSyncStatus("לא מקוון · נשמר מקומית","offline");return;}
  cloudSyncInFlight=true;
  setSyncStatus("מסנכרן…","syncing");
  try{
    ensureWorkoutIds();
    if(state.history.length){
      const {error:pushError}=await supabaseClient.from("workouts").upsert(state.history.map(workoutToDb),{onConflict:"id"});
      if(pushError)throw pushError;
    }

    const {data:cloudState,error:stateError}=await supabaseClient.from("user_state").select("program,current_level_index,updated_at").eq("user_id",currentUser.id).maybeSingle();
    if(stateError)throw stateError;
    const cloudHasProgram=cloudState&&cloudState.program&&Array.isArray(cloudState.program.exercises)&&Array.isArray(cloudState.program.levels);
    if(state.meta.stateDirty||!cloudHasProgram)await syncUserState();
    else{
      state.program=cloudState.program;
      state.currentLevelIndex=Math.max(0,Math.min(Number(cloudState.current_level_index)||0,state.program.levels.length-1));
    }

    const {data:cloudWorkouts,error:workoutError}=await supabaseClient.from("workouts").select("*").order("started_at",{ascending:false});
    if(workoutError)throw workoutError;
    state.history=(cloudWorkouts||[]).map(dbToWorkout);
    state.meta.lastSyncAt=new Date().toISOString();
    saveLocalState();
    renderHome();
    if($("screen-history").classList.contains("active"))renderHistory();
    setSyncStatus("מסונכרן","");
  }catch(e){
    console.error(e);setSyncStatus("ממתין לסנכרון","error");
  }finally{cloudSyncInFlight=false;}
}

function claimLegacyDataIfNeeded(){
  if(localStorage.getItem(LEGACY_CLAIM_KEY))return;
  const legacy=readStoredState(LEGACY_STORAGE_KEY);
  if(!hasMeaningfulLegacy(legacy))return;
  const ids=new Set(state.history.map(x=>x.id));
  legacy.history.forEach(w=>{if(!ids.has(w.id))state.history.push(w);});
  state.history.sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));
  if(legacy.currentLevelIndex>state.currentLevelIndex)state.currentLevelIndex=legacy.currentLevelIndex;
  if(legacy.program&&Array.isArray(legacy.program.exercises))state.program=legacy.program;
  state.meta.stateDirty=true;
  localStorage.setItem(LEGACY_CLAIM_KEY,currentUser.id);
  saveLocalState();
}

async function activateUser(user){
  currentUser=user;
  const stored=readStoredState(userStorageKey(user.id));
  state=stored||createDefaultState();
  claimLegacyDataIfNeeded();
  ensureWorkoutIds();
  $("accountEmail").textContent=user.email||"משתמש";
  $("syncIndicator").classList.remove("hidden");
  showScreen("home");
  await syncAll();
}
function resetToAuth(){
  currentUser=null;state=createDefaultState();
  $("syncIndicator").classList.add("hidden");
  $("accountEmail").textContent="—";
  showScreen("auth");
}

async function sendOtp(){
  const email=$("authEmailInput").value.trim().toLowerCase();
  if(!email){$("authStatus").textContent="הכנס כתובת אימייל.";return;}
  lastEmailForOtp=email;
  $("sendMagicLinkBtn").disabled=true;
  $("authStatus").textContent="שולח קוד…";
  const {error}=await supabaseClient.auth.signInWithOtp({email:email,options:{shouldCreateUser:true}});
  $("sendMagicLinkBtn").disabled=false;
  if(error){$("authStatus").textContent="לא הצלחתי לשלוח קוד: "+error.message;return;}
  $("otpBlock").classList.remove("hidden");
  $("authOtpInput").focus();
  $("authStatus").textContent="שלחנו קוד למייל. הזן אותו כאן.";
}
async function verifyOtp(){
  const email=(lastEmailForOtp||$("authEmailInput").value.trim().toLowerCase());
  const token=$("authOtpInput").value.trim();
  if(!email||token.length!==6){$("authStatus").textContent="הזן את הקוד בן 6 הספרות.";return;}
  $("verifyOtpBtn").disabled=true;
  $("authStatus").textContent="מאמת…";
  const {data,error}=await supabaseClient.auth.verifyOtp({email:email,token:token,type:"email"});
  $("verifyOtpBtn").disabled=false;
  if(error){$("authStatus").textContent="הקוד לא תקין או שפג תוקפו.";return;}
  if(data&&data.user){$("authStatus").textContent="נכנסת בהצלחה.";await activateUser(data.user);}
}
async function signOut(){
  setSyncStatus("מתנתק…","syncing");
  await supabaseClient.auth.signOut();
  resetToAuth();
}

async function initializeAuth(){
  if(!window.supabase||!window.supabase.createClient){
    $("authStatus").textContent="לא ניתן לטעון את שירות ההתחברות. בדוק חיבור לאינטרנט.";
    return;
  }
  supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });
  const {data}=await supabaseClient.auth.getSession();
  if(data&&data.session&&data.session.user)await activateUser(data.session.user);
  else resetToAuth();

  supabaseClient.auth.onAuthStateChange((event,session)=>{
    if(session&&session.user&&(!currentUser||session.user.id!==currentUser.id))setTimeout(()=>activateUser(session.user),0);
    if(event==="SIGNED_OUT")setTimeout(resetToAuth,0);
  });
}

window.addEventListener("online",()=>void syncAll());
window.addEventListener("offline",()=>setSyncStatus("לא מקוון · נשמר מקומית","offline"));
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("installBtn").classList.remove("hidden");});

$("installBtn").addEventListener("click",async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("installBtn").classList.add("hidden");});
document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>showScreen(btn.dataset.screen)));
$("startWorkoutBtn").addEventListener("click",startWorkout);
$("pauseWorkoutBtn").addEventListener("click",togglePause);
$("exitWorkoutBtn").addEventListener("click",abandonWorkout);
$("doneStepBtn").addEventListener("click",completeStep);
$("restBtn").addEventListener("click",startRest);
$("skipRestBtn").addEventListener("click",stopRest);
$("saveWorkoutBtn").addEventListener("click",saveFinishedWorkout);
$("promoteBtn").addEventListener("click",promoteLevel);
$("clearHistoryBtn").addEventListener("click",clearHistory);
$("exportJsonBtn").addEventListener("click",exportJson);
$("exportCsvBtn").addEventListener("click",exportCsv);
$("importProgramBtn").addEventListener("click",importProgram);
$("signOutBtn").addEventListener("click",signOut);
$("sendMagicLinkBtn").addEventListener("click",sendOtp);
$("verifyOtpBtn").addEventListener("click",verifyOtp);
$("authEmailInput").addEventListener("keydown",e=>{if(e.key==="Enter")void sendOtp();});
$("authOtpInput").addEventListener("keydown",e=>{if(e.key==="Enter")void verifyOtp();});
$("difficultyInput").addEventListener("input",e=>$("difficultyValue").textContent=e.target.value+"/10");
$("toggleInstructionsBtn").addEventListener("click",()=>{
  const ul=$("currentExerciseInstructions"),open=ul.classList.contains("hidden");
  ul.classList.toggle("hidden",!open);
  $("toggleInstructionsBtn").textContent=open?"הסתר הוראות":"הצג הוראות";
  $("toggleInstructionsBtn").setAttribute("aria-expanded",open?"true":"false");
});

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./service-worker.js").then(reg=>reg.update()).catch(()=>{});
}
void initializeAuth();
