(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function t(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(n){if(n.ep)return;n.ep=!0;const o=t(n);fetch(n.href,o)}})();function Re(){const e=Math.floor(Math.random()*65536).toString(16).padStart(4,"0");return`${Date.now().toString(36)}-${e}`}function se(e){return{meta:{runId:Re(),seed:e,rngCursor:0,startedAt:Date.now()},player:{budget:80,maxBudget:80,energy:3,energyPerTurn:3,headroom:0,hand:[],draw:[],discard:[],exhaust:[],statuses:{},relics:["pager"],hotfixes:[]},combat:void 0,map:{act:1,nodes:[],currentNodeId:null,visitedNodeIds:[]},deck:[],credits:0,scene:"title",version:1,history:[]}}const P={manual_fix:{id:"manual_fix",name:"Manual Fix",type:"attack",cost:1,effects:[{kind:"burn",amount:6}],upgradedEffects:[{kind:"burn",amount:9}],flavor:"When all else fails, restart the pod."},failover:{id:"failover",name:"Failover",type:"skill",cost:1,effects:[{kind:"headroom",amount:5}],upgradedEffects:[{kind:"headroom",amount:8}],flavor:"Route around the damage."},page_senior_engineer:{id:"page_senior_engineer",name:"Page Senior Engineer",type:"skill",cost:2,effects:[{kind:"draw",amount:2},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],upgradedEffects:[{kind:"draw",amount:3},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],flavor:"They've seen this before."},canary_deploy:{id:"canary_deploy",name:"Canary Deploy",type:"attack",cost:1,effects:[{kind:"burn",amount:5},{kind:"draw",amount:1}],upgradedEffects:[{kind:"burn",amount:8},{kind:"draw",amount:1}],flavor:"Ship a little, learn a lot."},circuit_breaker:{id:"circuit_breaker",name:"Circuit Breaker",type:"skill",cost:1,effects:[{kind:"headroom",amount:8}],upgradedEffects:[{kind:"headroom",amount:12}],flavor:"Stop the bleeding before you debug it."},chaos_engineering:{id:"chaos_engineering",name:"Chaos Engineering",type:"skill",cost:2,effects:[{kind:"applyStatus",status:"customer_facing",stacks:3,target:"all"},{kind:"selfBurn",amount:5}],upgradedEffects:[{kind:"applyStatus",status:"customer_facing",stacks:5,target:"all"},{kind:"selfBurn",amount:5}],flavor:"Break it on purpose so it doesn't break you on Friday."},auto_scaling:{id:"auto_scaling",name:"Auto-Scaling",type:"power",cost:1,effects:[],powerTrigger:[{kind:"headroom",amount:4}],upgradedPowerTrigger:[{kind:"headroom",amount:6}],flavor:"Demand goes up. Capacity goes up."},page_the_ceo:{id:"page_the_ceo",name:"Page the CEO",type:"skill",cost:2,effects:[{kind:"burn",amount:30}],upgradedEffects:[{kind:"burn",amount:40}],exhaust:!0,flavor:"Nuclear option. One per incident."},tech_debt:{id:"tech_debt",name:"Tech Debt",type:"curse",cost:-1,effects:[],curseEffect:[{kind:"selfBurn",amount:2}],flavor:"Unplayable. Costs 2 Budget every turn it sits in your hand."},rollback:{id:"rollback",name:"Rollback",type:"attack",cost:1,effects:[{kind:"burn",amount:8}],upgradedEffects:[{kind:"burn",amount:11}],flavor:"Revert to last known good. (That was three deployments ago.)"},load_balancer:{id:"load_balancer",name:"Load Balancer",type:"skill",cost:1,effects:[{kind:"headroom",amount:7}],upgradedEffects:[{kind:"headroom",amount:10}],flavor:"Distribute the pain."},monitoring_alert:{id:"monitoring_alert",name:"Monitoring Alert",type:"attack",cost:0,effects:[{kind:"burn",amount:4}],upgradedEffects:[{kind:"burn",amount:6}],flavor:"Better late than never."},feature_flag:{id:"feature_flag",name:"Feature Flag",type:"skill",cost:1,effects:[{kind:"draw",amount:2}],upgradedEffects:[{kind:"draw",amount:3}],flavor:"Ship it. Just turn it off first."},health_check:{id:"health_check",name:"Health Check",type:"skill",cost:1,effects:[{kind:"headroom",amount:4},{kind:"draw",amount:1}],upgradedEffects:[{kind:"headroom",amount:5},{kind:"draw",amount:1}],flavor:"Are you up? Are you actually up?"},graceful_degradation:{id:"graceful_degradation",name:"Graceful Degradation",type:"skill",cost:1,effects:[{kind:"headroom",amount:9}],upgradedEffects:[{kind:"headroom",amount:12}],flavor:"Do less. Survive."},rate_limiter:{id:"rate_limiter",name:"Rate Limiter",type:"skill",cost:1,effects:[{kind:"applyStatus",status:"throttled",stacks:2,target:"single"}],upgradedEffects:[{kind:"applyStatus",status:"throttled",stacks:3,target:"single"}],flavor:"You get 100 requests. You don't get 101."},zero_downtime_deploy:{id:"zero_downtime_deploy",name:"Zero Downtime Deploy",type:"attack",cost:2,effects:[{kind:"burn",amount:10},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],upgradedEffects:[{kind:"burn",amount:14},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],flavor:"Phased rollout. No one even noticed."},sli_dashboard:{id:"sli_dashboard",name:"SLI Dashboard",type:"skill",cost:2,effects:[{kind:"draw",amount:3},{kind:"applyStatus",status:"confidence",stacks:1,target:"self"}],upgradedEffects:[{kind:"draw",amount:3},{kind:"applyStatus",status:"confidence",stacks:1,target:"self"},{kind:"headroom",amount:2}],flavor:"The graph goes up. For now."},postmortem:{id:"postmortem",name:"Blameless Postmortem",type:"skill",cost:2,effects:[{kind:"restoreBudget",amount:12}],upgradedEffects:[{kind:"restoreBudget",amount:18}],exhaust:!0,flavor:"The system failed, not the person."},runbook:{id:"runbook",name:"Runbook",type:"skill",cost:1,effects:[{kind:"draw",amount:2},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],upgradedEffects:[{kind:"draw",amount:3},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],flavor:"Step 1: Don't panic. Step 2: Follow this document."},service_mesh:{id:"service_mesh",name:"Service Mesh",type:"power",cost:1,effects:[],powerTrigger:[{kind:"headroom",amount:3},{kind:"draw",amount:1}],upgradedPowerTrigger:[{kind:"headroom",amount:5},{kind:"draw",amount:1}],flavor:"Distributed reliability, automatically."},on_call_swap:{id:"on_call_swap",name:"On-Call Swap",type:"skill",cost:0,effects:[{kind:"draw",amount:2}],upgradedEffects:[{kind:"draw",amount:3}],exhaust:!0,flavor:"Hand it to someone else. Fast."},incident_playbook:{id:"incident_playbook",name:"Incident Playbook",type:"power",cost:2,effects:[],powerTrigger:[{kind:"draw",amount:1},{kind:"headroom",amount:2}],upgradedPowerTrigger:[{kind:"draw",amount:1},{kind:"headroom",amount:4}],flavor:"Every scenario, pre-planned."},error_budget_calc:{id:"error_budget_calc",name:"Error Budget Calc",type:"skill",cost:1,effects:[{kind:"applyStatus",status:"confidence",stacks:1,target:"self"}],upgradedEffects:[{kind:"applyStatus",status:"confidence",stacks:1,target:"self"},{kind:"headroom",amount:4}],flavor:"You have 0.1% left. Spend it wisely."},dependency_audit:{id:"dependency_audit",name:"Dependency Audit",type:"attack",cost:2,effects:[{kind:"burn",amount:12},{kind:"applyStatus",status:"throttled",stacks:2,target:"single"}],upgradedEffects:[{kind:"burn",amount:16},{kind:"applyStatus",status:"throttled",stacks:2,target:"single"}],flavor:"Forty-seven transitive dependencies. Three are vulnerable."},blue_green_deploy:{id:"blue_green_deploy",name:"Blue-Green Deploy",type:"attack",cost:1,effects:[{kind:"burn",amount:7},{kind:"draw",amount:1}],upgradedEffects:[{kind:"burn",amount:10},{kind:"draw",amount:1}],flavor:"Route traffic. Switch. Celebrate."},chaos_monkey:{id:"chaos_monkey",name:"Chaos Monkey",type:"attack",cost:1,effects:[{kind:"burn",amount:6},{kind:"applyStatus",status:"customer_facing",stacks:1,target:"single"}],upgradedEffects:[{kind:"burn",amount:8},{kind:"applyStatus",status:"customer_facing",stacks:1,target:"single"}],flavor:"Randomly terminates instances in production. That's the feature."},toil_reduction:{id:"toil_reduction",name:"Toil Reduction",type:"skill",cost:2,effects:[{kind:"removeStatus",status:"toil",target:"self"},{kind:"headroom",amount:8}],upgradedEffects:[{kind:"removeStatus",status:"toil",target:"self"},{kind:"headroom",amount:12}],flavor:"Automate the thing that pages you at 3am."},load_shedding:{id:"load_shedding",name:"Load Shedding",type:"skill",cost:1,effects:[{kind:"applyStatus",status:"throttled",stacks:3,target:"all"}],upgradedEffects:[{kind:"applyStatus",status:"throttled",stacks:4,target:"all"}],flavor:"Shed load before the load sheds you."},slo_tightening:{id:"slo_tightening",name:"SLO Tightening",type:"power",cost:3,effects:[],powerTrigger:[{kind:"applyStatus",status:"pressure",stacks:1,target:"self"}],upgradedPowerTrigger:[{kind:"applyStatus",status:"pressure",stacks:2,target:"self"}],flavor:"Make the target harder. Make yourself stronger."},capacity_planning:{id:"capacity_planning",name:"Capacity Planning",type:"skill",cost:2,effects:[{kind:"restoreBudget",amount:8},{kind:"draw",amount:2}],upgradedEffects:[{kind:"restoreBudget",amount:12},{kind:"draw",amount:2}],flavor:"Provision for peak. Not for Tuesday at 2am."},on_fire:{id:"on_fire",name:"On Fire",type:"attack",cost:0,effects:[{kind:"burn",amount:5}],upgradedEffects:[{kind:"burn",amount:8}],flavor:"Everything is on fire. Might as well use it."},war_room:{id:"war_room",name:"War Room",type:"skill",cost:3,effects:[{kind:"restoreBudget",amount:20}],upgradedEffects:[{kind:"restoreBudget",amount:28}],exhaust:!0,flavor:"All hands on deck. Only pull once."},retry_with_backoff:{id:"retry_with_backoff",name:"Retry with Backoff",type:"attack",cost:1,effects:[{kind:"burn",amount:6},{kind:"burn",amount:6}],upgradedEffects:[{kind:"burn",amount:8},{kind:"burn",amount:8}],flavor:"Try again. Then try again, but slower."},postmortem_template:{id:"postmortem_template",name:"Postmortem Template",type:"skill",cost:1,effects:[{kind:"restoreBudget",amount:6},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],upgradedEffects:[{kind:"restoreBudget",amount:9},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],flavor:"Timeline: unclear. Impact: large. Action items: many."},observability_pipeline:{id:"observability_pipeline",name:"Observability Pipeline",type:"power",cost:2,effects:[],powerTrigger:[{kind:"applyStatus",status:"observability",stacks:1,target:"self"}],upgradedPowerTrigger:[{kind:"applyStatus",status:"observability",stacks:2,target:"self"}],flavor:"See everything. All the time."}};let $e=0;function Ae(e){return`${e}_${$e++}`}function V(e){const r=P[e];if(!r)throw new Error(`Unknown card def: ${e}`);return{instanceId:Ae(e),defId:e,name:r.name,type:r.type,cost:r.cost,upgraded:!1}}function Oe(){return[...Array.from({length:5},()=>V("manual_fix")),...Array.from({length:4},()=>V("failover")),V("page_senior_engineer")]}const Se={rollback_hotfix:{id:"rollback_hotfix",name:"Rollback Hotfix",effects:[{kind:"burn",amount:20}],flavor:"Revert everything. Sort it out later."},failover_hotfix:{id:"failover_hotfix",name:"Failover Hotfix",effects:[{kind:"headroom",amount:25}],flavor:"Not fixed. Just not failing right now."}},ee={flapping_health_check:{id:"flapping_health_check",name:"Flapping Health Check",stability:20,intentPattern:[{kind:"burn",amount:6},{kind:"burn",amount:4}]},memory_leak:{id:"memory_leak",name:"Memory Leak",stability:36,intentPattern:[{kind:"buff",status:"pressure",stacks:1},{kind:"burn",amount:8},{kind:"buff",status:"pressure",stacks:1},{kind:"burn",amount:10}]},zombie_process:{id:"zombie_process",name:"Zombie Process",stability:18,intentPattern:[{kind:"debuff",status:"toil",stacks:1},{kind:"burn",amount:5}]},the_pager_storm:{id:"the_pager_storm",name:"The Pager Storm",stability:75,intentPattern:[{kind:"burn",amount:10},{kind:"debuff",status:"on_call_fatigue",stacks:1},{kind:"burn",amount:18},{kind:"buff",status:"pressure",stacks:2}]},phantom_read:{id:"phantom_read",name:"Phantom Read",stability:16,intentPattern:[{kind:"burn",amount:5},{kind:"debuff",status:"throttled",stacks:1}]},cron_storm:{id:"cron_storm",name:"Cron Storm",stability:24,intentPattern:[{kind:"burn",amount:6},{kind:"burn",amount:3},{kind:"burn",amount:3}]},stale_cache:{id:"stale_cache",name:"Stale Cache",stability:22,intentPattern:[{kind:"buff",status:"pressure",stacks:1},{kind:"burn",amount:7}]},misconfigured_tls:{id:"misconfigured_tls",name:"Misconfigured TLS",stability:20,intentPattern:[{kind:"debuff",status:"toil",stacks:1},{kind:"burn",amount:8}]},cascading_failure:{id:"cascading_failure",name:"Cascading Failure",stability:55,intentPattern:[{kind:"burn",amount:8},{kind:"buff",status:"pressure",stacks:1},{kind:"burn",amount:10},{kind:"buff",status:"pressure",stacks:1}]},total_outage:{id:"total_outage",name:"Total Outage",stability:100,intentPattern:[{kind:"burn",amount:14},{kind:"debuff",status:"customer_facing",stacks:2},{kind:"burn",amount:24},{kind:"buff",status:"pressure",stacks:3}]},deadlock:{id:"deadlock",name:"Deadlock",stability:30,intentPattern:[{kind:"debuff",status:"toil",stacks:2},{kind:"burn",amount:10}]}},De={"1-0":["flapping_health_check"],"1-1":["flapping_health_check","phantom_read"],"1-2":["phantom_read","cron_storm","stale_cache"],"1-3":["memory_leak","cron_storm","misconfigured_tls"],"1-4":["memory_leak","zombie_process","misconfigured_tls"],"1-elite":["cascading_failure"],"1-boss":["the_pager_storm"],"2-0":["zombie_process","stale_cache"],"2-1":["memory_leak","misconfigured_tls"],"2-2":["deadlock","memory_leak"],"2-3":["zombie_process","deadlock"],"2-4":["memory_leak","deadlock"],"2-elite":["cascading_failure"],"2-boss":["total_outage"]};function Le(e){const r=/r(\d+)c/.exec(e);return r?parseInt(r[1]):0}function ue(e,r,t,i){const n=Le(r),o=e==="boss"?`${t}-boss`:e==="elite"?`${t}-elite`:`${t}-${Math.min(n,4)}`,d=De[o]??["flapping_health_check"];return d[Math.floor(i*d.length)]}let Pe=0;function fe(e){const r=ee[e];if(!r)throw new Error(`Unknown enemy def: ${e}`);return{instanceId:`${e}_${Pe++}`,defId:e,name:r.name,stability:r.stability,maxStability:r.stability,statuses:{}}}function te(e,r){const t=ee[e];return t?t.intentPattern[r%t.intentPattern.length]:{kind:"unknown"}}function Me(e){let r=e>>>0;return function(){r=r+1831565813>>>0;let t=r;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function ze(e){if(/^0x[0-9a-fA-F]+$/.test(e))return parseInt(e,16);if(/^\d+$/.test(e))return parseInt(e,10);let r=2166136261;for(let t=0;t<e.length;t++)r^=e.charCodeAt(t),r=Math.imul(r,16777619);return r>>>0}let me="",W=0,G=null;function B(e){const{seed:r,rngCursor:t}=e.meta;if(r!==me||t<W||G===null){G=Me(ze(r));for(let n=0;n<t;n++)G();me=r,W=t}for(;W<t;)G(),W++;const i=G();return W++,[i,{...e,meta:{...e.meta,rngCursor:t+1}}]}function ge(e,r,t){if(!e.combat)return e;const i=e.combat.enemies.map(n=>n.instanceId===r?{...n,stability:Math.max(0,n.stability-t)}:n);return{...e,combat:{...e.combat,enemies:i}}}function q(e,r){return{...e,player:{...e.player,headroom:e.player.headroom+r}}}function Q(e,r){const t=[...e];let i=r;for(let n=t.length-1;n>0;n--){const[o,d]=B(i);i=d;const m=Math.floor(o*(n+1));[t[n],t[m]]=[t[m],t[n]]}return[t,i]}function N(e,r){let t=e,{hand:i,draw:n,discard:o}=t.player,d=r;for(;d>0;){if(n.length===0){if(o.length===0)break;const[h,f]=Q(o,t);t=f,n=h,o=[]}const m=Math.min(d,n.length);i=[...i,...n.slice(0,m)],n=n.slice(m),d-=m}return{...t,player:{...t.player,hand:i,draw:n,discard:o}}}const Ne=["customer_facing","throttled","toil","flow","on_call_fatigue","observability"];function D(e,r,t,i){if(r==="player")return{...e,player:{...e.player,statuses:{...e.player.statuses,[t]:(e.player.statuses[t]??0)+i}}};if(!e.combat)return e;const n=e.combat.enemies.map(o=>o.instanceId===r?{...o,statuses:{...o.statuses,[t]:(o.statuses[t]??0)+i}}:o);return{...e,combat:{...e.combat,enemies:n}}}function X(e,r,t){if(r==="player"){const n={...e.player.statuses};return delete n[t],{...e,player:{...e.player,statuses:n}}}if(!e.combat)return e;const i=e.combat.enemies.map(n=>{if(n.instanceId!==r)return n;const o={...n.statuses};return delete o[t],{...n,statuses:o}});return{...e,combat:{...e.combat,enemies:i}}}function he(e,r){const t={...e};for(const i of Ne)if(t[i]!==void 0&&(r===void 0||r.has(i))){const n=t[i]-1;n<=0?delete t[i]:t[i]=n}return t}function re(e,r,t){let i=e;return r.pressure&&(i+=r.pressure),r.confidence&&(i*=2),r.throttled&&(i=Math.floor(i*.75)),t.customer_facing&&(i=Math.ceil(i*1.5)),i}function ae(e,r){return e+(r.stability??0)}const ye=[1,2,3,3,3,2,1],Be=[["combat"],["combat","event","rest","elite"],["rest","combat","elite","event","shop"],["shop","event","combat","rest","elite"],["event","combat","rest","elite","shop"],["rest","event","combat","shop"],["boss"]];function oe(e,r){let t=r;const i=[];for(let n=0;n<ye.length;n++){const o=ye[n],d=Be[n];let m;if(d.length===1)m=[d[0]];else{const f=[...d];m=[];for(let S=0;S<o&&f.length>0;S++){const[R,w]=B(t);t=w;const A=Math.floor(R*f.length);m.push(f.splice(A,1)[0])}}const h=m.map((f,S)=>({id:`a${e}r${n}c${S}`,type:f,next:[]}));i.push(h)}for(let n=0;n<i.length-1;n++){const o=i[n+1];for(const d of i[n])d.next=o.map(m=>m.id)}return{nodes:i,firstNodeId:i[0][0].id,state:t}}const F=[{id:"untested_migration",title:"The Untested Migration",text:"You find a schema migration in the deployment pipeline marked 'low risk.' It has never been run against production data. Three engineers promise it's fine.",choices:[{text:"Run it anyway",outcome:{kind:"gainCredits",amount:50}},{text:"Roll it back and schedule a review",outcome:{kind:"nothing"}},{text:"Let the intern run it 'for experience'",outcome:{kind:"addCurse"}}]},{id:"heroic_engineer",title:"Heroic Engineer",text:"A senior engineer offers to stay up all night and manually patch the issue. 'Don't page anyone, I've got this,' they say. Truly inspiring.",choices:[{text:"Accept their sacrifice",outcome:{kind:"gainCard",rarity:"rare"}},{text:"Insist on proper on-call rotation",outcome:{kind:"gainCredits",amount:30}}]},{id:"vendor_outage",title:"Vendor Outage",text:"Your cloud provider is experiencing 'elevated error rates' in the region your database lives in. Their status page says 'investigating.' That's all.",choices:[{text:"Wait it out (what choice do you have?)",outcome:{kind:"loseMaxBudget",amount:5}},{text:"Fail over to backup region",outcome:{kind:"loseCredits",amount:50}}]},{id:"mystery_microservice",title:"Mystery Box Microservice",text:"You discover a service in the catalog with no owner, no documentation, and 40,000 requests per second. Disabling it would be catastrophic. Probably.",choices:[{text:"Leave it alone and pretend you didn't see it",outcome:{kind:"nothing"}},{text:"Add a README and assign an owner",outcome:{kind:"gainCredits",amount:75}},{text:"Refactor it on the spot",outcome:{kind:"addCurse"}}]},{id:"on_call_handoff",title:"On-Call Handoff",text:"The engineer going off-call insists everything is fine. The only open incident is labeled 'investigating.' There are seven of them.",choices:[{text:"Accept the handoff cheerfully",outcome:{kind:"nothing"}},{text:"Spend an hour doing a proper status review",outcome:{kind:"gainCredits",amount:40}},{text:"Immediately page the departing engineer back",outcome:{kind:"addCurse"}}]},{id:"forgotten_cron",title:"Forgotten Cron",text:"A cron job running every 60 seconds has been consuming 40% of database CPU for six months. Nobody noticed because it never threw an error.",choices:[{text:"Disable it and see what breaks",outcome:{kind:"loseMaxBudget",amount:5}},{text:"Optimize it properly",outcome:{kind:"gainCard",rarity:"uncommon"}}]},{id:"old_status_page",title:"Old Status Page",text:"Your status page reads 'All Systems Operational.' It last updated 47 days ago. Customers are reporting a five-hundred-second outage.",choices:[{text:"Update the status page first",outcome:{kind:"gainCredits",amount:30}},{text:"Fix the outage first",outcome:{kind:"nothing"}}]},{id:"refactor_time",title:"Refactor Time",text:"A 6,000-line service file. No tests. One author, who left eight months ago. It's the only thing standing between you and the boss.",choices:[{text:"Add tests before touching anything",outcome:{kind:"gainCard",rarity:"rare"}},{text:"Comment out the suspicious lines and ship it",outcome:{kind:"addCurse"}},{text:"Leave it alone",outcome:{kind:"nothing"}}]}],be=Object.values(P).filter(e=>e.type!=="curse"&&e.cost>=0&&!["manual_fix","failover","page_senior_engineer"].includes(e.id)),He={canary_deploy:"common",circuit_breaker:"common",rollback:"common",load_balancer:"common",monitoring_alert:"common",feature_flag:"common",health_check:"common",graceful_degradation:"common",rate_limiter:"common",on_fire:"common",blue_green_deploy:"common",on_call_swap:"common",chaos_engineering:"uncommon",auto_scaling:"uncommon",zero_downtime_deploy:"uncommon",sli_dashboard:"uncommon",runbook:"uncommon",chaos_monkey:"uncommon",error_budget_calc:"uncommon",load_shedding:"uncommon",toil_reduction:"uncommon",dependency_audit:"uncommon",capacity_planning:"uncommon",retry_with_backoff:"uncommon",postmortem_template:"uncommon",incident_playbook:"uncommon",service_mesh:"uncommon",slo_tightening:"rare",observability_pipeline:"rare",page_the_ceo:"rare",postmortem:"rare",war_room:"rare"};function Ue(e){return He[e]??"common"}function J(e,r=3,t){let i=e;const n=[],o=new Set;for(let d=0;d<r;d++){let m;if(t)m=t;else{const[w,A]=B(i);i=A,w<.6?m="common":w<.9?m="uncommon":m="rare"}let h=be.filter(w=>Ue(w.id)===m&&!o.has(w.id));if(h.length===0&&(h=be.filter(w=>!o.has(w.id))),h.length===0)break;const[f,S]=B(i);i=S;const R=h[Math.floor(f*h.length)];o.add(R.id),n.push(V(R.id))}return[n,i]}const ve=50,xe=75,je=25,U={pager:{id:"pager",name:"Pager",product:"On-Call",description:"At start of your turn, if SLO Budget ≤ 30%, draw 1 extra card.",flavor:"It never rings at a convenient time.",onTurnStart:e=>e.player.budget<=Math.floor(e.player.maxBudget*.3)?N(e,1):e},apm_tracing:{id:"apm_tracing",name:"APM Tracing",product:"Datadog APM",description:"At start of combat, gain Observability 2.",flavor:"Every span tells a story.",onCombatStart:e=>D(e,"player","observability",2)},live_tail:{id:"live_tail",name:"Live Tail",product:"Datadog Live Tail",description:"At start of combat, draw 1 extra card.",flavor:"Real-time insight. No waiting.",onCombatStart:e=>N(e,1)},watchdog:{id:"watchdog",name:"Watchdog",product:"Datadog Watchdog",description:"At start of combat, apply Customer-Facing 1 to the highest-stability enemy.",flavor:"It finds the anomaly before you do.",onCombatStart:e=>{if(!e.combat||e.combat.enemies.length===0)return e;const r=e.combat.enemies.reduce((t,i)=>t.stability>=i.stability?t:i);return D(e,r.instanceId,"customer_facing",1)}},synthetic_tests:{id:"synthetic_tests",name:"Synthetic Tests",product:"Datadog Synthetic Monitoring",description:"At start of your turn, gain 1 Headroom.",flavor:"Continuous verification. Always on.",onTurnStart:e=>q(e,1)},error_tracking:{id:"error_tracking",name:"Error Tracking",product:"Datadog Error Tracking",description:"At start of combat, apply Customer-Facing 1 to all enemies.",flavor:"Group. Deduplicate. Prioritize.",onCombatStart:e=>{if(!e.combat)return e;let r=e;for(const t of r.combat.enemies)r=D(r,t.instanceId,"customer_facing",1);return r}},dashboards:{id:"dashboards",name:"Dashboards",product:"Datadog Dashboards",description:"At start of each turn, gain 1 Headroom.",flavor:"The graph goes up. You also go up.",onTurnStart:e=>q(e,1)},service_catalog:{id:"service_catalog",name:"Service Catalog",product:"Datadog Service Catalog",description:"At start of combat, gain Observability 1.",flavor:"Know your dependencies. Own your services.",onCombatStart:e=>D(e,"player","observability",1)},incident_management:{id:"incident_management",name:"Incident Management",product:"Datadog Incident Management",description:"At start of combat, gain Confidence 1.",flavor:"Declared. Triaged. Resolved.",onCombatStart:e=>D(e,"player","confidence",1)},workflow_automation:{id:"workflow_automation",name:"Workflow Automation",product:"Datadog Workflow Automation",description:"At start of combat, gain 6 Headroom.",flavor:"Automate the response before the alert fires.",onCombatStart:e=>q(e,6)},notebooks:{id:"notebooks",name:"Notebooks",product:"Datadog Notebooks",description:"At start of combat, draw 1 extra card.",flavor:"Collaborative investigation, documented.",onCombatStart:e=>N(e,1)},cloud_cost_mgmt:{id:"cloud_cost_mgmt",name:"Cloud Cost Mgmt",product:"Datadog Cloud Cost Management",description:"At start of each turn, gain 5 Credits.",flavor:"Tag your resources. Save your money.",onTurnStart:e=>({...e,credits:e.credits+5})},rum:{id:"rum",name:"RUM",product:"Datadog Real User Monitoring",description:"At start of each turn, if hand size < 3, draw 1 card.",flavor:"See what real users actually experience.",onTurnStart:e=>e.player.hand.length<3?N(e,1):e},sensitive_data_scanner:{id:"sensitive_data_scanner",name:"Sensitive Data Scanner",product:"Datadog SDS",description:"At start of combat, remove the first curse from your deck (if any).",flavor:"Find the secrets. Remove the secrets.",onCombatStart:e=>{const r=e.deck.findIndex(t=>t.type==="curse");return r===-1?e:{...e,deck:[...e.deck.slice(0,r),...e.deck.slice(r+1)]}}},continuous_profiler:{id:"continuous_profiler",name:"Continuous Profiler",product:"Datadog Continuous Profiler",description:"At start of combat, gain Pressure 1.",flavor:"Always-on performance visibility.",onCombatStart:e=>D(e,"player","pressure",1)}},ne=Object.keys(U).filter(e=>e!=="pager");function ie(e){const r=ne.filter(n=>!e.player.relics.includes(n));if(r.length===0){const[n,o]=B(e);return[ne[Math.floor(n*ne.length)],o]}const[t,i]=B(e);return[r[Math.floor(t*r.length)],i]}function qe(e,r){var t,i,n,o,d,m,h,f,S,R,w,A,b,v,T;switch(r.type){case"START_RUN":{const l=Oe();let u={...se(e.meta.seed),deck:l};const[s,g]=Q(l,u);u={...g,player:{...g.player,draw:s}};const{nodes:a,state:y}=oe(1,u);return u={...y,map:{act:1,nodes:a,currentNodeId:null,visitedNodeIds:[]}},{...u,scene:"map"}}case"RETURN_TO_TITLE":return se(e.meta.seed);case"PLAY_CARD":{const{cardInstanceId:l,targetId:u}=r,s=e.player.hand.find(p=>p.instanceId===l);if(!s)return e;const g=P[s.defId];if(!g||s.type==="curse"||s.cost<0||s.cost>0&&e.player.energy<s.cost)return e;const a=s.type==="power",y=g.exhaust===!0;let c={...e,player:{...e.player,energy:e.player.energy-Math.max(0,s.cost),hand:e.player.hand.filter(p=>p.instanceId!==l),discard:a||y?e.player.discard:[...e.player.discard,s],exhaust:y?[...e.player.exhaust,s]:e.player.exhaust},combat:a&&e.combat?{...e.combat,activePowers:[...e.combat.activePowers,s]}:e.combat};const C=s.upgraded&&g.upgradedEffects?g.upgradedEffects:g.effects;for(const p of C)if(p.kind==="burn"){const x=u??((i=(t=c.combat)==null?void 0:t.enemies[0])==null?void 0:i.instanceId);if(x){const E=(n=c.combat)==null?void 0:n.enemies.find(I=>I.instanceId===x),M=re(p.amount,c.player.statuses,(E==null?void 0:E.statuses)??{});c.player.statuses.confidence&&(c=X(c,"player","confidence")),c=ge(c,x,M)}}else if(p.kind==="selfBurn")c={...c,player:{...c.player,budget:c.player.budget-p.amount}};else if(p.kind==="headroom"){const x=ae(p.amount,c.player.statuses);c=q(c,x)}else if(p.kind==="draw")c=N(c,p.amount);else if(p.kind==="removeStatus"){const x=p.target==="self"?"player":u??((d=(o=c.combat)==null?void 0:o.enemies[0])==null?void 0:d.instanceId)??"player";c=X(c,x,p.status)}else if(p.kind==="restoreBudget")c={...c,player:{...c.player,budget:Math.min(c.player.maxBudget,c.player.budget+p.amount)}};else if(p.kind==="applyStatus")if(p.target==="self")c=D(c,"player",p.status,p.stacks);else if(p.target==="all")for(const x of((m=c.combat)==null?void 0:m.enemies)??[])c=D(c,x.instanceId,p.status,p.stacks);else{const x=u??((f=(h=c.combat)==null?void 0:h.enemies[0])==null?void 0:f.instanceId);x&&(c=D(c,x,p.status,p.stacks))}if(c.combat&&c.combat.enemies.every(p=>p.stability<=0)){const p=c.map.nodes.flat().find(I=>I.id===c.map.currentNodeId);if((p==null?void 0:p.type)==="boss"){if(c.map.act===1){const{nodes:I,state:L}=oe(2,c);return{...L,scene:"map",combat:void 0,map:{act:2,nodes:I,currentNodeId:null,visitedNodeIds:[]}}}return{...c,scene:"won",combat:void 0}}if((p==null?void 0:p.type)==="elite"){const[I,L]=ie(c);return{...L,scene:"reward",combat:void 0,rewardRelic:I,rewardCards:void 0,credits:c.credits+xe}}const[E,M]=J(c);return{...M,scene:"reward",combat:void 0,rewardCards:E,credits:c.credits+ve}}return c.player.budget<=0?{...c,scene:"lost",combat:void 0}:c}case"END_TURN":{if(!e.combat)return e;const{enemies:l,intentByEnemy:u,turn:s,activePowers:g}=e.combat;let a=e;for(const k of a.player.hand){if(k.type!=="curse")continue;const _=P[k.defId];for(const H of(_==null?void 0:_.curseEffect)??[])H.kind==="selfBurn"&&(a={...a,player:{...a.player,budget:a.player.budget-H.amount}})}a={...a,player:{...a.player,discard:[...a.player.discard,...a.player.hand],hand:[]}};const y=new Set(Object.keys(a.player.statuses)),c=new Map(l.map(k=>[k.instanceId,new Set(Object.keys(k.statuses))])),C=a.player.statuses.flow??0,p=a.player.statuses.toil??0;for(const k of l){const _=u[k.instanceId];if(_)if(_.kind==="burn"){const H=re(_.amount,k.statuses,a.player.statuses),$=Math.min(a.player.headroom,H),j=H-$;a={...a,player:{...a.player,headroom:0,budget:a.player.budget-j}}}else _.kind==="buff"?a=D(a,k.instanceId,_.status,_.stacks):_.kind==="debuff"&&(a=D(a,"player",_.status,_.stacks))}if(a={...a,player:{...a.player,headroom:0}},a.player.budget<=0)return{...a,scene:"lost",combat:void 0};const x=a.player.statuses.on_call_fatigue??0;if(x>0&&(a={...a,player:{...a.player,budget:a.player.budget-x*2}},a.player.budget<=0))return{...a,scene:"lost",combat:void 0};a={...a,player:{...a.player,statuses:he(a.player.statuses,y)},combat:{...a.combat,enemies:a.combat.enemies.map(k=>({...k,statuses:he(k.statuses,c.get(k.instanceId))}))}};const E=s+1,M={};for(const k of l)M[k.instanceId]=te(k.defId,E-1);const I=Math.max(0,a.player.energyPerTurn+C-p);a={...a,player:{...a.player,energy:I},combat:{...a.combat,turn:E,phase:"player",intentByEnemy:M}};for(const k of g){const _=P[k.defId],H=k.upgraded&&(_!=null&&_.upgradedPowerTrigger)?_.upgradedPowerTrigger:(_==null?void 0:_.powerTrigger)??[];for(const $ of H)if($.kind==="headroom")a=q(a,ae($.amount,a.player.statuses));else if($.kind==="draw")a=N(a,$.amount);else if($.kind==="applyStatus")if($.target==="self")a=D(a,"player",$.status,$.stacks);else if($.target==="all")for(const j of((S=a.combat)==null?void 0:S.enemies)??[])a=D(a,j.instanceId,$.status,$.stacks);else{const j=(w=(R=a.combat)==null?void 0:R.enemies[0])==null?void 0:w.instanceId;j&&(a=D(a,j,$.status,$.stacks))}}for(const k of a.player.relics){const _=U[k];_!=null&&_.onTurnStart&&(a=_.onTurnStart(a))}const L=!!a.player.statuses.burnout;return L&&(a=X(a,"player","burnout")),a=N(a,Math.max(0,5-(L?1:0))),a}case"USE_HOTFIX":{const{hotfixId:l,targetId:u}=r;if(!e.player.hotfixes.includes(l))return e;const s=Se[l];if(!s)return e;const g=e.player.hotfixes.indexOf(l);let a={...e,player:{...e.player,hotfixes:[...e.player.hotfixes.slice(0,g),...e.player.hotfixes.slice(g+1)]}};for(const y of s.effects)if(y.kind==="burn"){const c=u??((b=(A=a.combat)==null?void 0:A.enemies[0])==null?void 0:b.instanceId);if(c){const C=(v=a.combat)==null?void 0:v.enemies.find(x=>x.instanceId===c),p=re(y.amount,a.player.statuses,(C==null?void 0:C.statuses)??{});a.player.statuses.confidence&&(a=X(a,"player","confidence")),a=ge(a,c,p)}}else y.kind==="headroom"&&(a=q(a,ae(y.amount,a.player.statuses)));if(a.combat&&a.combat.enemies.every(y=>y.stability<=0)){const y=a.map.nodes.flat().find(x=>x.id===a.map.currentNodeId);if((y==null?void 0:y.type)==="boss"){if(a.map.act===1){const{nodes:x,state:E}=oe(2,a);return{...E,scene:"map",combat:void 0,map:{act:2,nodes:x,currentNodeId:null,visitedNodeIds:[]}}}return{...a,scene:"won",combat:void 0}}if((y==null?void 0:y.type)==="elite"){const[x,E]=ie(a);return{...E,scene:"reward",combat:void 0,rewardRelic:x,rewardCards:void 0,credits:a.credits+xe}}const[C,p]=J(a);return{...p,scene:"reward",combat:void 0,rewardCards:C,credits:a.credits+ve}}return a.player.budget<=0?{...a,scene:"lost",combat:void 0}:a}case"NAVIGATE":{const{nodeId:l}=r,u=e.map.nodes.flat().find(g=>g.id===l);if(!u)return e;let s={...e,map:{...e.map,currentNodeId:l,visitedNodeIds:[...e.map.visitedNodeIds,l]}};switch(u.type){case"combat":case"elite":{const[g,a]=B(s);s=a;const y=ue(u.type==="elite"?"elite":"combat",l,s.map.act,g),c=fe(y),C=te(c.defId,0),[p,x]=Q(s.deck,s);s=x;let E={...s,player:{...s.player,energy:s.player.energyPerTurn,headroom:0,hand:[],draw:p,discard:[],statuses:{}}};E=N(E,5);let I={...E,scene:"combat",combat:{enemies:[c],intentByEnemy:{[c.instanceId]:C},activePowers:[],turn:1,phase:"player"}};for(const L of E.player.relics){const k=U[L];k!=null&&k.onCombatStart&&(I=k.onCombatStart(I))}return I}case"boss":{const g=ue("boss",l,s.map.act,.5),a=fe(g),y=te(a.defId,0),[c,C]=Q(s.deck,s);s=C;let p={...s,player:{...s.player,energy:s.player.energyPerTurn,headroom:0,hand:[],draw:c,discard:[],statuses:{}}};p=N(p,5);let E={...p,scene:"combat",combat:{enemies:[a],intentByEnemy:{[a.instanceId]:y},activePowers:[],turn:1,phase:"player"}};for(const M of p.player.relics){const I=U[M];I!=null&&I.onCombatStart&&(E=I.onCombatStart(E))}return E}case"rest":return{...s,scene:"rest"};case"shop":{const[g,a]=J(s,3);return s=a,{...s,scene:"shop",shopCards:g}}case"event":{const[g,a]=B(s);s=a;const y=F[Math.floor(g*F.length)];return{...s,scene:"event",currentEventId:y.id}}case"treasure":{const[g,a]=ie(s);return s=a,{...s,scene:"reward",rewardRelic:g,rewardCards:void 0,credits:s.credits+je}}default:return{...s,scene:"map"}}}case"PICK_REWARD_CARD":{const{cardInstanceId:l}=r;if(!l)return{...e,scene:"map",rewardCards:void 0};const u=(e.rewardCards??[]).find(s=>s.instanceId===l);return u?{...e,scene:"map",deck:[...e.deck,u],rewardCards:void 0}:e}case"CHOOSE_REST_OPTION":{if(r.option==="refresh"){const s=Math.min(e.player.maxBudget,e.player.budget+Math.floor(e.player.maxBudget*.2));return{...e,scene:"map",player:{...e.player,budget:s}}}const l=e.deck.findIndex(s=>!s.upgraded);if(l===-1)return{...e,scene:"map"};const u=e.deck.map((s,g)=>g===l?{...s,upgraded:!0,name:s.name+"+"}:s);return{...e,scene:"map",deck:u}}case"EVENT_CHOICE":{const l=F.find(y=>y.id===e.currentEventId);if(!l)return{...e,scene:"map",currentEventId:void 0};const u=l.choices[r.choiceIndex];if(!u)return{...e,scene:"map",currentEventId:void 0};let s={...e};const{outcome:g}=u;let a="";if(g.kind==="gainCredits")s={...s,credits:s.credits+g.amount},a=`+${g.amount} credits.`;else if(g.kind==="loseCredits")s={...s,credits:Math.max(0,s.credits-g.amount)},a=`-${g.amount} credits.`;else if(g.kind==="loseMaxBudget"){const y=s.player.maxBudget-g.amount;s={...s,player:{...s.player,maxBudget:y,budget:Math.min(s.player.budget,y)}},a=`Maximum SLO Budget reduced by ${g.amount}. You can feel it.`}else if(g.kind==="addCurse")s={...s,deck:[...s.deck,V("tech_debt")]},a="A Tech Debt curse was added to your deck. It will haunt you.";else if(g.kind==="gainCard"){const[y,c]=J(s,1,g.rarity);s={...c,deck:[...c.deck,...y]},a=`${((T=y[0])==null?void 0:T.name)??"a card"} was added to your deck.`}else a="Nothing changes. You move on.";return{...s,scene:"event_outcome",eventOutcomeText:a}}case"GO_TO_MAP":return{...e,scene:"map",eventOutcomeText:void 0,currentEventId:void 0};case"LOAD_RUN":return r.state;case"REMOVE_CARD":{if(e.credits<75)return e;const l=e.deck.findIndex(u=>u.instanceId===r.cardInstanceId);return l===-1?e:{...e,credits:e.credits-75,deck:[...e.deck.slice(0,l),...e.deck.slice(l+1)]}}case"BUY_CARD":{const l=(e.shopCards??[]).find(s=>s.instanceId===r.cardInstanceId);if(!l)return e;const u=90;return e.credits<u?e:{...e,credits:e.credits-u,deck:[...e.deck,l],shopCards:(e.shopCards??[]).filter(s=>s.instanceId!==r.cardInstanceId)}}case"PICK_REWARD_RELIC":{const l=e.rewardRelic;return l?{...e,scene:"map",player:{...e.player,relics:[...e.player.relics,l]},rewardRelic:void 0}:{...e,scene:"map"}}case"GO_TO_CODEX":return{...e,scene:"codex",codexReturnScene:r.returnScene};case"CLOSE_CODEX":return{...e,scene:e.codexReturnScene??"map",codexReturnScene:void 0};case"SHOW_UPGRADE_PICKER":return e.deck.some(u=>!u.upgraded&&u.type!=="curse")?{...e,scene:"upgrading"}:{...e,scene:"map"};case"CHOOSE_CARD_TO_UPGRADE":{const l=e.deck.findIndex(g=>g.instanceId===r.cardInstanceId);if(l===-1)return e;const u=e.deck[l],s={...u,upgraded:!0,name:u.name.replace(/\+$/,"")+"+"};return{...e,scene:"map",deck:[...e.deck.slice(0,l),s,...e.deck.slice(l+1)]}}default:return e}}const le="slothespire:run";function Fe(e){try{localStorage.setItem(le,JSON.stringify(e))}catch{console.warn("[slothespire] could not save run")}}function ce(){const e=localStorage.getItem(le);if(!e)return null;try{const r=JSON.parse(e);return Ge(r)?r:(de(),null)}catch{return de(),null}}const We=1;function Ge(e){if(typeof e!="object"||e===null)return!1;const r=e;return typeof r.scene=="string"&&typeof r.meta=="object"&&r.meta!==null&&typeof r.meta.seed=="string"&&r.version===We}function de(){localStorage.removeItem(le)}function Ye(e,r){const t=ce()!==null,i=document.createElement("div");i.className="scene-title",i.innerHTML=`
    <style>
      .scene-title {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        text-align: center; gap: 24px;
      }
      .scene-title h1 {
        font-size: 64px; color: var(--color-accent);
        text-shadow: var(--glow-accent);
        margin: 0; letter-spacing: 4px;
      }
      .scene-title .subtitle {
        color: var(--color-text-dim);
        font-family: var(--font-display);
        letter-spacing: 2px; font-size: 14px;
      }
      .scene-title .menu {
        display: flex; flex-direction: column; gap: 12px;
        margin-top: 24px; min-width: 220px;
      }
      .scene-title .stamp {
        position: fixed; bottom: 8px; right: 12px;
        font-family: var(--font-display); font-size: 10px;
        color: var(--color-text-dim);
      }
    </style>
    <h1>SLOTHESPIRE</h1>
    <div class="subtitle">// SLO the Spire</div>
    <div class="menu">
      <button class="primary" data-action="new-run">NEW RUN</button>
      ${t?'<button data-action="continue">CONTINUE</button>':'<button data-action="continue" disabled title="No saved run">CONTINUE</button>'}
      <button data-action="codex">CODEX</button>
      <button data-action="settings" disabled title="Coming in M9">SETTINGS</button>
    </div>
    <div class="stamp">v1.0.0</div>
  `,i.querySelector('[data-action="new-run"]').addEventListener("click",()=>r({type:"START_RUN"})),i.querySelector('[data-action="codex"]').addEventListener("click",()=>r({type:"GO_TO_CODEX",returnScene:"title"}));const n=i.querySelector('[data-action="continue"]');return n&&!n.disabled&&n.addEventListener("click",()=>{const o=ce();o&&r({type:"LOAD_RUN",state:o})}),i}function Ke(e){if(!e)return{icon:"?",text:"Unknown",colorClass:"intent-unknown"};switch(e.kind){case"burn":return{icon:"⚔",text:String(e.amount),colorClass:"intent-burn"};case"harden":return{icon:"🛡",text:String(e.amount),colorClass:"intent-harden"};case"buff":return{icon:"⬆",text:e.status,colorClass:"intent-buff"};case"debuff":return{icon:"⬇",text:e.status,colorClass:"intent-debuff"};case"multi":return{icon:"✦",text:e.label,colorClass:"intent-multi"};case"unknown":return{icon:"?",text:"...",colorClass:"intent-unknown"}}}function Ve(e){switch(e){case"attack":return{icon:"⚔",colorClass:"icon-burn"};case"skill":return{icon:"🛡",colorClass:"icon-harden"};case"power":return{icon:"✦",colorClass:"icon-multi"};case"curse":return{icon:"☠",colorClass:"icon-danger"};case"status":return{icon:"⚡",colorClass:"icon-buff"}}}function Xe(e,r,t){const i=P[e.defId],{icon:n,colorClass:o}=Ve(e.type),d=(i==null?void 0:i.effects.map(h=>h.kind==="burn"?`Burn ${h.amount}`:h.kind==="headroom"?`+${h.amount} Headroom`:h.kind==="draw"?`Draw ${h.amount}`:"").join(". "))??"",m=document.createElement("div");return m.className="sc-card",m.innerHTML=`
    <div class="sc-card-cost">${e.cost}</div>
    <div class="sc-card-name">${e.name}</div>
    <div class="sc-card-art ${o}">${n}</div>
    <div class="sc-card-text">${d}</div>
  `,m.addEventListener("click",()=>r({type:"PLAY_CARD",cardInstanceId:e.instanceId,targetId:t})),m}function Je(e,r){var y;const t=document.createElement("div");if(t.className="scene-combat",!e.combat)return t.textContent="No combat in progress.",t;const{enemies:i,intentByEnemy:n,turn:o}=e.combat,d=i[0],m=(d==null?void 0:d.instanceId)??null,{hand:h,draw:f,discard:S,exhaust:R,budget:w,maxBudget:A,energy:b,energyPerTurn:v,headroom:T}=e.player,l=i.map(c=>{const C=n[c.instanceId],{icon:p,text:x,colorClass:E}=Ke(C),M=Math.round(c.stability/c.maxStability*100),I=Object.entries(c.statuses).filter(([,L])=>(L??0)>0).map(([L,k])=>`<span class="sc-status-pill">${L.replace(/_/g," ")} ${k}</span>`).join("");return`
      <div class="sc-enemy">
        <div class="sc-intent ${E}">${p} ${x}</div>
        <div class="sc-sprite">▲</div>
        <div class="sc-enemy-name">${c.name}</div>
        <div class="sc-stab-bar"><div class="sc-stab-fill" style="width:${M}%"></div></div>
        <div class="sc-enemy-hp">${c.stability} / ${c.maxStability}</div>
        <div class="sc-status-pills">${I}</div>
      </div>
    `}).join(""),u=Object.entries(e.player.statuses).filter(([,c])=>(c??0)>0).map(([c,C])=>`<span class="sc-status-pill sc-status-player">${c.replace(/_/g," ")} ${C}</span>`).join(""),s=e.combat.activePowers.length>0?e.combat.activePowers.map(c=>`<span class="sc-power-pill">${c.name}</span>`).join(" "):"<span style='opacity:0.3;font-size:10px'>no active powers</span>",g=[0,1,2].map(c=>{const C=e.player.hotfixes[c],p=C?Se[C]:null;return p?`<button class="sc-hotfix-btn" data-hotfix="${C}">${p.name.replace(" Hotfix","")}</button>`:'<div class="sc-hotfix-empty">HOTFIX<br>—</div>'}).join("");t.innerHTML=`
    <style>
      .scene-combat {
        flex: 1; display: grid;
        grid-template-columns: 80px 1fr 130px;
        grid-template-rows: 28px 1fr auto auto 36px;
        grid-template-areas:
          "topbar topbar topbar"
          "piles enemies stats"
          "piles play stats"
          "piles hand action"
          "foot foot foot";
        gap: 4px; height: 100vh;
      }
      .sc-topbar {
        grid-area: topbar; background: var(--color-base-deep);
        border-bottom: 1px solid var(--color-accent);
        font-family: var(--font-display); font-size: 11px;
        color: var(--color-accent); opacity: 0.7;
        display: flex; align-items: center; padding: 0 12px; gap: 16px;
      }
      .sc-topbar .turn { margin-left: auto; }
      .sc-piles {
        grid-area: piles; background: var(--color-base-deep);
        border-right: 1px solid var(--color-border-low);
        display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px;
      }
      .sc-pile {
        width: 60px; padding: 4px 2px; text-align: center;
        border: 1px solid var(--color-border-low); border-radius: 3px;
        font-size: 9px; font-family: var(--font-display);
      }
      .sc-pile .sc-pile-n { color: var(--color-accent); font-size: 13px; }
      .sc-enemies {
        grid-area: enemies; display: flex; gap: 16px;
        justify-content: center; align-items: flex-end; padding-bottom: 12px;
      }
      .sc-enemy { text-align: center; width: 130px; }
      .sc-intent {
        display: inline-block; font-family: var(--font-display);
        font-size: 14px; padding: 4px 8px; margin-bottom: 4px;
      }
      .intent-burn   { color: var(--color-danger); text-shadow: var(--glow-danger); }
      .intent-harden { color: var(--color-accent); text-shadow: var(--glow-accent); }
      .intent-buff   { color: var(--color-energy); }
      .intent-debuff { color: var(--color-pop); text-shadow: var(--glow-pop); }
      .intent-multi  { color: #c1f4e8; }
      .intent-unknown{ color: var(--color-text-dim); }
      .sc-sprite {
        width: 80px; height: 80px; margin: 0 auto;
        background: var(--color-border-low); border: 1px solid var(--color-pop);
        box-shadow: var(--glow-pop); border-radius: 4px;
        display: flex; align-items: center; justify-content: center;
        font-size: 36px; color: var(--color-pop);
      }
      .sc-enemy-name { font-family: var(--font-display); font-size: 10px; color: var(--color-pop); margin-top: 4px; }
      .sc-stab-bar { height: 5px; background: var(--color-border-low); border-radius: 3px; margin: 3px 8px; overflow: hidden; }
      .sc-stab-fill { height: 100%; background: linear-gradient(90deg, var(--color-danger), var(--color-pop)); }
      .sc-enemy-hp { font-size: 9px; color: var(--color-text-dim); font-family: var(--font-display); }
      .sc-play {
        grid-area: play; border-top: 1px dashed var(--color-border-low);
        border-bottom: 1px dashed var(--color-border-low);
        display: flex; align-items: center; justify-content: center;
        color: var(--color-border-low); font-size: 10px;
      }
      .sc-hand {
        grid-area: hand; display: flex; gap: 8px; justify-content: center;
        align-items: flex-end; padding: 8px 8px 8px 0;
      }
      .sc-card {
        width: 86px; height: 120px; background: var(--color-base);
        border: 1px solid var(--color-accent); border-radius: 6px;
        box-shadow: var(--glow-accent); padding: 6px;
        display: flex; flex-direction: column; align-items: center;
        cursor: pointer; position: relative; transition: transform 0.08s;
      }
      .sc-card:hover { transform: translateY(-6px); }
      .sc-card-cost {
        position: absolute; top: -8px; left: -8px;
        width: 22px; height: 22px; border-radius: 50%;
        background: var(--color-pop); color: white;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); font-size: 11px; box-shadow: var(--glow-pop);
      }
      .sc-card-name { font-family: var(--font-display); font-size: 8px; color: var(--color-accent); text-align: center; letter-spacing: 0.5px; margin-top: 4px; }
      .sc-card-art {
        flex: 1; width: 100%; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low);
        display: flex; align-items: center; justify-content: center;
        font-size: 26px; margin: 4px 0;
        filter: drop-shadow(0 0 4px currentColor);
      }
      .icon-burn    { color: var(--color-danger); }
      .icon-harden  { color: var(--color-accent); }
      .icon-multi   { color: #c1f4e8; }
      .icon-danger  { color: var(--color-danger); }
      .icon-buff    { color: var(--color-energy); }
      .sc-card-text { font-size: 7px; text-align: center; opacity: 0.85; line-height: 1.2; }
      .sc-stats {
        grid-area: stats; background: var(--color-base-deep);
        border-left: 1px solid var(--color-border-low);
        display: flex; flex-direction: column; gap: 8px; padding: 10px 8px;
      }
      .sc-budget-label { font-size: 9px; color: var(--color-danger); font-family: var(--font-display); letter-spacing: 1px; }
      .sc-budget-bar { height: 10px; background: var(--color-border-low); border-radius: 5px; overflow: hidden; }
      .sc-budget-fill { height: 100%; background: linear-gradient(90deg, var(--color-danger), var(--color-energy)); transition: width 0.2s; }
      .sc-budget-num { font-size: 12px; text-align: center; }
      .sc-headroom {
        background: var(--color-border-low); border: 1px solid var(--color-accent);
        padding: 5px; border-radius: 3px; text-align: center;
        font-size: 9px; font-family: var(--font-display); color: var(--color-accent);
      }
      .sc-action {
        grid-area: action; background: var(--color-base-deep);
        border-left: 1px solid var(--color-border-low);
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 10px; padding: 10px 8px;
      }
      .sc-energy-label { font-size: 9px; color: var(--color-energy); font-family: var(--font-display); }
      .sc-energy-orb {
        width: 52px; height: 52px; border-radius: 50%;
        background: radial-gradient(circle, var(--color-energy) 0%, var(--color-energy-deep) 100%);
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; color: var(--color-base-deep);
        box-shadow: 0 0 14px rgba(255,211,77,0.6);
        font-size: 20px; font-family: var(--font-display);
      }
      .sc-end-turn {
        width: 100%; background: var(--color-pop); color: white; border: 0;
        padding: 10px 4px; border-radius: 3px; font-weight: 700;
        cursor: pointer; box-shadow: var(--glow-pop);
        font-family: var(--font-display); font-size: 10px; letter-spacing: 1px;
      }
      .sc-foot {
        grid-area: foot; background: var(--color-base-deep);
        border-top: 1px solid var(--color-border-low);
        display: flex; align-items: center; gap: 12px; padding: 0 10px;
        font-size: 10px; font-family: var(--font-display); color: var(--color-accent);
      }
      .sc-foot .right { margin-left: auto; opacity: 0.5; }
      .sc-footer-btn { background: transparent; border: 0; color: var(--color-accent); font-family: var(--font-display); font-size: 10px; cursor: pointer; padding: 0; }
      .sc-status-pills { display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; margin-top: 2px; }
      .sc-status-pill { font-size: 8px; background: var(--color-border-low); padding: 1px 4px; border-radius: 3px; color: var(--color-text-dim); }
      .sc-status-player { color: var(--color-accent); }
      .sc-player-statuses { display: flex; flex-wrap: wrap; gap: 2px; margin-top: 4px; min-height: 16px; }
      .sc-power-zone { color: var(--color-energy); font-family: var(--font-display); font-size: 10px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; padding: 4px 8px; }
      .sc-power-pill { background: var(--color-border-low); border: 1px solid var(--color-energy); padding: 2px 6px; border-radius: 3px; font-size: 9px; }
      .sc-hotfix-btn { width: 60px; padding: 3px 2px; font-size: 8px; font-family: var(--font-display); background: var(--color-base-deep); color: var(--color-pop); border: 1px solid var(--color-pop); border-radius: 3px; cursor: pointer; letter-spacing: 0.5px; }
      .sc-hotfix-btn:hover { background: var(--color-pop); color: white; }
      .sc-hotfix-empty { width: 60px; padding: 3px 2px; text-align: center; border: 1px dashed var(--color-border-low); border-radius: 3px; font-size: 9px; color: var(--color-text-dim); }
    </style>

    <div class="sc-topbar">
      <span>// ACT I · Single-Service SLO · Floor 1</span>
      <span class="turn">TURN ${o}</span>
    </div>

    <div class="sc-piles">
      <div class="sc-pile">DRAW<div class="sc-pile-n">${f.length}</div></div>
      <div class="sc-pile">DISC<div class="sc-pile-n">${S.length}</div></div>
      <div class="sc-pile">EXHL<div class="sc-pile-n">${R.length}</div></div>
      ${g}
    </div>

    <div class="sc-enemies">${l}</div>

    <div class="sc-play"><div class="sc-power-zone">POWERS: ${s}</div></div>

    <div class="sc-hand" id="sc-hand-slot"></div>

    <div class="sc-stats">
      <div>
        <div class="sc-budget-label">SLO BUDGET</div>
        <div class="sc-budget-bar">
          <div class="sc-budget-fill" style="width:${Math.round(w/A*100)}%"></div>
        </div>
        <div class="sc-budget-num">${w} / ${A}</div>
      </div>
      <div class="sc-headroom">HEADROOM<br><b>${T}</b></div>
      <div class="sc-player-statuses">${u||"<span style='opacity:0.4;font-size:9px'>no statuses</span>"}</div>
    </div>

    <div class="sc-action">
      <div class="sc-energy-label">ENERGY</div>
      <div class="sc-energy-orb">${b}<span style="font-size:9px;opacity:0.7">/${v}</span></div>
      <button class="sc-end-turn" id="sc-end-turn">END TURN ▶</button>
    </div>

    <div class="sc-foot">
      <button class="sc-footer-btn" id="sc-codex-btn">📖 Codex</button>
      <span>⏸ Pause</span>
      <span class="right">seed: ${e.meta.seed}</span>
    </div>
  `;const a=t.querySelector("#sc-hand-slot");for(const c of h)a.appendChild(Xe(c,r,m));return t.querySelector("#sc-end-turn").addEventListener("click",()=>r({type:"END_TURN"})),(y=t.querySelector("#sc-codex-btn"))==null||y.addEventListener("click",()=>r({type:"GO_TO_CODEX",returnScene:"combat"})),t.querySelectorAll(".sc-hotfix-btn").forEach(c=>{c.addEventListener("click",()=>r({type:"USE_HOTFIX",hotfixId:c.dataset.hotfix,targetId:m}))}),t}function Ze(e,r){const t=document.createElement("div");t.className="scene-end";const i=e.scene==="won",n=i?"RUN COMPLETE":"BUDGET BREACHED",o=i?"You held the SLO. The sloths sleep easier tonight.":"Service degraded. Customers noticed. Postmortem next sprint.";return t.innerHTML=`
    <style>
      .scene-end {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 24px; text-align: center;
      }
      .scene-end h2 {
        font-size: 40px; letter-spacing: 4px;
        color: ${i?"var(--color-accent)":"var(--color-danger)"};
        text-shadow: ${i?"var(--glow-accent)":"var(--glow-danger)"};
        margin: 0;
      }
      .scene-end .flavor {
        max-width: 400px; opacity: 0.8;
        font-family: var(--font-display); font-size: 13px; line-height: 1.5;
      }
    </style>
    <h2>${n}</h2>
    <div class="flavor">${o}</div>
    <button class="primary" data-action="return-title">RETURN TO TITLE</button>
  `,t.querySelector('[data-action="return-title"]').addEventListener("click",()=>r({type:"RETURN_TO_TITLE"})),t}const Qe={combat:"⚔",elite:"☠",rest:"✝",shop:"⚙",event:"?",treasure:"🎁",boss:"👑"},ke={combat:"Combat",elite:"Elite",rest:"Postmortem",shop:"Build Server",event:"Incident",treasure:"Treasure",boss:"BOSS"};function et(e,r){var f;const t=document.createElement("div");t.className="scene-map";const{nodes:i,currentNodeId:n,visitedNodeIds:o,act:d}=e.map,m=new Set;if(!n)(f=i[0])==null||f.forEach(S=>m.add(S.id));else{const S=i.flat().find(R=>R.id===n);S==null||S.next.forEach(R=>m.add(R))}const h=[...i].reverse().map(S=>`<div class="map-row">${S.map(w=>{const A=o.includes(w.id),b=m.has(w.id),v=w.id===n;return`
        <div class="${["map-node",w.type,A?"visited":"",b?"reachable":"",v?"current":""].filter(Boolean).join(" ")}" data-node-id="${w.id}" title="${ke[w.type]}">
          <div class="node-icon">${Qe[w.type]}</div>
          <div class="node-label">${ke[w.type]}</div>
        </div>
      `}).join("")}</div>`).join("");return t.innerHTML=`
    <style>
      .scene-map { flex: 1; display: flex; flex-direction: column; padding: 24px; gap: 8px; }
      .map-header { font-family: var(--font-display); font-size: 12px;
        color: var(--color-accent); opacity: 0.7; margin-bottom: 8px; }
      .map-rows { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; }
      .map-row { display: flex; gap: 16px; justify-content: center; align-items: center; }
      .map-node {
        width: 80px; padding: 8px 4px; text-align: center;
        border: 1px solid var(--color-border-low); border-radius: 6px;
        background: var(--color-base-deep); opacity: 0.4;
        transition: opacity 0.15s, transform 0.1s;
      }
      .map-node.visited { opacity: 0.6; border-color: var(--color-text-dim); }
      .map-node.current { opacity: 0.8; border-color: var(--color-accent); box-shadow: var(--glow-accent); }
      .map-node.reachable { opacity: 1; cursor: pointer; border-color: var(--color-accent); }
      .map-node.reachable:hover { transform: scale(1.08); }
      .map-node.boss.reachable { border-color: var(--color-pop); box-shadow: var(--glow-pop); }
      .map-node.elite.reachable { border-color: var(--color-danger); box-shadow: var(--glow-danger); }
      .node-icon { font-size: 22px; }
      .node-label { font-family: var(--font-display); font-size: 8px;
        color: var(--color-text-dim); letter-spacing: 0.5px; margin-top: 2px; }
      .map-footer { display: flex; align-items: center; gap: 16px;
        font-family: var(--font-display); font-size: 11px; color: var(--color-text-dim); margin-top: 8px; }
      .map-footer .credits { color: var(--color-energy); }
    </style>
    <div class="map-header">// ACT ${d} · ${d===1?"Single-Service SLO":"User-Journey SLO"}</div>
    <div class="map-rows">${h}</div>
    <div class="map-footer">
      <span>SLO BUDGET <b>${e.player.budget}/${e.player.maxBudget}</b></span>
      <span>DECK <b>${e.deck.length}</b></span>
      <span class="credits">CREDITS <b>${e.credits}</b></span>
    </div>
  `,t.querySelectorAll(".map-node.reachable").forEach(S=>{S.addEventListener("click",()=>{r({type:"NAVIGATE",nodeId:S.dataset.nodeId})})}),t}function tt(e,r){const t=document.createElement("div");if(t.className="scene-reward",e.rewardRelic){const o=U[e.rewardRelic];return t.innerHTML=`
      <style>
        .scene-reward { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
        .relic-box { padding: 28px 40px; background: var(--color-base-deep); border: 1px solid var(--color-energy); border-radius: 8px; text-align: center; box-shadow: 0 0 20px rgba(255,211,77,0.3); max-width: 400px; }
        .relic-name { font-family: var(--font-display); font-size: 18px; color: var(--color-energy); margin-bottom: 4px; }
        .relic-product { font-size: 11px; color: var(--color-text-dim); font-family: var(--font-display); margin-bottom: 12px; }
        .relic-desc { font-size: 12px; line-height: 1.6; }
        .relic-flavor { font-size: 10px; font-style: italic; opacity: 0.5; margin-top: 10px; }
      </style>
      <h2 style="font-family:var(--font-display);color:var(--color-energy);letter-spacing:3px;font-size:24px;">RELIC FOUND</h2>
      <div class="relic-box">
        <div class="relic-name">${(o==null?void 0:o.name)??e.rewardRelic}</div>
        <div class="relic-product">${(o==null?void 0:o.product)??""}</div>
        <div class="relic-desc">${(o==null?void 0:o.description)??""}</div>
        <div class="relic-flavor">"${(o==null?void 0:o.flavor)??""}"</div>
      </div>
      <button id="accept-relic" class="primary" style="font-family:var(--font-display);font-size:13px;letter-spacing:1px;">ACCEPT RELIC</button>
    `,t.querySelector("#accept-relic").addEventListener("click",()=>r({type:"PICK_REWARD_RELIC"})),t}const n=(e.rewardCards??[]).map(o=>{const d=P[o.defId],m=(d==null?void 0:d.effects.map(f=>f.kind==="burn"?`Burn ${f.amount}`:f.kind==="headroom"?`+${f.amount} Headroom`:f.kind==="draw"?`Draw ${f.amount}`:f.kind==="selfBurn"?`Self-Burn ${f.amount}`:f.kind==="applyStatus"?`Apply ${f.status.replace(/_/g," ")} ×${f.stacks}`:f.kind==="restoreBudget"?`Restore ${f.amount} Budget`:"").filter(Boolean).join(". "))??"",h=o.type==="attack"?"⚔":o.type==="power"?"✦":"🛡";return`
      <div class="reward-card" data-card-id="${o.instanceId}">
        <div class="rc-cost">${o.cost<0?"!":o.cost}</div>
        <div class="rc-name">${o.name}</div>
        <div class="rc-art">${h}</div>
        <div class="rc-text">${m||(d==null?void 0:d.flavor)||""}</div>
      </div>
    `}).join("");return t.innerHTML=`
    <style>
      .scene-reward { flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 32px; }
      .scene-reward h2 { font-size: 28px; color: var(--color-accent); font-family: var(--font-display);
        letter-spacing: 3px; margin: 0; text-shadow: var(--glow-accent); }
      .reward-cards { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
      .reward-card {
        width: 130px; min-height: 180px; background: var(--color-base);
        border: 1px solid var(--color-accent); border-radius: 8px;
        box-shadow: var(--glow-accent); padding: 10px;
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        cursor: pointer; position: relative; transition: transform 0.1s;
      }
      .reward-card:hover { transform: translateY(-8px); }
      .rc-cost {
        position: absolute; top: -8px; left: -8px; width: 24px; height: 24px; border-radius: 50%;
        background: var(--color-pop); color: white;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); box-shadow: var(--glow-pop); font-size: 12px;
      }
      .rc-name { font-family: var(--font-display); font-size: 10px; color: var(--color-accent); text-align: center; }
      .rc-art { font-size: 32px; color: var(--color-danger); margin: 6px 0; }
      .rc-text { font-size: 9px; text-align: center; opacity: 0.85; line-height: 1.3; }
      .reward-skip { font-family: var(--font-display); font-size: 12px; letter-spacing: 1px; }
    </style>
    <h2>CHOOSE A CARD</h2>
    <div class="reward-cards">${n}</div>
    <button class="reward-skip" id="skip-reward">SKIP</button>
  `,t.querySelectorAll(".reward-card").forEach(o=>{o.addEventListener("click",()=>r({type:"PICK_REWARD_CARD",cardInstanceId:o.dataset.cardId}))}),t.querySelector("#skip-reward").addEventListener("click",()=>r({type:"PICK_REWARD_CARD",cardInstanceId:null})),t}function rt(e,r){const t=document.createElement("div");t.className="scene-rest";const i=Math.floor(e.player.maxBudget*.2),n=Math.min(e.player.maxBudget,e.player.budget+i)-e.player.budget,o=e.deck.find(d=>!d.upgraded);return t.innerHTML=`
    <style>
      .scene-rest { flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 32px; }
      .scene-rest h2 { font-size: 28px; color: var(--color-accent);
        font-family: var(--font-display); margin: 0; letter-spacing: 3px; }
      .rest-subtext { color: var(--color-text-dim); font-family: var(--font-display); font-size: 12px; }
      .rest-choices { display: flex; gap: 20px; }
      .rest-choice {
        width: 200px; padding: 20px; background: var(--color-base-deep);
        border: 1px solid var(--color-border-low); border-radius: 8px;
        text-align: center; cursor: pointer; transition: border-color 0.1s;
      }
      .rest-choice:not(.disabled):hover { border-color: var(--color-accent); }
      .rest-choice.disabled { opacity: 0.5; cursor: default; }
      .rest-choice h3 { font-family: var(--font-display); color: var(--color-accent);
        font-size: 14px; margin: 0 0 8px; }
      .rest-choice p { font-size: 11px; opacity: 0.8; margin: 0; }
    </style>
    <h2>POSTMORTEM</h2>
    <div class="rest-subtext">// What did we learn?</div>
    <div class="rest-choices">
      <div class="rest-choice" data-option="refresh">
        <h3>Window Refresh</h3>
        <p>Restore +${n} SLO Budget<br>(20% of max)</p>
      </div>
      <div class="rest-choice ${o?"":"disabled"}" data-option="upgrade">
        <h3>Upgrade</h3>
        <p>${o?`Upgrade: ${o.name}`:"Nothing upgradeable"}</p>
      </div>
    </div>
  `,t.querySelectorAll(".rest-choice:not(.disabled)").forEach(d=>{d.addEventListener("click",()=>{d.dataset.option==="upgrade"?r({type:"SHOW_UPGRADE_PICKER"}):r({type:"CHOOSE_REST_OPTION",option:"refresh"})})}),t}const Ee=`
  .scene-event { flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 24px; padding: 48px; }
  .event-card {
    max-width: 500px; background: var(--color-base-deep);
    border: 1px solid var(--color-border-low); border-radius: 8px; padding: 32px;
  }
  .event-title { font-family: var(--font-display); font-size: 18px;
    color: var(--color-pop); margin: 0 0 16px; letter-spacing: 1px; }
  .event-text { font-size: 13px; line-height: 1.7; opacity: 0.9; }
  .event-choices { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 500px; }
  .event-choice {
    text-align: left; padding: 12px 16px; background: var(--color-base-deep);
    border: 1px solid var(--color-border-low); border-radius: 4px;
    font-family: var(--font-display); font-size: 12px; cursor: pointer;
    color: var(--color-text); transition: border-color 0.1s;
  }
  .event-choice:hover { border-color: var(--color-accent); color: var(--color-accent); }
  .event-outcome-box {
    max-width: 500px; background: var(--color-base-deep);
    border: 1px solid var(--color-accent); border-radius: 8px; padding: 32px;
    text-align: center; box-shadow: var(--glow-accent);
  }
  .event-outcome-label {
    font-family: var(--font-display); font-size: 10px; letter-spacing: 2px;
    color: var(--color-text-dim); margin: 0 0 12px;
  }
  .event-outcome-text {
    font-size: 16px; line-height: 1.6; color: var(--color-text);
  }
  .event-outcome-continue {
    font-family: var(--font-display); font-size: 12px; letter-spacing: 1px;
  }
`;function at(e,r){const t=document.createElement("div");t.className="scene-event";const i=F.find(o=>o.id===e.currentEventId)??F[0],n=i.choices.map((o,d)=>`
    <button class="event-choice" data-idx="${d}">${o.text}</button>
  `).join("");return t.innerHTML=`
    <style>${Ee}</style>
    <div class="event-card">
      <div class="event-title">// ${i.title.toUpperCase()}</div>
      <div class="event-text">${i.text}</div>
    </div>
    <div class="event-choices">${n}</div>
  `,t.querySelectorAll(".event-choice").forEach(o=>{o.addEventListener("click",()=>r({type:"EVENT_CHOICE",choiceIndex:parseInt(o.dataset.idx)}))}),t}function ot(e,r){const t=document.createElement("div");t.className="scene-event";const i=F.find(o=>o.id===e.currentEventId),n=e.eventOutcomeText??"Nothing changes.";return t.innerHTML=`
    <style>${Ee}</style>
    ${i?`
    <div class="event-card" style="border-color:var(--color-border-low)">
      <div class="event-title">// ${i.title.toUpperCase()}</div>
      <div class="event-text">${i.text}</div>
    </div>`:""}
    <div class="event-outcome-box">
      <div class="event-outcome-label">// OUTCOME</div>
      <div class="event-outcome-text">${n}</div>
    </div>
    <button class="event-outcome-continue primary" id="continue-btn">CONTINUE →</button>
  `,t.querySelector("#continue-btn").addEventListener("click",()=>r({type:"GO_TO_MAP"})),t}function we(e,r,t,i){return`
    <div class="shop-row">
      <span class="sr-cost">${e.cost<0?"☠":e.cost}${e.upgraded?"+":""}</span>
      <span class="sr-name">${e.name}</span>
      <span class="sr-type">${e.type}</span>
      <button class="${r}" data-id="${e.instanceId}" ${i?"disabled":""}>${t}</button>
    </div>
  `}function nt(e,r){const t=document.createElement("div");t.className="scene-shop";const i=e.shopCards??[],n=90,o=75,d=i.length>0?i.map(h=>we(h,"buy-btn",`BUY (${n}¢)`,e.credits<n)).join(""):'<span class="shop-empty">No cards in stock</span>',m=e.deck.map(h=>we(h,"remove-btn",`Remove (${o}¢)`,e.credits<o)).join("");return t.innerHTML=`
    <style>
      .scene-shop { flex: 1; display: flex; flex-direction: column; padding: 24px; gap: 16px; overflow-y: auto; }
      .scene-shop h2 { font-family: var(--font-display); font-size: 22px; color: var(--color-accent); letter-spacing: 3px; margin: 0; }
      .shop-credits { font-family: var(--font-display); font-size: 14px; color: var(--color-energy); }
      .shop-section { font-family: var(--font-display); font-size: 10px; color: var(--color-text-dim); letter-spacing: 1px; border-bottom: 1px solid var(--color-border-low); padding-bottom: 4px; margin-top: 8px; }
      .shop-empty { font-size: 11px; opacity: 0.4; font-family: var(--font-display); }
      .shop-row { display: flex; align-items: center; gap: 8px; padding: 5px 8px; background: var(--color-base-deep); border: 1px solid var(--color-border-low); border-radius: 3px; font-family: var(--font-display); font-size: 11px; }
      .sr-cost { width: 20px; text-align: center; color: var(--color-pop); }
      .sr-name { flex: 1; color: var(--color-accent); }
      .sr-type { font-size: 9px; color: var(--color-text-dim); text-transform: uppercase; min-width: 50px; }
      .buy-btn, .remove-btn { padding: 3px 8px; border: 1px solid; background: transparent; font-family: var(--font-display); font-size: 9px; cursor: pointer; letter-spacing: 0.5px; }
      .buy-btn { border-color: var(--color-accent); color: var(--color-accent); }
      .buy-btn:hover:not([disabled]) { background: var(--color-accent); color: var(--color-base); }
      .remove-btn { border-color: var(--color-danger); color: var(--color-danger); }
      .remove-btn:hover:not([disabled]) { background: var(--color-danger); color: white; }
      button[disabled] { opacity: 0.35; cursor: default; pointer-events: none; }
      .shop-leave { font-family: var(--font-display); font-size: 11px; letter-spacing: 1px; margin-top: 8px; width: 130px; }
    </style>
    <h2>// BUILD SERVER</h2>
    <div class="shop-credits">CREDITS: ${e.credits}</div>
    <div class="shop-section">CARDS FOR SALE — ${n}¢ each</div>
    ${d}
    <div class="shop-section">YOUR DECK — Remove a Card (${o}¢)</div>
    ${m}
    <button class="shop-leave" id="leave-shop">LEAVE SHOP</button>
  `,t.querySelectorAll(".buy-btn:not([disabled])").forEach(h=>{h.addEventListener("click",()=>r({type:"BUY_CARD",cardInstanceId:h.dataset.id}))}),t.querySelectorAll(".remove-btn:not([disabled])").forEach(h=>{h.addEventListener("click",()=>r({type:"REMOVE_CARD",cardInstanceId:h.dataset.id}))}),t.querySelector("#leave-shop").addEventListener("click",()=>r({type:"GO_TO_MAP"})),t}const _e={manual_fix:{id:"manual_fix",kind:"card",name:"Manual Fix",description:"1 Energy · Attack · Burn 6 (Upgraded: 9)",realConcept:"A manual fix is the on-call engineer's first tool: directly intervening to stop the bleeding without addressing root cause. In SRE practice, manual fixes are tracked as toil — necessary but unsustainable. Every manual fix should generate a follow-up ticket: automate the detection, the response, or both. The goal is to make this card unnecessary by the end of the run.",docsLink:"https://sre.google/sre-book/eliminating-toil/"},circuit_breaker:{id:"circuit_breaker",kind:"card",name:"Circuit Breaker",description:"1 Energy · Skill · +8 Headroom (Upgraded: +12)",realConcept:"A circuit breaker pattern stops calls to a failing downstream dependency after a failure threshold is crossed, preventing cascading failures. When open, requests fail fast instead of waiting. After a timeout, it enters half-open state: one probe request decides whether to close (recover) or stay open. Named after the electrical safety device — it breaks the circuit before the system burns out.",docsLink:"https://martinfowler.com/bliki/CircuitBreaker.html"},canary_deploy:{id:"canary_deploy",kind:"card",name:"Canary Deploy",description:"1 Energy · Attack · Burn 5, Draw 1 (Upgraded: Burn 8)",realConcept:"Canary deployment routes a small percentage of traffic (1-5%) to a new version before a full rollout. Like miners sending canaries into coal mines to detect gas, canary deploys surface problems before they affect all users. Key metrics to watch: error rate, latency, and any SLO-relevant signals. If the canary dies, roll back immediately. If it survives, gradually shift more traffic.",docsLink:"https://docs.datadoghq.com/monitors/"},postmortem:{id:"postmortem",kind:"card",name:"Blameless Postmortem",description:"2 Energy · Skill · Exhaust · Restore 12 Budget",realConcept:"A blameless postmortem focuses on system failures rather than individual blame. The 5 Whys, timeline reconstruction, and action items are all about making the system more resilient — not finding who to punish. Google SRE formalized this: the goal is learning, not punishment. Postmortems should be shared widely; a failure only experienced by one team is a failure experienced by everyone eventually.",docsLink:"https://sre.google/sre-book/postmortem-culture/"},chaos_engineering:{id:"chaos_engineering",kind:"card",name:"Chaos Engineering",description:"2 Energy · Skill · Apply Customer-Facing 3 to all, Self-Burn 5",realConcept:"Chaos engineering deliberately injects failures into production systems to expose weaknesses before they cause unplanned outages. The principle: it's better to break things on purpose during business hours than to be surprised at 3am. Netflix's Chaos Monkey randomly terminates EC2 instances in production. The practice requires robust monitoring — you need to observe the failure, not just cause it.",docsLink:"https://principlesofchaos.org/"},failover:{id:"failover",kind:"card",name:"Failover",description:"1 Energy · Skill · +5 Headroom (Upgraded: +8)",realConcept:"Failover is the automatic or manual switching to a redundant system when the primary fails. Active-passive failover keeps a standby ready but idle; active-active runs parallel. The SRE question: how long does failover take, and is that acceptable to your SLO? Headroom in Slothespire represents the buffer you buy when you route around a failing component.",docsLink:"https://docs.datadoghq.com/reliability_engineering/"},rollback:{id:"rollback",kind:"card",name:"Rollback",description:"1 Energy · Attack · Burn 8 (Upgraded: 11)",realConcept:"A rollback reverts a deployment to a previous known-good version. It's one of the fastest ways to stop the bleeding during an incident caused by a bad deploy. Prerequisites: immutable artifacts, tested rollback procedures, and confidence that the previous version is actually safe. Rollbacks are not always possible (database migrations, in-flight transactions), which is why forward fixes sometimes matter more.",docsLink:"https://docs.datadoghq.com/continuous_delivery/"},graceful_degradation:{id:"graceful_degradation",kind:"card",name:"Graceful Degradation",description:"1 Energy · Skill · +9 Headroom (Upgraded: +12)",realConcept:"Graceful degradation means a system continues operating at reduced capacity when parts fail, rather than failing completely. A recommendation engine going down shouldn't take down the checkout flow. Techniques: fallback responses, feature flags to disable non-critical paths, circuit breakers on non-essential services. The key question: what's the minimum viable version of this service?"},pager:{id:"pager",kind:"relic",name:"Pager",description:"At start of your turn, if SLO Budget ≤ 30%, draw 1 extra card.",realConcept:"The on-call pager is the entry point for every incident. Effective paging means: actionable alerts (not informational noise), clear runbook links, and right-person routing. When budget (error budget) is low, the pager fires faster — you need more resources to respond. The Pager relic reflects this: low budget state triggers enhanced draw, simulating the surge of attention that a real pager generates.",docsLink:"https://sre.google/sre-book/being-on-call/"},apm_tracing:{id:"apm_tracing",kind:"relic",name:"APM Tracing",description:"At start of combat, gain Observability 2.",realConcept:"Application Performance Monitoring distributed tracing follows a request as it traverses multiple services, recording timing and metadata at each hop. With APM, you can pinpoint which service introduced latency or generated an error. Datadog APM uses auto-instrumentation to capture spans without code changes. The Observability status in Slothespire represents what APM gives you: visibility into what's coming before it hits.",docsLink:"https://docs.datadoghq.com/tracing/"},watchdog:{id:"watchdog",kind:"relic",name:"Watchdog",description:"At start of combat, apply Customer-Facing 1 to the highest-stability enemy.",realConcept:"Datadog Watchdog automatically detects anomalies in metrics, traces, and logs using ML algorithms — without you having to define alert thresholds. It surfaces unusual patterns: a sudden spike in error rate, unexpected latency increase, or abnormal resource utilization. In Slothespire, Watchdog targets the toughest enemy with Customer-Facing — making the most threatening problem exploitable by your next attack.",docsLink:"https://docs.datadoghq.com/watchdog/"},live_tail:{id:"live_tail",kind:"relic",name:"Live Tail",description:"At start of combat, draw 1 extra card.",realConcept:"Datadog Live Tail streams logs in real time as they are ingested, with no indexing delay. During an incident, Live Tail is often the first tool you reach for: it shows exactly what's happening right now, before you've had time to build a proper query. The extra card in Slothespire represents the immediate situational awareness Live Tail gives you at the start of a fight.",docsLink:"https://docs.datadoghq.com/logs/live_tail/"},flapping_health_check:{id:"flapping_health_check",kind:"enemy",name:"Flapping Health Check",description:"Stability 20 · Burns 6 and 4 alternating",realConcept:"A flapping health check oscillates between passing and failing without a clear root cause. Common causes: resource contention, network jitter, slow disk I/O, or an overly tight timeout. Flapping checks generate alert fatigue — the on-call learns to ignore them, which is dangerous. Fix: add hysteresis (require N failures before alerting), tune timeouts, and investigate the underlying cause.",docsLink:"https://docs.datadoghq.com/monitors/configuration/"},memory_leak:{id:"memory_leak",kind:"enemy",name:"Memory Leak",description:"Stability 36 · Stacks Pressure over time",realConcept:"A memory leak occurs when a program allocates memory but never frees it, causing memory usage to grow until the process crashes. In long-running services, even small leaks accumulate. Key signals: steadily rising heap usage, degrading GC performance, eventual OOM kills. Mitigation: profiling tools (Datadog Continuous Profiler shows heap allocation hotspots), memory limit caps, and scheduled restarts as a short-term workaround.",docsLink:"https://docs.datadoghq.com/profiler/"},the_pager_storm:{id:"the_pager_storm",kind:"enemy",name:"The Pager Storm",description:"Stability 75 · Burns hard, applies On-Call Fatigue, scales Pressure",realConcept:"Alert fatigue occurs when on-call engineers receive so many alerts that they stop treating each one with urgency. A pager storm — hundreds of alerts triggered by a single root cause — is one of the most dangerous failure modes. The correct response: triage, not reaction. Find the root cause; silence derivative alerts. The Pager Storm boss teaches this: brute-forcing through every alert in phase 1 leaves you depleted for phase 2.",docsLink:"https://docs.datadoghq.com/monitors/manage/"},zombie_process:{id:"zombie_process",kind:"enemy",name:"Zombie Process",description:"Stability 18 · Applies Toil debuff",realConcept:"A zombie process has finished execution but still has an entry in the process table because its parent hasn't read its exit status. In large numbers they waste PID space. More broadly, zombie processes are a metaphor for technical debt: the work is done, but the cleanup wasn't. They apply Toil in Slothespire because managing them costs energy without addressing any real problem."},cascading_failure:{id:"cascading_failure",kind:"enemy",name:"Cascading Failure",description:"Stability 55 (Elite) · Stacks Pressure each turn",realConcept:"A cascading failure starts small and amplifies: one service slows under load, its callers time out and retry, increasing load further, eventually bringing down the whole system. Prevention: circuit breakers, rate limiting, load shedding, bulkheads. In Slothespire, Cascading Failure stacks Pressure — representing how the pressure from each failure makes subsequent failures harder and harder to contain."},cron_storm:{id:"cron_storm",kind:"enemy",name:"Cron Storm",description:"Stability 24 · Triple burn pattern",realConcept:"A cron storm occurs when many cron jobs are scheduled to run at the same time (midnight, top of the hour), creating synchronized load spikes. The fix: stagger job start times, add jitter, and monitor for resource contention. Cron Storm in Slothespire attacks in rapid bursts — three hits in a pattern — reflecting how synchronized load creates sudden, overlapping pressure rather than steady predictable load."},deadlock:{id:"deadlock",kind:"enemy",name:"Deadlock",description:"Stability 30 · Applies Toil 2 then burns hard",realConcept:"A deadlock occurs when two or more processes each wait for a resource held by the other, creating a circular dependency that can never resolve. Classic symptoms: threads stuck at 100% CPU but making no progress, or hanging database queries. Prevention: consistent lock ordering, timeouts on all waits, deadlock detection algorithms. In Slothespire, Deadlock taxes your energy first (Toil), then hits hard — you're stuck and taking damage."},total_outage:{id:"total_outage",kind:"enemy",name:"Total Outage",description:"Stability 100 (Act II Boss) · Escalating burns + debuffs",realConcept:"A total outage is the worst-case scenario: all or most of a service's functionality is unavailable to users. Root causes vary — hardware failure, bad deploy, cascading dependency failures, DDoS — but the response is consistent: establish communication, triage severity, engage the right people, resolve, and write a postmortem. Total Outage in Slothespire teaches graceful degradation: you cannot prevent all the damage, but you can survive it with the right combination of headroom and targeted responses."}},Ce="slothespire:codex";let Y=null;function pe(){if(Y!==null)return Y;try{const e=localStorage.getItem(Ce);Y=new Set(e?JSON.parse(e):[])}catch{Y=new Set}return Y}function it(e){try{localStorage.setItem(Ce,JSON.stringify([...e]))}catch{}}function Z(e){return pe().has(e)}function K(e){const r=pe();r.has(e)||(r.add(e),it(r))}function st(){return[...pe()]}function ct(e,r){const t=document.createElement("div");t.className="scene-codex";const i=Object.keys(P).filter(b=>P[b].type!=="status"&&P[b].type!=="curse"||b==="tech_debt"),n=Object.keys(U),o=Object.keys(ee);function d(b,v){var T,l,u;return v==="card"?((T=P[b])==null?void 0:T.name)??b:v==="relic"?((l=U[b])==null?void 0:l.name)??b:((u=ee[b])==null?void 0:u.name)??b}function m(b,v){return b.map(T=>{const l=Z(T),u=_e[T],s=(u==null?void 0:u.name)??d(T,v);return`
        <div class="codex-tile ${l?"unlocked":"locked"}" data-entry="${T}" data-kind="${v}">
          <div class="ct-icon">${l?v==="relic"?"✦":v==="enemy"?"▲":"⚔":"?"}</div>
          <div class="ct-name">${l?s:"???"}</div>
        </div>
      `}).join("")}function h(b){const v=_e[b];return v?`
      <h3 class="cd-name">${v.name}</h3>
      <p class="cd-desc">${v.description}</p>
      <div class="cd-divider"></div>
      <h4 class="cd-concept-label">THE REAL CONCEPT</h4>
      <p class="cd-concept">${v.realConcept}</p>
      ${v.docsLink?`<a class="cd-link" href="${v.docsLink}" target="_blank" rel="noopener">↗ Learn more</a>`:""}
    `:'<p style="opacity:0.4;font-size:11px;font-family:var(--font-display)">Entry not yet written.<br>Check back after a future update.</p>'}const f=st().length,S=i.length+n.length+o.length;t.innerHTML=`
    <style>
      .scene-codex { flex: 1; display: grid; grid-template-rows: 48px 40px 1fr; grid-template-columns: 1fr 300px; grid-template-areas: "header header" "tabs tabs" "grid detail"; height: 100vh; }
      .codex-header { grid-area: header; background: var(--color-base-deep); border-bottom: 1px solid var(--color-accent); display: flex; align-items: center; padding: 0 16px; gap: 12px; }
      .codex-header h2 { font-family: var(--font-display); font-size: 18px; color: var(--color-accent); letter-spacing: 3px; margin: 0; flex: 1; }
      .codex-header .count { font-family: var(--font-display); font-size: 10px; color: var(--color-text-dim); }
      .codex-search { padding: 5px 10px; background: var(--color-base-deep); border: 1px solid var(--color-border-low); color: var(--color-text); font-family: var(--font-display); font-size: 10px; border-radius: 3px; width: 160px; }
      .codex-search::placeholder { color: var(--color-text-dim); }
      .codex-back { font-family: var(--font-display); font-size: 10px; letter-spacing: 1px; }
      .codex-tabs { grid-area: tabs; background: var(--color-base-deep); border-bottom: 1px solid var(--color-border-low); display: flex; }
      .codex-tab { padding: 8px 20px; font-family: var(--font-display); font-size: 10px; letter-spacing: 1px; cursor: pointer; color: var(--color-text-dim); border-bottom: 2px solid transparent; }
      .codex-tab.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }
      .codex-tab:hover:not(.active) { color: var(--color-text); }
      .codex-grid { grid-area: grid; overflow-y: auto; padding: 12px; display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; }
      .codex-tile { width: 74px; padding: 6px 4px; text-align: center; background: var(--color-base-deep); border-radius: 4px; border: 1px solid var(--color-border-low); transition: border-color 0.1s; }
      .codex-tile.unlocked { cursor: pointer; }
      .codex-tile.unlocked:hover { border-color: var(--color-accent); }
      .codex-tile.locked { opacity: 0.25; cursor: default; }
      .ct-icon { font-size: 18px; color: var(--color-accent); margin-bottom: 2px; }
      .ct-name { font-family: var(--font-display); font-size: 7px; color: var(--color-text-dim); word-break: break-word; line-height: 1.2; }
      .codex-detail { grid-area: detail; background: var(--color-base-deep); border-left: 1px solid var(--color-border-low); padding: 16px; overflow-y: auto; }
      .cd-name { font-family: var(--font-display); color: var(--color-accent); font-size: 13px; margin: 0 0 6px; }
      .cd-desc { font-size: 10px; color: var(--color-energy); margin-bottom: 10px; }
      .cd-divider { height: 1px; background: var(--color-border-low); margin: 10px 0; }
      .cd-concept-label { font-family: var(--font-display); font-size: 8px; color: var(--color-text-dim); letter-spacing: 1px; margin: 0 0 6px; }
      .cd-concept { font-size: 10px; line-height: 1.7; opacity: 0.9; }
      .cd-link { display: block; margin-top: 10px; color: var(--color-accent); font-family: var(--font-display); font-size: 9px; text-decoration: none; }
      .cd-link:hover { text-decoration: underline; }
    </style>
    <div class="codex-header">
      <h2>// CODEX</h2>
      <span class="count">${f} / ${S} discovered</span>
      <input class="codex-search" id="codex-search" placeholder="Search..." />
      <button class="codex-back" id="codex-back">← BACK</button>
    </div>
    <div class="codex-tabs">
      <div class="codex-tab active" data-tab="cards">CARDS (${i.filter(Z).length}/${i.length})</div>
      <div class="codex-tab" data-tab="relics">RELICS (${n.filter(Z).length}/${n.length})</div>
      <div class="codex-tab" data-tab="enemies">ENEMIES (${o.filter(Z).length}/${o.length})</div>
    </div>
    <div class="codex-grid" id="codex-grid">${m(i,"card")}</div>
    <div class="codex-detail" id="codex-detail"><p style="opacity:0.4;font-size:10px;font-family:var(--font-display)">Select an entry to read more.</p></div>
  `;let R=i,w="card";function A(){t.querySelectorAll(".codex-tile.unlocked").forEach(b=>{b.addEventListener("click",()=>{t.querySelector("#codex-detail").innerHTML=h(b.dataset.entry)})})}return A(),t.querySelectorAll(".codex-tab").forEach(b=>{b.addEventListener("click",()=>{t.querySelectorAll(".codex-tab").forEach(T=>T.classList.remove("active")),b.classList.add("active");const v=b.dataset.tab;R=v==="cards"?i:v==="relics"?n:o,w=v==="cards"?"card":v==="relics"?"relic":"enemy",t.querySelector("#codex-grid").innerHTML=m(R,w),A()})}),t.querySelector("#codex-search").addEventListener("input",b=>{const v=b.target.value.toLowerCase();t.querySelectorAll(".codex-tile").forEach(T=>{var u,s;const l=((s=(u=T.querySelector(".ct-name"))==null?void 0:u.textContent)==null?void 0:s.toLowerCase())??"";T.style.display=l.includes(v)||!v?"":"none"})}),t.querySelector("#codex-back").addEventListener("click",()=>r({type:"CLOSE_CODEX"})),t}function dt(e,r){const t=document.createElement("div");t.className="scene-upgrading";const n=e.deck.filter(o=>!o.upgraded&&o.type!=="curse").map(o=>{const d=P[o.defId],m=(d==null?void 0:d.upgradedEffects)??(d==null?void 0:d.upgradedPowerTrigger),h=(m==null?void 0:m.map(f=>f.kind==="burn"?`Burn ${f.amount}`:f.kind==="headroom"?`+${f.amount} Headroom`:f.kind==="draw"?`Draw ${f.amount}`:f.kind==="restoreBudget"?`Restore ${f.amount}`:f.kind==="applyStatus"?`${f.status.replace(/_/g," ")} ${f.stacks}`:f.kind==="removeStatus"?`Remove ${f.status.replace(/_/g," ")}`:"").filter(Boolean).join(", "))??"improved";return`
      <div class="upg-card" data-id="${o.instanceId}">
        <div class="uc-cost">${o.cost<0?"☠":o.cost}</div>
        <div class="uc-name">${o.name} → <span style="color:var(--color-energy)">${o.name}+</span></div>
        <div class="uc-type">${o.type}</div>
        <div class="uc-preview">Upgraded: ${h}</div>
      </div>
    `}).join("");return t.innerHTML=`
    <style>
      .scene-upgrading { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 32px; }
      .scene-upgrading h2 { font-family: var(--font-display); font-size: 22px; color: var(--color-accent); letter-spacing: 3px; margin: 0; }
      .upg-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 700px; }
      .upg-card { padding: 12px 16px; background: var(--color-base-deep); border: 1px solid var(--color-border-low); border-radius: 6px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; min-width: 160px; max-width: 220px; transition: border-color 0.1s; }
      .upg-card:hover { border-color: var(--color-energy); }
      .uc-cost { font-family: var(--font-display); font-size: 10px; color: var(--color-pop); }
      .uc-name { font-family: var(--font-display); font-size: 12px; color: var(--color-accent); }
      .uc-type { font-size: 9px; color: var(--color-text-dim); text-transform: uppercase; }
      .uc-preview { font-size: 10px; color: var(--color-energy); margin-top: 2px; }
      .upg-cancel { font-family: var(--font-display); font-size: 11px; letter-spacing: 1px; }
    </style>
    <h2>UPGRADE A CARD</h2>
    <div class="upg-grid">${n}</div>
    <button class="upg-cancel" id="upg-cancel">CANCEL</button>
  `,t.querySelectorAll(".upg-card").forEach(o=>{o.addEventListener("click",()=>r({type:"CHOOSE_CARD_TO_UPGRADE",cardInstanceId:o.dataset.id}))}),t.querySelector("#upg-cancel").addEventListener("click",()=>r({type:"GO_TO_MAP"})),t}const Ie=document.getElementById("app");if(!Ie)throw new Error("missing #app root");let O=ce()??se(`seed-${Date.now().toString(36)}`);function z(e){O=qe(O,e),O.scene==="lost"||O.scene==="won"||O.scene==="title"?de():Fe(O);for(const r of O.player.hand)K(r.defId);for(const r of O.rewardCards??[])K(r.defId);O.rewardRelic&&K(O.rewardRelic);for(const r of O.player.relics)K(r);if(O.combat)for(const r of O.combat.enemies)K(r.defId);Te()}function Te(){Ie.replaceChildren(lt(O))}function lt(e){switch(e.scene){case"title":return Ye(e,z);case"map":return et(e,z);case"combat":return Je(e,z);case"reward":return tt(e,z);case"rest":return rt(e,z);case"event":return at(e,z);case"event_outcome":return ot(e,z);case"shop":return nt(e,z);case"codex":return ct(e,z);case"upgrading":return dt(e,z);case"lost":case"won":return Ze(e,z)}}Te();
//# sourceMappingURL=index-DGRKxQk7.js.map
