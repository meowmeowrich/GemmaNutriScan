(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const p=(r,t=896)=>new Promise((n,i)=>{const s=new FileReader;s.readAsDataURL(r),s.onload=a=>{var c;const o=new Image;o.src=(c=a.target)==null?void 0:c.result,o.onload=()=>{const l=document.createElement("canvas");l.width=t,l.height=t;const d=l.getContext("2d");if(!d){i(new Error("Could not get canvas context"));return}d.fillStyle="#000000",d.fillRect(0,0,t,t);const u=Math.min(t/o.width,t/o.height),h=t/2-o.width/2*u,f=t/2-o.height/2*u;d.drawImage(o,h,f,o.width*u,o.height*u),n(l.toDataURL("image/jpeg",.85))},o.onerror=l=>i(l)},s.onerror=a=>i(a)}),y=`
You are an expert nutritionist AI analyzing food images.
You must output STRICT VALID JSON only. 
DO NOT write markdown code blocks (no \`\`\`json). 
DO NOT write any conversational text before or after the JSON.

Task:
1. Identify the food in the image.
2. Estimate the portion size and weight (guess the weight in grams).
3. Calculate calories and macros.
4. Estimate vitamin density.

Return strictly this JSON structure:
{
  "foodName": "Dish Name",
  "description": "Brief 1-sentence visual description.",
  "estimatedWeight": "e.g. 250g",
  "calories": 0,
  "macros": {
    "protein": { "name": "Protein", "amount": 0, "unit": "g" },
    "carbs": { "name": "Carbs", "amount": 0, "unit": "g" },
    "fat": { "name": "Fat", "amount": 0, "unit": "g" }
  },
  "vitamins": [
    { "name": "Vitamin A", "level": 0, "unit": "%DV" },
    { "name": "Vitamin C", "level": 0, "unit": "%DV" },
    { "name": "Iron", "level": 0, "unit": "%DV" },
    { "name": "Calcium", "level": 0, "unit": "%DV" }
  ],
  "healthScore": 5
}

If no food is detected, return: {"error": "No food detected"}
`,v=async(r,t)=>{const n=r.replace(/^data:image\/(png|jpeg|jpg);base64,/,"");try{const i={model:t.model,messages:[{role:"system",content:y},{role:"user",content:[{type:"text",text:"Analyze this image."},{type:"image_url",image_url:{url:`data:image/jpeg;base64,${n}`}}]}],temperature:.1,max_tokens:800,stream:!1},s=await fetch(`${t.baseUrl}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});if(!s.ok)throw new Error(`AI Server Error: ${s.status}`);const a=await s.json();if(!a.choices||a.choices.length===0)throw new Error("No response from AI model");let o=a.choices[0].message.content;o=o.replace(/```json/g,"").replace(/```/g,"").trim();const c=o.indexOf("{"),l=o.lastIndexOf("}");c!==-1&&l!==-1&&(o=o.substring(c,l+1));try{const d=JSON.parse(o);if(d.error)throw new Error(d.error);return d}catch{throw console.error("Raw Output:",o),new Error("Failed to parse nutrition data. The model output was not valid JSON.")}}catch(i){throw console.error("Analysis failed",i),i}};let m={baseUrl:"http://192.168.0.67:1234",model:"google/gemma-3-12b"};const e={uploadZone:document.getElementById("upload-zone"),fileInput:document.getElementById("file-input"),imagePreview:document.getElementById("image-preview"),uploadPrompt:document.getElementById("upload-prompt"),loadingState:document.getElementById("loading-state"),errorState:document.getElementById("error-state"),errorMessage:document.getElementById("error-message"),resultsContainer:document.getElementById("results-container"),emptyState:document.getElementById("empty-state"),contentState:document.getElementById("content-state"),resFoodName:document.getElementById("res-food-name"),resDescription:document.getElementById("res-description"),resCalories:document.getElementById("res-calories"),resWeight:document.getElementById("res-weight"),macrosList:document.getElementById("macros-list"),vitaminsList:document.getElementById("vitamins-list"),healthScore:document.getElementById("health-score"),settingsBtn:document.getElementById("settings-btn"),settingsModal:document.getElementById("settings-modal"),settingsClose:document.getElementById("settings-close"),settingsSave:document.getElementById("settings-save"),settingUrl:document.getElementById("setting-url"),settingModel:document.getElementById("setting-model")};e.uploadZone.addEventListener("click",()=>e.fileInput.click());e.fileInput.addEventListener("change",async r=>{var n;const t=(n=r.target.files)==null?void 0:n[0];t&&w(t)});e.settingsBtn.addEventListener("click",()=>{e.settingUrl.value=m.baseUrl,e.settingModel.value=m.model,e.settingsModal.classList.remove("hidden")});e.settingsClose.addEventListener("click",()=>{e.settingsModal.classList.add("hidden")});e.settingsSave.addEventListener("click",()=>{m.baseUrl=e.settingUrl.value,m.model=e.settingModel.value,e.settingsModal.classList.add("hidden")});async function w(r){e.errorState.classList.add("hidden"),e.contentState.classList.add("hidden"),e.emptyState.classList.add("hidden"),e.loadingState.classList.remove("hidden");const t=new FileReader;t.onload=n=>{var i;e.imagePreview.src=(i=n.target)==null?void 0:i.result,e.imagePreview.classList.remove("hidden"),e.uploadPrompt.classList.add("opacity-0")},t.readAsDataURL(r);try{const n=await p(r,896),i=await v(n,m);E(i)}catch(n){e.loadingState.classList.add("hidden"),e.errorState.classList.remove("hidden"),e.errorMessage.textContent=n.message||"Failed to analyze image.",e.emptyState.classList.remove("hidden"),console.error(n)}}function E(r){e.loadingState.classList.add("hidden"),e.contentState.classList.remove("hidden"),e.resFoodName.textContent=r.foodName,e.resDescription.textContent=r.description,e.resCalories.textContent=r.calories.toString(),e.resWeight.textContent=r.estimatedWeight,e.healthScore.textContent=`${r.healthScore}/10`;const t=r.healthScore;e.healthScore.className=`text-xl font-bold ${t>=7?"text-brand-400":t>=4?"text-amber-400":"text-red-400"}`,e.macrosList.innerHTML="",e.macrosList.appendChild(g("Protein",r.macros.protein.amount,50,"g","bg-blue-500")),e.macrosList.appendChild(g("Carbohydrates",r.macros.carbs.amount,100,"g","bg-amber-500")),e.macrosList.appendChild(g("Fats",r.macros.fat.amount,40,"g","bg-rose-500")),e.vitaminsList.innerHTML="",r.vitamins.forEach(n=>{e.vitaminsList.appendChild(I(n.name,n.level))}),requestAnimationFrame(()=>{document.querySelectorAll(".bar-fill").forEach(n=>{n.style.width=n.dataset.width})})}function g(r,t,n,i,s){const a=document.createElement("div");a.className="mb-4 w-full";const o=Math.min(t/n*100,100);return a.innerHTML=`
    <div class="flex justify-between items-end mb-1">
      <span class="text-sm font-medium text-slate-300">${r}</span>
      <span class="text-xs font-mono text-slate-400">${t}${i}</span>
    </div>
    <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
      <div
        class="h-2.5 rounded-full ${s} bar-fill"
        style="width: 0%"
        data-width="${o}%"
      ></div>
    </div>
  `,a}function I(r,t){const n=document.createElement("div");return n.className="flex items-center gap-3",n.innerHTML=`
    <div class="w-24 text-sm text-slate-300 font-medium">${r}</div>
    <div class="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
      <div 
         class="h-full bg-brand-400 rounded-full bar-fill"
         style="width: 0%"
         data-width="${Math.min(t,100)}%"
      ></div>
    </div>
    <div class="w-12 text-right text-xs text-slate-400">${t}%</div>
  `,n}
