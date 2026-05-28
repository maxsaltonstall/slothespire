(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();function Le(){const e=Math.floor(Math.random()*65536).toString(16).padStart(4,"0");return`${Date.now().toString(36)}-${e}`}function le(e){return{meta:{runId:Le(),seed:e,rngCursor:0,startedAt:Date.now()},player:{budget:80,maxBudget:80,energy:3,energyPerTurn:3,headroom:0,hand:[],draw:[],discard:[],exhaust:[],statuses:{},relics:["pager"],hotfixes:[]},combat:void 0,map:{act:1,nodes:[],currentNodeId:null,visitedNodeIds:[]},deck:[],credits:0,scene:"title",version:1,history:[]}}const L={manual_fix:{id:"manual_fix",name:"Manual Fix",type:"attack",cost:1,effects:[{kind:"burn",amount:6}],upgradedEffects:[{kind:"burn",amount:9}],flavor:"When all else fails, restart the pod."},failover:{id:"failover",name:"Failover",type:"skill",cost:1,effects:[{kind:"headroom",amount:5}],upgradedEffects:[{kind:"headroom",amount:8}],flavor:"Route around the damage."},page_senior_engineer:{id:"page_senior_engineer",name:"Page Senior Engineer",type:"skill",cost:2,effects:[{kind:"draw",amount:2},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],upgradedEffects:[{kind:"draw",amount:3},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],flavor:"They've seen this before."},canary_deploy:{id:"canary_deploy",name:"Canary Deploy",type:"attack",cost:1,effects:[{kind:"burn",amount:5},{kind:"draw",amount:1}],upgradedEffects:[{kind:"burn",amount:8},{kind:"draw",amount:1}],flavor:"Ship a little, learn a lot."},circuit_breaker:{id:"circuit_breaker",name:"Circuit Breaker",type:"skill",cost:1,effects:[{kind:"headroom",amount:8}],upgradedEffects:[{kind:"headroom",amount:12}],flavor:"Stop the bleeding before you debug it."},chaos_engineering:{id:"chaos_engineering",name:"Chaos Engineering",type:"skill",cost:2,effects:[{kind:"applyStatus",status:"customer_facing",stacks:3,target:"all"},{kind:"selfBurn",amount:5}],upgradedEffects:[{kind:"applyStatus",status:"customer_facing",stacks:5,target:"all"},{kind:"selfBurn",amount:5}],flavor:"Break it on purpose so it doesn't break you on Friday."},auto_scaling:{id:"auto_scaling",name:"Auto-Scaling",type:"power",cost:1,effects:[],powerTrigger:[{kind:"headroom",amount:4}],upgradedPowerTrigger:[{kind:"headroom",amount:6}],flavor:"Demand goes up. Capacity goes up."},page_the_ceo:{id:"page_the_ceo",name:"Page the CEO",type:"skill",cost:2,effects:[{kind:"burn",amount:30}],upgradedEffects:[{kind:"burn",amount:40}],exhaust:!0,flavor:"Nuclear option. One per incident."},tech_debt:{id:"tech_debt",name:"Tech Debt",type:"curse",cost:-1,effects:[],curseEffect:[{kind:"selfBurn",amount:2}],flavor:"Unplayable. Costs 2 Budget every turn it sits in your hand."},rollback:{id:"rollback",name:"Rollback",type:"attack",cost:1,effects:[{kind:"burn",amount:8}],upgradedEffects:[{kind:"burn",amount:11}],flavor:"Revert to last known good. (That was three deployments ago.)"},load_balancer:{id:"load_balancer",name:"Load Balancer",type:"skill",cost:1,effects:[{kind:"headroom",amount:7}],upgradedEffects:[{kind:"headroom",amount:10}],flavor:"Distribute the pain."},monitoring_alert:{id:"monitoring_alert",name:"Monitoring Alert",type:"attack",cost:0,effects:[{kind:"burn",amount:4}],upgradedEffects:[{kind:"burn",amount:6}],flavor:"Better late than never."},feature_flag:{id:"feature_flag",name:"Feature Flag",type:"skill",cost:1,effects:[{kind:"draw",amount:2}],upgradedEffects:[{kind:"draw",amount:3}],flavor:"Ship it. Just turn it off first."},health_check:{id:"health_check",name:"Health Check",type:"skill",cost:1,effects:[{kind:"headroom",amount:4},{kind:"draw",amount:1}],upgradedEffects:[{kind:"headroom",amount:5},{kind:"draw",amount:1}],flavor:"Are you up? Are you actually up?"},graceful_degradation:{id:"graceful_degradation",name:"Graceful Degradation",type:"skill",cost:1,effects:[{kind:"headroom",amount:9}],upgradedEffects:[{kind:"headroom",amount:12}],flavor:"Do less. Survive."},rate_limiter:{id:"rate_limiter",name:"Rate Limiter",type:"skill",cost:1,effects:[{kind:"applyStatus",status:"throttled",stacks:2,target:"single"}],upgradedEffects:[{kind:"applyStatus",status:"throttled",stacks:3,target:"single"}],flavor:"You get 100 requests. You don't get 101."},zero_downtime_deploy:{id:"zero_downtime_deploy",name:"Zero Downtime Deploy",type:"attack",cost:2,effects:[{kind:"burn",amount:10},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],upgradedEffects:[{kind:"burn",amount:14},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],flavor:"Phased rollout. No one even noticed."},sli_dashboard:{id:"sli_dashboard",name:"SLI Dashboard",type:"skill",cost:2,effects:[{kind:"draw",amount:3},{kind:"applyStatus",status:"confidence",stacks:1,target:"self"}],upgradedEffects:[{kind:"draw",amount:3},{kind:"applyStatus",status:"confidence",stacks:1,target:"self"},{kind:"headroom",amount:2}],flavor:"The graph goes up. For now."},postmortem:{id:"postmortem",name:"Blameless Postmortem",type:"skill",cost:2,effects:[{kind:"restoreBudget",amount:12}],upgradedEffects:[{kind:"restoreBudget",amount:18}],exhaust:!0,flavor:"The system failed, not the person."},runbook:{id:"runbook",name:"Runbook",type:"skill",cost:1,effects:[{kind:"draw",amount:2},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],upgradedEffects:[{kind:"draw",amount:3},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],flavor:"Step 1: Don't panic. Step 2: Follow this document."},service_mesh:{id:"service_mesh",name:"Service Mesh",type:"power",cost:1,effects:[],powerTrigger:[{kind:"headroom",amount:3},{kind:"draw",amount:1}],upgradedPowerTrigger:[{kind:"headroom",amount:5},{kind:"draw",amount:1}],flavor:"Distributed reliability, automatically."},on_call_swap:{id:"on_call_swap",name:"On-Call Swap",type:"skill",cost:0,effects:[{kind:"draw",amount:2}],upgradedEffects:[{kind:"draw",amount:3}],exhaust:!0,flavor:"Hand it to someone else. Fast."},incident_playbook:{id:"incident_playbook",name:"Incident Playbook",type:"power",cost:2,effects:[],powerTrigger:[{kind:"draw",amount:1},{kind:"headroom",amount:2}],upgradedPowerTrigger:[{kind:"draw",amount:1},{kind:"headroom",amount:4}],flavor:"Every scenario, pre-planned."},error_budget_calc:{id:"error_budget_calc",name:"Error Budget Calc",type:"skill",cost:1,effects:[{kind:"applyStatus",status:"confidence",stacks:1,target:"self"}],upgradedEffects:[{kind:"applyStatus",status:"confidence",stacks:1,target:"self"},{kind:"headroom",amount:4}],flavor:"You have 0.1% left. Spend it wisely."},dependency_audit:{id:"dependency_audit",name:"Dependency Audit",type:"attack",cost:2,effects:[{kind:"burn",amount:12},{kind:"applyStatus",status:"throttled",stacks:2,target:"single"}],upgradedEffects:[{kind:"burn",amount:16},{kind:"applyStatus",status:"throttled",stacks:2,target:"single"}],flavor:"Forty-seven transitive dependencies. Three are vulnerable."},blue_green_deploy:{id:"blue_green_deploy",name:"Blue-Green Deploy",type:"attack",cost:1,effects:[{kind:"burn",amount:7},{kind:"draw",amount:1}],upgradedEffects:[{kind:"burn",amount:10},{kind:"draw",amount:1}],flavor:"Route traffic. Switch. Celebrate."},chaos_monkey:{id:"chaos_monkey",name:"Chaos Monkey",type:"attack",cost:1,effects:[{kind:"burn",amount:6},{kind:"applyStatus",status:"customer_facing",stacks:1,target:"single"}],upgradedEffects:[{kind:"burn",amount:8},{kind:"applyStatus",status:"customer_facing",stacks:1,target:"single"}],flavor:"Randomly terminates instances in production. That's the feature."},toil_reduction:{id:"toil_reduction",name:"Toil Reduction",type:"skill",cost:2,effects:[{kind:"removeStatus",status:"toil",target:"self"},{kind:"headroom",amount:8}],upgradedEffects:[{kind:"removeStatus",status:"toil",target:"self"},{kind:"headroom",amount:12}],flavor:"Automate the thing that pages you at 3am."},load_shedding:{id:"load_shedding",name:"Load Shedding",type:"skill",cost:1,effects:[{kind:"applyStatus",status:"throttled",stacks:3,target:"all"}],upgradedEffects:[{kind:"applyStatus",status:"throttled",stacks:4,target:"all"}],flavor:"Shed load before the load sheds you."},slo_tightening:{id:"slo_tightening",name:"SLO Tightening",type:"power",cost:3,effects:[],powerTrigger:[{kind:"applyStatus",status:"pressure",stacks:1,target:"self"}],upgradedPowerTrigger:[{kind:"applyStatus",status:"pressure",stacks:2,target:"self"}],flavor:"Make the target harder. Make yourself stronger."},capacity_planning:{id:"capacity_planning",name:"Capacity Planning",type:"skill",cost:2,effects:[{kind:"restoreBudget",amount:8},{kind:"draw",amount:2}],upgradedEffects:[{kind:"restoreBudget",amount:12},{kind:"draw",amount:2}],flavor:"Provision for peak. Not for Tuesday at 2am."},on_fire:{id:"on_fire",name:"On Fire",type:"attack",cost:0,effects:[{kind:"burn",amount:5}],upgradedEffects:[{kind:"burn",amount:8}],flavor:"Everything is on fire. Might as well use it."},war_room:{id:"war_room",name:"War Room",type:"skill",cost:3,effects:[{kind:"restoreBudget",amount:20}],upgradedEffects:[{kind:"restoreBudget",amount:28}],exhaust:!0,flavor:"All hands on deck. Only pull once."},retry_with_backoff:{id:"retry_with_backoff",name:"Retry with Backoff",type:"attack",cost:1,effects:[{kind:"burn",amount:6},{kind:"burn",amount:6}],upgradedEffects:[{kind:"burn",amount:8},{kind:"burn",amount:8}],flavor:"Try again. Then try again, but slower."},postmortem_template:{id:"postmortem_template",name:"Postmortem Template",type:"skill",cost:1,effects:[{kind:"restoreBudget",amount:6},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],upgradedEffects:[{kind:"restoreBudget",amount:9},{kind:"applyStatus",status:"flow",stacks:1,target:"self"}],flavor:"Timeline: unclear. Impact: large. Action items: many."},observability_pipeline:{id:"observability_pipeline",name:"Observability Pipeline",type:"power",cost:2,effects:[],powerTrigger:[{kind:"applyStatus",status:"observability",stacks:1,target:"self"}],upgradedPowerTrigger:[{kind:"applyStatus",status:"observability",stacks:2,target:"self"}],flavor:"See everything. All the time."}};let Pe=0;function Me(e){return`${e}_${Pe++}`}function V(e){const a=L[e];if(!a)throw new Error(`Unknown card def: ${e}`);return{instanceId:Me(e),defId:e,name:a.name,type:a.type,cost:a.cost,upgraded:!1}}function ze(){return[...Array.from({length:5},()=>V("manual_fix")),...Array.from({length:4},()=>V("failover")),V("page_senior_engineer")]}const oe={rollback_hotfix:{id:"rollback_hotfix",name:"Rollback Hotfix",effects:[{kind:"burn",amount:20}],flavor:"Revert everything. Sort it out later."},failover_hotfix:{id:"failover_hotfix",name:"Failover Hotfix",effects:[{kind:"headroom",amount:25}],flavor:"Not fixed. Just not failing right now."}},re={flapping_health_check:{id:"flapping_health_check",name:"Flapping Health Check",stability:20,intentPattern:[{kind:"burn",amount:6},{kind:"burn",amount:4}]},memory_leak:{id:"memory_leak",name:"Memory Leak",stability:36,intentPattern:[{kind:"buff",status:"pressure",stacks:1},{kind:"burn",amount:8},{kind:"buff",status:"pressure",stacks:1},{kind:"burn",amount:10}]},zombie_process:{id:"zombie_process",name:"Zombie Process",stability:18,intentPattern:[{kind:"debuff",status:"toil",stacks:1},{kind:"burn",amount:5}]},the_pager_storm:{id:"the_pager_storm",name:"The Pager Storm",stability:75,intentPattern:[{kind:"burn",amount:10},{kind:"debuff",status:"on_call_fatigue",stacks:1},{kind:"burn",amount:18},{kind:"buff",status:"pressure",stacks:2}]},phantom_read:{id:"phantom_read",name:"Phantom Read",stability:16,intentPattern:[{kind:"burn",amount:5},{kind:"debuff",status:"throttled",stacks:1}]},cron_storm:{id:"cron_storm",name:"Cron Storm",stability:24,intentPattern:[{kind:"burn",amount:6},{kind:"burn",amount:3},{kind:"burn",amount:3}]},stale_cache:{id:"stale_cache",name:"Stale Cache",stability:22,intentPattern:[{kind:"buff",status:"pressure",stacks:1},{kind:"burn",amount:7}]},misconfigured_tls:{id:"misconfigured_tls",name:"Misconfigured TLS",stability:20,intentPattern:[{kind:"debuff",status:"toil",stacks:1},{kind:"burn",amount:8}]},cascading_failure:{id:"cascading_failure",name:"Cascading Failure",stability:55,intentPattern:[{kind:"burn",amount:8},{kind:"buff",status:"pressure",stacks:1},{kind:"burn",amount:10},{kind:"buff",status:"pressure",stacks:1}]},total_outage:{id:"total_outage",name:"Total Outage",stability:100,intentPattern:[{kind:"burn",amount:14},{kind:"debuff",status:"customer_facing",stacks:2},{kind:"burn",amount:24},{kind:"buff",status:"pressure",stacks:3}]},deadlock:{id:"deadlock",name:"Deadlock",stability:30,intentPattern:[{kind:"debuff",status:"toil",stacks:2},{kind:"burn",amount:10}]}},Ne={"1-0":["flapping_health_check"],"1-1":["flapping_health_check","phantom_read"],"1-2":["phantom_read","cron_storm","stale_cache"],"1-3":["memory_leak","cron_storm","misconfigured_tls"],"1-4":["memory_leak","zombie_process","misconfigured_tls"],"1-elite":["cascading_failure"],"1-boss":["the_pager_storm"],"2-0":["zombie_process","stale_cache"],"2-1":["memory_leak","misconfigured_tls"],"2-2":["deadlock","memory_leak"],"2-3":["zombie_process","deadlock"],"2-4":["memory_leak","deadlock"],"2-elite":["cascading_failure"],"2-boss":["total_outage"]};function Be(e){const a=/r(\d+)c/.exec(e);return a?parseInt(a[1]):0}function he(e,a,t,o){const n=Be(a),i=e==="boss"?`${t}-boss`:e==="elite"?`${t}-elite`:`${t}-${Math.min(n,4)}`,l=Ne[i]??["flapping_health_check"];return l[Math.floor(o*l.length)]}let He=0;function ye(e){const a=re[e];if(!a)throw new Error(`Unknown enemy def: ${e}`);return{instanceId:`${e}_${He++}`,defId:e,name:a.name,stability:a.stability,maxStability:a.stability,statuses:{}}}function te(e,a){const t=re[e];return t?t.intentPattern[a%t.intentPattern.length]:{kind:"unknown"}}function Ue(e){let a=e>>>0;return function(){a=a+1831565813>>>0;let t=a;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function qe(e){if(/^0x[0-9a-fA-F]+$/.test(e))return parseInt(e,16);if(/^\d+$/.test(e))return parseInt(e,10);let a=2166136261;for(let t=0;t<e.length;t++)a^=e.charCodeAt(t),a=Math.imul(a,16777619);return a>>>0}let be="",W=0,Y=null;function U(e){const{seed:a,rngCursor:t}=e.meta;if(a!==be||t<W||Y===null){Y=Ue(qe(a));for(let n=0;n<t;n++)Y();be=a,W=t}for(;W<t;)Y(),W++;const o=Y();return W++,[o,{...e,meta:{...e.meta,rngCursor:t+1}}]}function ve(e,a,t){if(!e.combat)return e;const o=e.combat.enemies.map(n=>n.instanceId===a?{...n,stability:Math.max(0,n.stability-t)}:n);return{...e,combat:{...e.combat,enemies:o}}}function j(e,a){return{...e,player:{...e.player,headroom:e.player.headroom+a}}}function ae(e,a){const t=[...e];let o=a;for(let n=t.length-1;n>0;n--){const[i,l]=U(o);o=l;const f=Math.floor(i*(n+1));[t[n],t[f]]=[t[f],t[n]]}return[t,o]}function H(e,a){let t=e,{hand:o,draw:n,discard:i}=t.player,l=a;for(;l>0;){if(n.length===0){if(i.length===0)break;const[b,d]=ae(i,t);t=d,n=b,i=[]}const f=Math.min(l,n.length);o=[...o,...n.slice(0,f)],n=n.slice(f),l-=f}return{...t,player:{...t.player,hand:o,draw:n,discard:i}}}const je=["customer_facing","throttled","toil","flow","on_call_fatigue","observability"];function D(e,a,t,o){if(a==="player")return{...e,player:{...e.player,statuses:{...e.player.statuses,[t]:(e.player.statuses[t]??0)+o}}};if(!e.combat)return e;const n=e.combat.enemies.map(i=>i.instanceId===a?{...i,statuses:{...i.statuses,[t]:(i.statuses[t]??0)+o}}:i);return{...e,combat:{...e.combat,enemies:n}}}function Z(e,a,t){if(a==="player"){const n={...e.player.statuses};return delete n[t],{...e,player:{...e.player,statuses:n}}}if(!e.combat)return e;const o=e.combat.enemies.map(n=>{if(n.instanceId!==a)return n;const i={...n.statuses};return delete i[t],{...n,statuses:i}});return{...e,combat:{...e.combat,enemies:o}}}function xe(e,a){const t={...e};for(const o of je)if(t[o]!==void 0&&(a===void 0||a.has(o))){const n=t[o]-1;n<=0?delete t[o]:t[o]=n}return t}function ne(e,a,t){let o=e;return a.pressure&&(o+=a.pressure),a.confidence&&(o*=2),a.throttled&&(o=Math.floor(o*.75)),t.customer_facing&&(o=Math.ceil(o*1.5)),o}function ie(e,a){return e+(a.stability??0)}const ke=[1,2,3,3,3,2,1],Fe=[["combat"],["combat","event","rest","elite"],["rest","combat","elite","event","shop"],["shop","event","combat","rest","elite"],["event","combat","rest","elite","shop"],["rest","event","combat","shop"],["boss"]];function se(e,a){let t=a;const o=[];for(let n=0;n<ke.length;n++){const i=ke[n],l=Fe[n];let f;if(l.length===1)f=[l[0]];else{const d=[...l];f=[];for(let w=0;w<i&&d.length>0;w++){const[v,x]=U(t);t=x;const R=Math.floor(v*d.length);f.push(d.splice(R,1)[0])}}const b=f.map((d,w)=>({id:`a${e}r${n}c${w}`,type:d,next:[]}));o.push(b)}for(let n=0;n<o.length-1;n++){const i=o[n+1];for(const l of o[n])l.next=i.map(f=>f.id)}return{nodes:o,firstNodeId:o[0][0].id,state:t}}const F=[{id:"untested_migration",title:"The Untested Migration",text:"You find a schema migration in the deployment pipeline marked 'low risk.' It has never been run against production data. Three engineers promise it's fine.",choices:[{text:"Run it anyway",outcome:{kind:"gainCredits",amount:50}},{text:"Roll it back and schedule a review",outcome:{kind:"nothing"}},{text:"Let the intern run it 'for experience'",outcome:{kind:"addCurse"}}]},{id:"heroic_engineer",title:"Heroic Engineer",text:"A senior engineer offers to stay up all night and manually patch the issue. 'Don't page anyone, I've got this,' they say. Truly inspiring.",choices:[{text:"Accept their sacrifice",outcome:{kind:"gainCard",rarity:"rare"}},{text:"Insist on proper on-call rotation",outcome:{kind:"gainCredits",amount:30}}]},{id:"vendor_outage",title:"Vendor Outage",text:"Your cloud provider is experiencing 'elevated error rates' in the region your database lives in. Their status page says 'investigating.' That's all.",choices:[{text:"Wait it out (what choice do you have?)",outcome:{kind:"loseMaxBudget",amount:5}},{text:"Fail over to backup region",outcome:{kind:"loseCredits",amount:50}}]},{id:"mystery_microservice",title:"Mystery Box Microservice",text:"You discover a service in the catalog with no owner, no documentation, and 40,000 requests per second. Disabling it would be catastrophic. Probably.",choices:[{text:"Leave it alone and pretend you didn't see it",outcome:{kind:"nothing"}},{text:"Add a README and assign an owner",outcome:{kind:"gainCredits",amount:75}},{text:"Refactor it on the spot",outcome:{kind:"addCurse"}}]},{id:"on_call_handoff",title:"On-Call Handoff",text:"The engineer going off-call insists everything is fine. The only open incident is labeled 'investigating.' There are seven of them.",choices:[{text:"Accept the handoff cheerfully",outcome:{kind:"nothing"}},{text:"Spend an hour doing a proper status review",outcome:{kind:"gainCredits",amount:40}},{text:"Immediately page the departing engineer back",outcome:{kind:"addCurse"}}]},{id:"forgotten_cron",title:"Forgotten Cron",text:"A cron job running every 60 seconds has been consuming 40% of database CPU for six months. Nobody noticed because it never threw an error.",choices:[{text:"Disable it and see what breaks",outcome:{kind:"loseMaxBudget",amount:5}},{text:"Optimize it properly",outcome:{kind:"gainCard",rarity:"uncommon"}}]},{id:"old_status_page",title:"Old Status Page",text:"Your status page reads 'All Systems Operational.' It last updated 47 days ago. Customers are reporting a five-hundred-second outage.",choices:[{text:"Update the status page first",outcome:{kind:"gainCredits",amount:30}},{text:"Fix the outage first",outcome:{kind:"nothing"}}]},{id:"refactor_time",title:"Refactor Time",text:"A 6,000-line service file. No tests. One author, who left eight months ago. It's the only thing standing between you and the boss.",choices:[{text:"Add tests before touching anything",outcome:{kind:"gainCard",rarity:"rare"}},{text:"Comment out the suspicious lines and ship it",outcome:{kind:"addCurse"}},{text:"Leave it alone",outcome:{kind:"nothing"}}]}],we=Object.values(L).filter(e=>e.type!=="curse"&&e.cost>=0&&!["manual_fix","failover","page_senior_engineer"].includes(e.id)),We={canary_deploy:"common",circuit_breaker:"common",rollback:"common",load_balancer:"common",monitoring_alert:"common",feature_flag:"common",health_check:"common",graceful_degradation:"common",rate_limiter:"common",on_fire:"common",blue_green_deploy:"common",on_call_swap:"common",chaos_engineering:"uncommon",auto_scaling:"uncommon",zero_downtime_deploy:"uncommon",sli_dashboard:"uncommon",runbook:"uncommon",chaos_monkey:"uncommon",error_budget_calc:"uncommon",load_shedding:"uncommon",toil_reduction:"uncommon",dependency_audit:"uncommon",capacity_planning:"uncommon",retry_with_backoff:"uncommon",postmortem_template:"uncommon",incident_playbook:"uncommon",service_mesh:"uncommon",slo_tightening:"rare",observability_pipeline:"rare",page_the_ceo:"rare",postmortem:"rare",war_room:"rare"};function Ye(e){return We[e]??"common"}function Q(e,a=3,t){let o=e;const n=[],i=new Set;for(let l=0;l<a;l++){let f;if(t)f=t;else{const[x,R]=U(o);o=R,x<.6?f="common":x<.9?f="uncommon":f="rare"}let b=we.filter(x=>Ye(x.id)===f&&!i.has(x.id));if(b.length===0&&(b=we.filter(x=>!i.has(x.id))),b.length===0)break;const[d,w]=U(o);o=w;const v=b[Math.floor(d*b.length)];i.add(v.id),n.push(V(v.id))}return[n,o]}const _e=50,Se=75,Ge=25,q={pager:{id:"pager",name:"Pager",product:"On-Call",description:"At start of your turn, if SLO Budget ≤ 30%, draw 1 extra card.",flavor:"It never rings at a convenient time.",onTurnStart:e=>e.player.budget<=Math.floor(e.player.maxBudget*.3)?H(e,1):e},apm_tracing:{id:"apm_tracing",name:"APM Tracing",product:"Datadog APM",description:"At start of combat, gain Observability 2.",flavor:"Every span tells a story.",onCombatStart:e=>D(e,"player","observability",2)},live_tail:{id:"live_tail",name:"Live Tail",product:"Datadog Live Tail",description:"At start of combat, draw 1 extra card.",flavor:"Real-time insight. No waiting.",onCombatStart:e=>H(e,1)},watchdog:{id:"watchdog",name:"Watchdog",product:"Datadog Watchdog",description:"At start of combat, apply Customer-Facing 1 to the highest-stability enemy.",flavor:"It finds the anomaly before you do.",onCombatStart:e=>{if(!e.combat||e.combat.enemies.length===0)return e;const a=e.combat.enemies.reduce((t,o)=>t.stability>=o.stability?t:o);return D(e,a.instanceId,"customer_facing",1)}},synthetic_tests:{id:"synthetic_tests",name:"Synthetic Tests",product:"Datadog Synthetic Monitoring",description:"At start of your turn, gain 1 Headroom.",flavor:"Continuous verification. Always on.",onTurnStart:e=>j(e,1)},error_tracking:{id:"error_tracking",name:"Error Tracking",product:"Datadog Error Tracking",description:"At start of combat, apply Customer-Facing 1 to all enemies.",flavor:"Group. Deduplicate. Prioritize.",onCombatStart:e=>{if(!e.combat)return e;let a=e;for(const t of a.combat.enemies)a=D(a,t.instanceId,"customer_facing",1);return a}},dashboards:{id:"dashboards",name:"Dashboards",product:"Datadog Dashboards",description:"At start of each turn, gain 1 Headroom.",flavor:"The graph goes up. You also go up.",onTurnStart:e=>j(e,1)},service_catalog:{id:"service_catalog",name:"Service Catalog",product:"Datadog Service Catalog",description:"At start of combat, gain Observability 1.",flavor:"Know your dependencies. Own your services.",onCombatStart:e=>D(e,"player","observability",1)},incident_management:{id:"incident_management",name:"Incident Management",product:"Datadog Incident Management",description:"At start of combat, gain Confidence 1.",flavor:"Declared. Triaged. Resolved.",onCombatStart:e=>D(e,"player","confidence",1)},workflow_automation:{id:"workflow_automation",name:"Workflow Automation",product:"Datadog Workflow Automation",description:"At start of combat, gain 6 Headroom.",flavor:"Automate the response before the alert fires.",onCombatStart:e=>j(e,6)},notebooks:{id:"notebooks",name:"Notebooks",product:"Datadog Notebooks",description:"At start of combat, draw 1 extra card.",flavor:"Collaborative investigation, documented.",onCombatStart:e=>H(e,1)},cloud_cost_mgmt:{id:"cloud_cost_mgmt",name:"Cloud Cost Mgmt",product:"Datadog Cloud Cost Management",description:"At start of each turn, gain 5 Credits.",flavor:"Tag your resources. Save your money.",onTurnStart:e=>({...e,credits:e.credits+5})},rum:{id:"rum",name:"RUM",product:"Datadog Real User Monitoring",description:"At start of each turn, if hand size < 3, draw 1 card.",flavor:"See what real users actually experience.",onTurnStart:e=>e.player.hand.length<3?H(e,1):e},sensitive_data_scanner:{id:"sensitive_data_scanner",name:"Sensitive Data Scanner",product:"Datadog SDS",description:"At start of combat, remove the first curse from your deck (if any).",flavor:"Find the secrets. Remove the secrets.",onCombatStart:e=>{const a=e.deck.findIndex(t=>t.type==="curse");return a===-1?e:{...e,deck:[...e.deck.slice(0,a),...e.deck.slice(a+1)]}}},continuous_profiler:{id:"continuous_profiler",name:"Continuous Profiler",product:"Datadog Continuous Profiler",description:"At start of combat, gain Pressure 1.",flavor:"Always-on performance visibility.",onCombatStart:e=>D(e,"player","pressure",1)}},ce=Object.keys(q).filter(e=>e!=="pager");function de(e){const a=ce.filter(n=>!e.player.relics.includes(n));if(a.length===0){const[n,i]=U(e);return[ce[Math.floor(n*ce.length)],i]}const[t,o]=U(e);return[a[Math.floor(t*a.length)],o]}function Ke(e,a){var t,o,n,i,l,f,b,d,w,v,x,R,h,_,$;switch(a.type){case"START_RUN":{const p=ze();let m={...le(e.meta.seed),deck:p};const[s,g]=ae(p,m);m={...g,player:{...g.player,draw:s}};const{nodes:r,state:y}=se(1,m);return m={...y,map:{act:1,nodes:r,currentNodeId:null,visitedNodeIds:[]}},{...m,scene:"map"}}case"RETURN_TO_TITLE":return le(e.meta.seed);case"PLAY_CARD":{const{cardInstanceId:p,targetId:m}=a,s=e.player.hand.find(u=>u.instanceId===p);if(!s)return e;const g=L[s.defId];if(!g||s.type==="curse"||s.cost<0||s.cost>0&&e.player.energy<s.cost)return e;const r=s.type==="power",y=g.exhaust===!0;let c={...e,player:{...e.player,energy:e.player.energy-Math.max(0,s.cost),hand:e.player.hand.filter(u=>u.instanceId!==p),discard:r||y?e.player.discard:[...e.player.discard,s],exhaust:y?[...e.player.exhaust,s]:e.player.exhaust},combat:r&&e.combat?{...e.combat,activePowers:[...e.combat.activePowers,s]}:e.combat};const I=s.upgraded&&g.upgradedEffects?g.upgradedEffects:g.effects;for(const u of I)if(u.kind==="burn"){const S=m??((o=(t=c.combat)==null?void 0:t.enemies[0])==null?void 0:o.instanceId);if(S){const E=(n=c.combat)==null?void 0:n.enemies.find(T=>T.instanceId===S),M=ne(u.amount,c.player.statuses,(E==null?void 0:E.statuses)??{});c.player.statuses.confidence&&(c=Z(c,"player","confidence")),c=ve(c,S,M)}}else if(u.kind==="selfBurn")c={...c,player:{...c.player,budget:c.player.budget-u.amount}};else if(u.kind==="headroom"){const S=ie(u.amount,c.player.statuses);c=j(c,S)}else if(u.kind==="draw")c=H(c,u.amount);else if(u.kind==="removeStatus"){const S=u.target==="self"?"player":m??((l=(i=c.combat)==null?void 0:i.enemies[0])==null?void 0:l.instanceId)??"player";c=Z(c,S,u.status)}else if(u.kind==="restoreBudget")c={...c,player:{...c.player,budget:Math.min(c.player.maxBudget,c.player.budget+u.amount)}};else if(u.kind==="applyStatus")if(u.target==="self")c=D(c,"player",u.status,u.stacks);else if(u.target==="all")for(const S of((f=c.combat)==null?void 0:f.enemies)??[])c=D(c,S.instanceId,u.status,u.stacks);else{const S=m??((d=(b=c.combat)==null?void 0:b.enemies[0])==null?void 0:d.instanceId);S&&(c=D(c,S,u.status,u.stacks))}if(c.combat&&c.combat.enemies.every(u=>u.stability<=0)){const u=c.map.nodes.flat().find(T=>T.id===c.map.currentNodeId);if((u==null?void 0:u.type)==="boss"){if(c.map.act===1){const{nodes:T,state:z}=se(2,c);return{...z,scene:"map",combat:void 0,map:{act:2,nodes:T,currentNodeId:null,visitedNodeIds:[]}}}return{...c,scene:"won",combat:void 0}}if((u==null?void 0:u.type)==="elite"){const[T,z]=de(c);return{...z,scene:"reward",combat:void 0,rewardRelic:T,rewardCards:void 0,credits:c.credits+Se}}const[E,M]=Q(c);return{...M,scene:"reward",combat:void 0,rewardCards:E,credits:c.credits+_e}}return c.player.budget<=0?{...c,scene:"lost",combat:void 0}:c}case"END_TURN":{if(!e.combat)return e;const{enemies:p,intentByEnemy:m,turn:s,activePowers:g}=e.combat;let r=e;for(const C of r.player.hand){if(C.type!=="curse")continue;const k=L[C.defId];for(const P of(k==null?void 0:k.curseEffect)??[])P.kind==="selfBurn"&&(r={...r,player:{...r.player,budget:r.player.budget-P.amount}})}r={...r,player:{...r.player,discard:[...r.player.discard,...r.player.hand],hand:[]}};const y=new Set(Object.keys(r.player.statuses)),c=new Map(p.map(C=>[C.instanceId,new Set(Object.keys(C.statuses))])),I=r.player.statuses.flow??0,u=r.player.statuses.toil??0;for(const C of p){const k=m[C.instanceId];if(k)if(k.kind==="burn"){const P=ne(k.amount,C.statuses,r.player.statuses),A=Math.min(r.player.headroom,P),N=P-A;r={...r,player:{...r.player,headroom:0,budget:r.player.budget-N}}}else k.kind==="buff"?r=D(r,C.instanceId,k.status,k.stacks):k.kind==="debuff"&&(r=D(r,"player",k.status,k.stacks))}if(r={...r,player:{...r.player,headroom:0}},r.player.budget<=0)return{...r,scene:"lost",combat:void 0};const S=r.player.statuses.on_call_fatigue??0;if(S>0&&(r={...r,player:{...r.player,budget:r.player.budget-S*2}},r.player.budget<=0))return{...r,scene:"lost",combat:void 0};r={...r,player:{...r.player,statuses:xe(r.player.statuses,y)},combat:{...r.combat,enemies:r.combat.enemies.map(C=>({...C,statuses:xe(C.statuses,c.get(C.instanceId))}))}};const E=s+1,M={};for(const C of p)M[C.instanceId]=te(C.defId,E-1);const T=Math.max(0,r.player.energyPerTurn+I-u);r={...r,player:{...r.player,energy:T},combat:{...r.combat,turn:E,phase:"player",intentByEnemy:M}};for(const C of g){const k=L[C.defId],P=C.upgraded&&(k!=null&&k.upgradedPowerTrigger)?k.upgradedPowerTrigger:(k==null?void 0:k.powerTrigger)??[];for(const A of P)if(A.kind==="headroom")r=j(r,ie(A.amount,r.player.statuses));else if(A.kind==="draw")r=H(r,A.amount);else if(A.kind==="applyStatus")if(A.target==="self")if(A.status==="pressure"){const N=r.player.statuses.pressure??0,J=Math.min(4,N+A.stacks)-N;J>0&&(r=D(r,"player",A.status,J))}else r=D(r,"player",A.status,A.stacks);else if(A.target==="all")for(const N of((w=r.combat)==null?void 0:w.enemies)??[])r=D(r,N.instanceId,A.status,A.stacks);else{const N=(x=(v=r.combat)==null?void 0:v.enemies[0])==null?void 0:x.instanceId;N&&(r=D(r,N,A.status,A.stacks))}}for(const C of r.player.relics){const k=q[C];k!=null&&k.onTurnStart&&(r=k.onTurnStart(r))}const z=!!r.player.statuses.burnout;return z&&(r=Z(r,"player","burnout")),r=H(r,Math.max(0,5-(z?1:0))),r}case"USE_HOTFIX":{const{hotfixId:p,targetId:m}=a;if(!e.player.hotfixes.includes(p))return e;const s=oe[p];if(!s)return e;const g=e.player.hotfixes.indexOf(p);let r={...e,player:{...e.player,hotfixes:[...e.player.hotfixes.slice(0,g),...e.player.hotfixes.slice(g+1)]}};for(const y of s.effects)if(y.kind==="burn"){const c=m??((h=(R=r.combat)==null?void 0:R.enemies[0])==null?void 0:h.instanceId);if(c){const I=(_=r.combat)==null?void 0:_.enemies.find(S=>S.instanceId===c),u=ne(y.amount,r.player.statuses,(I==null?void 0:I.statuses)??{});r.player.statuses.confidence&&(r=Z(r,"player","confidence")),r=ve(r,c,u)}}else y.kind==="headroom"&&(r=j(r,ie(y.amount,r.player.statuses)));if(r.combat&&r.combat.enemies.every(y=>y.stability<=0)){const y=r.map.nodes.flat().find(S=>S.id===r.map.currentNodeId);if((y==null?void 0:y.type)==="boss"){if(r.map.act===1){const{nodes:S,state:E}=se(2,r);return{...E,scene:"map",combat:void 0,map:{act:2,nodes:S,currentNodeId:null,visitedNodeIds:[]}}}return{...r,scene:"won",combat:void 0}}if((y==null?void 0:y.type)==="elite"){const[S,E]=de(r);return{...E,scene:"reward",combat:void 0,rewardRelic:S,rewardCards:void 0,credits:r.credits+Se}}const[I,u]=Q(r);return{...u,scene:"reward",combat:void 0,rewardCards:I,credits:r.credits+_e}}return r.player.budget<=0?{...r,scene:"lost",combat:void 0}:r}case"NAVIGATE":{const{nodeId:p}=a,m=e.map.nodes.flat().find(g=>g.id===p);if(!m)return e;let s={...e,map:{...e.map,currentNodeId:p,visitedNodeIds:[...e.map.visitedNodeIds,p]}};switch(m.type){case"combat":case"elite":{const[g,r]=U(s);s=r;const y=he(m.type==="elite"?"elite":"combat",p,s.map.act,g),c=ye(y),I=te(c.defId,0),[u,S]=ae(s.deck,s);s=S;let E={...s,player:{...s.player,energy:s.player.energyPerTurn,headroom:0,hand:[],draw:u,discard:[],statuses:{}}};E=H(E,5);let T={...E,scene:"combat",combat:{enemies:[c],intentByEnemy:{[c.instanceId]:I},activePowers:[],turn:1,phase:"player"}};for(const z of E.player.relics){const C=q[z];C!=null&&C.onCombatStart&&(T=C.onCombatStart(T))}return T}case"boss":{const g=he("boss",p,s.map.act,.5),r=ye(g),y=te(r.defId,0),[c,I]=ae(s.deck,s);s=I;let u={...s,player:{...s.player,energy:s.player.energyPerTurn,headroom:0,hand:[],draw:c,discard:[],statuses:{}}};u=H(u,5);let E={...u,scene:"combat",combat:{enemies:[r],intentByEnemy:{[r.instanceId]:y},activePowers:[],turn:1,phase:"player"}};for(const M of u.player.relics){const T=q[M];T!=null&&T.onCombatStart&&(E=T.onCombatStart(E))}return E}case"rest":return{...s,scene:"rest"};case"shop":{const[g,r]=Q(s,3);return s=r,{...s,scene:"shop",shopCards:g}}case"event":{const[g,r]=U(s);s=r;const y=F[Math.floor(g*F.length)];return{...s,scene:"event",currentEventId:y.id}}case"treasure":{const[g,r]=de(s);return s=r,{...s,scene:"reward",rewardRelic:g,rewardCards:void 0,credits:s.credits+Ge}}default:return{...s,scene:"map"}}}case"PICK_REWARD_CARD":{const{cardInstanceId:p}=a;if(!p)return{...e,scene:"map",rewardCards:void 0};const m=(e.rewardCards??[]).find(s=>s.instanceId===p);return m?{...e,scene:"map",deck:[...e.deck,m],rewardCards:void 0}:e}case"CHOOSE_REST_OPTION":{if(a.option==="refresh"){const s=Math.min(e.player.maxBudget,e.player.budget+Math.floor(e.player.maxBudget*.2));return{...e,scene:"map",player:{...e.player,budget:s}}}const p=e.deck.findIndex(s=>!s.upgraded);if(p===-1)return{...e,scene:"map"};const m=e.deck.map((s,g)=>g===p?{...s,upgraded:!0,name:s.name+"+"}:s);return{...e,scene:"map",deck:m}}case"EVENT_CHOICE":{const p=F.find(y=>y.id===e.currentEventId);if(!p)return{...e,scene:"map",currentEventId:void 0};const m=p.choices[a.choiceIndex];if(!m)return{...e,scene:"map",currentEventId:void 0};let s={...e};const{outcome:g}=m;let r="";if(g.kind==="gainCredits")s={...s,credits:s.credits+g.amount},r=`+${g.amount} credits.`;else if(g.kind==="loseCredits")s={...s,credits:Math.max(0,s.credits-g.amount)},r=`-${g.amount} credits.`;else if(g.kind==="loseMaxBudget"){const y=s.player.maxBudget-g.amount;s={...s,player:{...s.player,maxBudget:y,budget:Math.min(s.player.budget,y)}},r=`Maximum SLO Budget reduced by ${g.amount}. You can feel it.`}else if(g.kind==="addCurse")s={...s,deck:[...s.deck,V("tech_debt")]},r="A Tech Debt curse was added to your deck. It will haunt you.";else if(g.kind==="gainCard"){const[y,c]=Q(s,1,g.rarity);s={...c,deck:[...c.deck,...y]},r=`${(($=y[0])==null?void 0:$.name)??"a card"} was added to your deck.`}else r="Nothing changes. You move on.";return{...s,scene:"event_outcome",eventOutcomeText:r}}case"GO_TO_MAP":return{...e,scene:"map",eventOutcomeText:void 0,currentEventId:void 0};case"LOAD_RUN":return a.state;case"REMOVE_CARD":{if(e.credits<75)return e;const p=e.deck.findIndex(m=>m.instanceId===a.cardInstanceId);return p===-1?e:{...e,credits:e.credits-75,deck:[...e.deck.slice(0,p),...e.deck.slice(p+1)]}}case"BUY_CARD":{const p=(e.shopCards??[]).find(s=>s.instanceId===a.cardInstanceId);if(!p)return e;const m=90;return e.credits<m?e:{...e,credits:e.credits-m,deck:[...e.deck,p],shopCards:(e.shopCards??[]).filter(s=>s.instanceId!==a.cardInstanceId)}}case"PICK_REWARD_RELIC":{const p=e.rewardRelic;return p?{...e,scene:"map",player:{...e.player,relics:[...e.player.relics,p]},rewardRelic:void 0}:{...e,scene:"map"}}case"GO_TO_CODEX":return{...e,scene:"codex",codexReturnScene:a.returnScene};case"CLOSE_CODEX":return{...e,scene:e.codexReturnScene??"map",codexReturnScene:void 0};case"SHOW_UPGRADE_PICKER":return e.deck.some(m=>!m.upgraded&&m.type!=="curse")?{...e,scene:"upgrading"}:{...e,scene:"map"};case"CHOOSE_CARD_TO_UPGRADE":{const p=e.deck.findIndex(g=>g.instanceId===a.cardInstanceId);if(p===-1)return e;const m=e.deck[p],s={...m,upgraded:!0,name:m.name.replace(/\+$/,"")+"+"};return{...e,scene:"map",deck:[...e.deck.slice(0,p),s,...e.deck.slice(p+1)]}}case"BUY_HOTFIX":return e.credits<60||e.player.hotfixes.length>=3||!(a.hotfixId in oe)?e:{...e,credits:e.credits-60,player:{...e.player,hotfixes:[...e.player.hotfixes,a.hotfixId]}};default:return e}}const me="slothespire:run";function Xe(e){try{localStorage.setItem(me,JSON.stringify(e))}catch{console.warn("[slothespire] could not save run")}}function pe(){const e=localStorage.getItem(me);if(!e)return null;try{const a=JSON.parse(e);return Je(a)?a:(ue(),null)}catch{return ue(),null}}const Ve=1;function Je(e){if(typeof e!="object"||e===null)return!1;const a=e;return typeof a.scene=="string"&&typeof a.meta=="object"&&a.meta!==null&&typeof a.meta.seed=="string"&&a.version===Ve}function ue(){localStorage.removeItem(me)}function Ze(e,a){const t=pe()!==null,o=document.createElement("div");o.className="scene-title",o.innerHTML=`
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
  `,o.querySelector('[data-action="new-run"]').addEventListener("click",()=>a({type:"START_RUN"})),o.querySelector('[data-action="codex"]').addEventListener("click",()=>a({type:"GO_TO_CODEX",returnScene:"title"}));const n=o.querySelector('[data-action="continue"]');return n&&!n.disabled&&n.addEventListener("click",()=>{const i=pe();i&&a({type:"LOAD_RUN",state:i})}),o}function Ce(e){if(!e)return{icon:"?",text:"Unknown",colorClass:"intent-unknown"};switch(e.kind){case"burn":return{icon:"⚔",text:String(e.amount),colorClass:"intent-burn"};case"harden":return{icon:"🛡",text:String(e.amount),colorClass:"intent-harden"};case"buff":return{icon:"⬆",text:e.status,colorClass:"intent-buff"};case"debuff":return{icon:"⬇",text:e.status,colorClass:"intent-debuff"};case"multi":return{icon:"✦",text:e.label,colorClass:"intent-multi"};case"unknown":return{icon:"?",text:"...",colorClass:"intent-unknown"}}}function Qe(e){switch(e){case"attack":return{icon:"⚔",colorClass:"icon-burn"};case"skill":return{icon:"🛡",colorClass:"icon-harden"};case"power":return{icon:"✦",colorClass:"icon-multi"};case"curse":return{icon:"☠",colorClass:"icon-danger"};case"status":return{icon:"⚡",colorClass:"icon-buff"}}}function et(e,a,t){const o=L[e.defId],{icon:n,colorClass:i}=Qe(e.type),l=(o==null?void 0:o.effects.map(b=>b.kind==="burn"?`Burn ${b.amount}`:b.kind==="headroom"?`+${b.amount} Headroom`:b.kind==="draw"?`Draw ${b.amount}`:"").join(". "))??"",f=document.createElement("div");return f.className="sc-card",f.innerHTML=`
    <div class="sc-card-cost">${e.cost}</div>
    <div class="sc-card-name">${e.name}</div>
    <div class="sc-card-art ${i}">${n}</div>
    <div class="sc-card-text">${l}</div>
  `,f.addEventListener("click",()=>a({type:"PLAY_CARD",cardInstanceId:e.instanceId,targetId:t})),f}function tt(e,a){var y;const t=document.createElement("div");if(t.className="scene-combat",!e.combat)return t.textContent="No combat in progress.",t;const{enemies:o,intentByEnemy:n,turn:i}=e.combat,l=o[0],f=(l==null?void 0:l.instanceId)??null,{hand:b,draw:d,discard:w,exhaust:v,budget:x,maxBudget:R,energy:h,energyPerTurn:_,headroom:$}=e.player,p=o.map(c=>{const I=n[c.instanceId],{icon:u,text:S,colorClass:E}=Ce(I),M=Math.round(c.stability/c.maxStability*100),T=Object.entries(c.statuses).filter(([,k])=>(k??0)>0).map(([k,P])=>`<span class="sc-status-pill">${k.replace(/_/g," ")} ${P}</span>`).join(""),z=e.player.statuses.observability??0,C=z>0?Array.from({length:Math.min(z,3)},(k,P)=>{const A=e.combat.turn+P,N=te(c.defId,A),{icon:J,text:De}=Ce(N);return`<div class="sc-intent-future" title="Turn +${P+1}">${J} ${De}</div>`}).join(""):"";return`
      <div class="sc-enemy" data-enemy-id="${c.instanceId}">
        <div class="sc-intent ${E}">${u} ${S}</div>
        ${C}
        <div class="sc-sprite">▲</div>
        <div class="sc-enemy-name">${c.name}</div>
        <div class="sc-stab-bar"><div class="sc-stab-fill" style="width:${M}%"></div></div>
        <div class="sc-enemy-hp">${c.stability} / ${c.maxStability}</div>
        <div class="sc-status-pills">${T}</div>
      </div>
    `}).join(""),m=Object.entries(e.player.statuses).filter(([,c])=>(c??0)>0).map(([c,I])=>`<span class="sc-status-pill sc-status-player">${c.replace(/_/g," ")} ${I}</span>`).join(""),s=e.combat.activePowers.length>0?e.combat.activePowers.map(c=>`<span class="sc-power-pill">${c.name}</span>`).join(" "):"<span style='opacity:0.3;font-size:10px'>no active powers</span>",g=[0,1,2].map(c=>{const I=e.player.hotfixes[c],u=I?oe[I]:null;return u?`<button class="sc-hotfix-btn" data-hotfix="${I}">${u.name.replace(" Hotfix","")}</button>`:'<div class="sc-hotfix-empty">HOTFIX<br>—</div>'}).join("");t.innerHTML=`
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
      .sc-intent-future {
        font-family: var(--font-display); font-size: 9px; padding: 2px 6px;
        opacity: 0.45; color: var(--color-text-dim); letter-spacing: 0.5px;
        font-style: italic;
      }
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
      <span class="turn">TURN ${i}</span>
    </div>

    <div class="sc-piles">
      <div class="sc-pile">DRAW<div class="sc-pile-n">${d.length}</div></div>
      <div class="sc-pile">DISC<div class="sc-pile-n">${w.length}</div></div>
      <div class="sc-pile">EXHL<div class="sc-pile-n">${v.length}</div></div>
      ${g}
    </div>

    <div class="sc-enemies">${p}</div>

    <div class="sc-play"><div class="sc-power-zone">POWERS: ${s}</div></div>

    <div class="sc-hand" id="sc-hand-slot"></div>

    <div class="sc-stats">
      <div>
        <div class="sc-budget-label">SLO BUDGET</div>
        <div class="sc-budget-bar">
          <div class="sc-budget-fill" style="width:${Math.round(x/R*100)}%"></div>
        </div>
        <div class="sc-budget-num">${x} / ${R}</div>
      </div>
      <div class="sc-headroom">HEADROOM<br><b>${$}</b></div>
      <div class="sc-player-statuses">${m||"<span style='opacity:0.4;font-size:9px'>no statuses</span>"}</div>
    </div>

    <div class="sc-action">
      <div class="sc-energy-label">ENERGY</div>
      <div class="sc-energy-orb">${h}<span style="font-size:9px;opacity:0.7">/${_}</span></div>
      <button class="sc-end-turn" id="sc-end-turn">END TURN ▶</button>
    </div>

    <div class="sc-foot">
      <button class="sc-footer-btn" id="sc-codex-btn">📖 Codex</button>
      <span>⏸ Pause</span>
      <span class="right">seed: ${e.meta.seed}</span>
    </div>
  `;const r=t.querySelector("#sc-hand-slot");for(const c of b)r.appendChild(et(c,a,f));return t.querySelector("#sc-end-turn").addEventListener("click",()=>a({type:"END_TURN"})),(y=t.querySelector("#sc-codex-btn"))==null||y.addEventListener("click",()=>a({type:"GO_TO_CODEX",returnScene:"combat"})),t.querySelectorAll(".sc-hotfix-btn").forEach(c=>{c.addEventListener("click",()=>a({type:"USE_HOTFIX",hotfixId:c.dataset.hotfix,targetId:f}))}),t}function at(e,a){const t=document.createElement("div");t.className="scene-end";const o=e.scene==="won",n=o?"RUN COMPLETE":"BUDGET BREACHED",i=o?"You held the SLO. The sloths sleep easier tonight.":"Service degraded. Customers noticed. Postmortem next sprint.";return t.innerHTML=`
    <style>
      .scene-end {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 24px; text-align: center;
      }
      .scene-end h2 {
        font-size: 40px; letter-spacing: 4px;
        color: ${o?"var(--color-accent)":"var(--color-danger)"};
        text-shadow: ${o?"var(--glow-accent)":"var(--glow-danger)"};
        margin: 0;
      }
      .scene-end .flavor {
        max-width: 400px; opacity: 0.8;
        font-family: var(--font-display); font-size: 13px; line-height: 1.5;
      }
    </style>
    <h2>${n}</h2>
    <div class="flavor">${i}</div>
    <button class="primary" data-action="return-title">RETURN TO TITLE</button>
  `,t.querySelector('[data-action="return-title"]').addEventListener("click",()=>a({type:"RETURN_TO_TITLE"})),t}const ot={combat:"⚔",elite:"☠",rest:"✝",shop:"⚙",event:"?",treasure:"🎁",boss:"👑"},Ee={combat:"Combat",elite:"Elite",rest:"Postmortem",shop:"Build Server",event:"Incident",treasure:"Treasure",boss:"BOSS"};function rt(e,a){var d;const t=document.createElement("div");t.className="scene-map";const{nodes:o,currentNodeId:n,visitedNodeIds:i,act:l}=e.map,f=new Set;if(!n)(d=o[0])==null||d.forEach(w=>f.add(w.id));else{const w=o.flat().find(v=>v.id===n);w==null||w.next.forEach(v=>f.add(v))}const b=[...o].reverse().map(w=>`<div class="map-row">${w.map(x=>{const R=i.includes(x.id),h=f.has(x.id),_=x.id===n;return`
        <div class="${["map-node",x.type,R?"visited":"",h?"reachable":"",_?"current":""].filter(Boolean).join(" ")}" data-node-id="${x.id}" title="${Ee[x.type]}">
          <div class="node-icon">${ot[x.type]}</div>
          <div class="node-label">${Ee[x.type]}</div>
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
    <div class="map-header">// ACT ${l} · ${l===1?"Single-Service SLO":"User-Journey SLO"}</div>
    <div class="map-rows">${b}</div>
    <div class="map-footer">
      <span>SLO BUDGET <b>${e.player.budget}/${e.player.maxBudget}</b></span>
      <span>DECK <b>${e.deck.length}</b></span>
      <span class="credits">CREDITS <b>${e.credits}</b></span>
    </div>
  `,t.querySelectorAll(".map-node.reachable").forEach(w=>{w.addEventListener("click",()=>{a({type:"NAVIGATE",nodeId:w.dataset.nodeId})})}),t}function nt(e,a){const t=document.createElement("div");if(t.className="scene-reward",e.rewardRelic){const i=q[e.rewardRelic];return t.innerHTML=`
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
        <div class="relic-name">${(i==null?void 0:i.name)??e.rewardRelic}</div>
        <div class="relic-product">${(i==null?void 0:i.product)??""}</div>
        <div class="relic-desc">${(i==null?void 0:i.description)??""}</div>
        <div class="relic-flavor">"${(i==null?void 0:i.flavor)??""}"</div>
      </div>
      <button id="accept-relic" class="primary" style="font-family:var(--font-display);font-size:13px;letter-spacing:1px;">ACCEPT RELIC</button>
    `,t.querySelector("#accept-relic").addEventListener("click",()=>a({type:"PICK_REWARD_RELIC"})),t}const n=(e.rewardCards??[]).map(i=>{const l=L[i.defId],f=(l==null?void 0:l.effects.map(d=>d.kind==="burn"?`Burn ${d.amount}`:d.kind==="headroom"?`+${d.amount} Headroom`:d.kind==="draw"?`Draw ${d.amount}`:d.kind==="selfBurn"?`Self-Burn ${d.amount}`:d.kind==="applyStatus"?`Apply ${d.status.replace(/_/g," ")} ×${d.stacks}`:d.kind==="restoreBudget"?`Restore ${d.amount} Budget`:"").filter(Boolean).join(". "))??"",b=i.type==="attack"?"⚔":i.type==="power"?"✦":"🛡";return`
      <div class="reward-card" data-card-id="${i.instanceId}">
        <div class="rc-cost">${i.cost<0?"!":i.cost}</div>
        <div class="rc-name">${i.name}</div>
        <div class="rc-art">${b}</div>
        <div class="rc-text">${f||(l==null?void 0:l.flavor)||""}</div>
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
  `,t.querySelectorAll(".reward-card").forEach(i=>{i.addEventListener("click",()=>a({type:"PICK_REWARD_CARD",cardInstanceId:i.dataset.cardId}))}),t.querySelector("#skip-reward").addEventListener("click",()=>a({type:"PICK_REWARD_CARD",cardInstanceId:null})),t}function it(e,a){const t=document.createElement("div");t.className="scene-rest";const o=Math.floor(e.player.maxBudget*.2),n=Math.min(e.player.maxBudget,e.player.budget+o)-e.player.budget,i=e.deck.find(l=>!l.upgraded);return t.innerHTML=`
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
      <div class="rest-choice ${i?"":"disabled"}" data-option="upgrade">
        <h3>Upgrade</h3>
        <p>${i?`Upgrade: ${i.name}`:"Nothing upgradeable"}</p>
      </div>
    </div>
  `,t.querySelectorAll(".rest-choice:not(.disabled)").forEach(l=>{l.addEventListener("click",()=>{l.dataset.option==="upgrade"?a({type:"SHOW_UPGRADE_PICKER"}):a({type:"CHOOSE_REST_OPTION",option:"refresh"})})}),t}const Ae=`
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
`;function st(e,a){const t=document.createElement("div");t.className="scene-event";const o=F.find(i=>i.id===e.currentEventId)??F[0],n=o.choices.map((i,l)=>`
    <button class="event-choice" data-idx="${l}">${i.text}</button>
  `).join("");return t.innerHTML=`
    <style>${Ae}</style>
    <div class="event-card">
      <div class="event-title">// ${o.title.toUpperCase()}</div>
      <div class="event-text">${o.text}</div>
    </div>
    <div class="event-choices">${n}</div>
  `,t.querySelectorAll(".event-choice").forEach(i=>{i.addEventListener("click",()=>a({type:"EVENT_CHOICE",choiceIndex:parseInt(i.dataset.idx)}))}),t}function ct(e,a){const t=document.createElement("div");t.className="scene-event";const o=F.find(i=>i.id===e.currentEventId),n=e.eventOutcomeText??"Nothing changes.";return t.innerHTML=`
    <style>${Ae}</style>
    ${o?`
    <div class="event-card" style="border-color:var(--color-border-low)">
      <div class="event-title">// ${o.title.toUpperCase()}</div>
      <div class="event-text">${o.text}</div>
    </div>`:""}
    <div class="event-outcome-box">
      <div class="event-outcome-label">// OUTCOME</div>
      <div class="event-outcome-text">${n}</div>
    </div>
    <button class="event-outcome-continue primary" id="continue-btn">CONTINUE →</button>
  `,t.querySelector("#continue-btn").addEventListener("click",()=>a({type:"GO_TO_MAP"})),t}function Ie(e,a,t,o){return`
    <div class="shop-row">
      <span class="sr-cost">${e.cost<0?"☠":e.cost}${e.upgraded?"+":""}</span>
      <span class="sr-name">${e.name}</span>
      <span class="sr-type">${e.type}</span>
      <button class="${a}" data-id="${e.instanceId}" ${o?"disabled":""}>${t}</button>
    </div>
  `}function dt(e,a){const t=document.createElement("div");t.className="scene-shop";const o=e.shopCards??[],n=90,i=75,l=o.length>0?o.map(d=>Ie(d,"buy-btn",`BUY (${n}¢)`,e.credits<n)).join(""):'<span class="shop-empty">No cards in stock</span>',f=Object.values(oe).map(d=>{const w=e.player.hotfixes.includes(d.id),v=e.player.hotfixes.length>=3,x=e.credits<60,R=w||v||x,h=w?"owned":v?"slots full":x?"insufficient ¢":"";return`
      <div class="shop-row">
        <span class="sr-cost">💊</span>
        <span class="sr-name">${d.name}</span>
        <span class="sr-type">hotfix</span>
        <button class="buy-btn" data-hotfix="${d.id}" ${R?"disabled":""}>
          BUY (60¢)${h?` — ${h}`:""}
        </button>
      </div>
    `}).join(""),b=e.deck.map(d=>Ie(d,"remove-btn",`Remove (${i}¢)`,e.credits<i)).join("");return t.innerHTML=`
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
    ${l}
    <div class="shop-section">HOTFIXES — 60¢ each</div>
    ${f}
    <div class="shop-section">YOUR DECK — Remove a Card (${i}¢)</div>
    ${b}
    <button class="shop-leave" id="leave-shop">LEAVE SHOP</button>
  `,t.querySelectorAll(".buy-btn:not([disabled])[data-id]").forEach(d=>{d.addEventListener("click",()=>a({type:"BUY_CARD",cardInstanceId:d.dataset.id}))}),t.querySelectorAll("[data-hotfix]:not([disabled])").forEach(d=>{d.addEventListener("click",()=>a({type:"BUY_HOTFIX",hotfixId:d.dataset.hotfix}))}),t.querySelectorAll(".remove-btn:not([disabled])").forEach(d=>{d.addEventListener("click",()=>a({type:"REMOVE_CARD",cardInstanceId:d.dataset.id}))}),t.querySelector("#leave-shop").addEventListener("click",()=>a({type:"GO_TO_MAP"})),t}const Te={manual_fix:{id:"manual_fix",kind:"card",name:"Manual Fix",description:"1 Energy · Attack · Burn 6 (Upgraded: 9)",realConcept:"A manual fix is the on-call engineer's first tool: directly intervening to stop the bleeding without addressing root cause. In SRE practice, manual fixes are tracked as toil — necessary but unsustainable. Every manual fix should generate a follow-up ticket: automate the detection, the response, or both. The goal is to make this card unnecessary by the end of the run.",docsLink:"https://sre.google/sre-book/eliminating-toil/"},circuit_breaker:{id:"circuit_breaker",kind:"card",name:"Circuit Breaker",description:"1 Energy · Skill · +8 Headroom (Upgraded: +12)",realConcept:"A circuit breaker pattern stops calls to a failing downstream dependency after a failure threshold is crossed, preventing cascading failures. When open, requests fail fast instead of waiting. After a timeout, it enters half-open state: one probe request decides whether to close (recover) or stay open. Named after the electrical safety device — it breaks the circuit before the system burns out.",docsLink:"https://martinfowler.com/bliki/CircuitBreaker.html"},canary_deploy:{id:"canary_deploy",kind:"card",name:"Canary Deploy",description:"1 Energy · Attack · Burn 5, Draw 1 (Upgraded: Burn 8)",realConcept:"Canary deployment routes a small percentage of traffic (1-5%) to a new version before a full rollout. Like miners sending canaries into coal mines to detect gas, canary deploys surface problems before they affect all users. Key metrics to watch: error rate, latency, and any SLO-relevant signals. If the canary dies, roll back immediately. If it survives, gradually shift more traffic.",docsLink:"https://docs.datadoghq.com/monitors/"},postmortem:{id:"postmortem",kind:"card",name:"Blameless Postmortem",description:"2 Energy · Skill · Exhaust · Restore 12 Budget",realConcept:"A blameless postmortem focuses on system failures rather than individual blame. The 5 Whys, timeline reconstruction, and action items are all about making the system more resilient — not finding who to punish. Google SRE formalized this: the goal is learning, not punishment. Postmortems should be shared widely; a failure only experienced by one team is a failure experienced by everyone eventually.",docsLink:"https://sre.google/sre-book/postmortem-culture/"},chaos_engineering:{id:"chaos_engineering",kind:"card",name:"Chaos Engineering",description:"2 Energy · Skill · Apply Customer-Facing 3 to all, Self-Burn 5",realConcept:"Chaos engineering deliberately injects failures into production systems to expose weaknesses before they cause unplanned outages. The principle: it's better to break things on purpose during business hours than to be surprised at 3am. Netflix's Chaos Monkey randomly terminates EC2 instances in production. The practice requires robust monitoring — you need to observe the failure, not just cause it.",docsLink:"https://principlesofchaos.org/"},failover:{id:"failover",kind:"card",name:"Failover",description:"1 Energy · Skill · +5 Headroom (Upgraded: +8)",realConcept:"Failover is the automatic or manual switching to a redundant system when the primary fails. Active-passive failover keeps a standby ready but idle; active-active runs parallel. The SRE question: how long does failover take, and is that acceptable to your SLO? Headroom in Slothespire represents the buffer you buy when you route around a failing component.",docsLink:"https://docs.datadoghq.com/reliability_engineering/"},rollback:{id:"rollback",kind:"card",name:"Rollback",description:"1 Energy · Attack · Burn 8 (Upgraded: 11)",realConcept:"A rollback reverts a deployment to a previous known-good version. It's one of the fastest ways to stop the bleeding during an incident caused by a bad deploy. Prerequisites: immutable artifacts, tested rollback procedures, and confidence that the previous version is actually safe. Rollbacks are not always possible (database migrations, in-flight transactions), which is why forward fixes sometimes matter more.",docsLink:"https://docs.datadoghq.com/continuous_delivery/"},graceful_degradation:{id:"graceful_degradation",kind:"card",name:"Graceful Degradation",description:"1 Energy · Skill · +9 Headroom (Upgraded: +12)",realConcept:"Graceful degradation means a system continues operating at reduced capacity when parts fail, rather than failing completely. A recommendation engine going down shouldn't take down the checkout flow. Techniques: fallback responses, feature flags to disable non-critical paths, circuit breakers on non-essential services. The key question: what's the minimum viable version of this service?"},pager:{id:"pager",kind:"relic",name:"Pager",description:"At start of your turn, if SLO Budget ≤ 30%, draw 1 extra card.",realConcept:"The on-call pager is the entry point for every incident. Effective paging means: actionable alerts (not informational noise), clear runbook links, and right-person routing. When budget (error budget) is low, the pager fires faster — you need more resources to respond. The Pager relic reflects this: low budget state triggers enhanced draw, simulating the surge of attention that a real pager generates.",docsLink:"https://sre.google/sre-book/being-on-call/"},apm_tracing:{id:"apm_tracing",kind:"relic",name:"APM Tracing",description:"At start of combat, gain Observability 2.",realConcept:"Application Performance Monitoring distributed tracing follows a request as it traverses multiple services, recording timing and metadata at each hop. With APM, you can pinpoint which service introduced latency or generated an error. Datadog APM uses auto-instrumentation to capture spans without code changes. The Observability status in Slothespire represents what APM gives you: visibility into what's coming before it hits.",docsLink:"https://docs.datadoghq.com/tracing/"},watchdog:{id:"watchdog",kind:"relic",name:"Watchdog",description:"At start of combat, apply Customer-Facing 1 to the highest-stability enemy.",realConcept:"Datadog Watchdog automatically detects anomalies in metrics, traces, and logs using ML algorithms — without you having to define alert thresholds. It surfaces unusual patterns: a sudden spike in error rate, unexpected latency increase, or abnormal resource utilization. In Slothespire, Watchdog targets the toughest enemy with Customer-Facing — making the most threatening problem exploitable by your next attack.",docsLink:"https://docs.datadoghq.com/watchdog/"},live_tail:{id:"live_tail",kind:"relic",name:"Live Tail",description:"At start of combat, draw 1 extra card.",realConcept:"Datadog Live Tail streams logs in real time as they are ingested, with no indexing delay. During an incident, Live Tail is often the first tool you reach for: it shows exactly what's happening right now, before you've had time to build a proper query. The extra card in Slothespire represents the immediate situational awareness Live Tail gives you at the start of a fight.",docsLink:"https://docs.datadoghq.com/logs/live_tail/"},flapping_health_check:{id:"flapping_health_check",kind:"enemy",name:"Flapping Health Check",description:"Stability 20 · Burns 6 and 4 alternating",realConcept:"A flapping health check oscillates between passing and failing without a clear root cause. Common causes: resource contention, network jitter, slow disk I/O, or an overly tight timeout. Flapping checks generate alert fatigue — the on-call learns to ignore them, which is dangerous. Fix: add hysteresis (require N failures before alerting), tune timeouts, and investigate the underlying cause.",docsLink:"https://docs.datadoghq.com/monitors/configuration/"},memory_leak:{id:"memory_leak",kind:"enemy",name:"Memory Leak",description:"Stability 36 · Stacks Pressure over time",realConcept:"A memory leak occurs when a program allocates memory but never frees it, causing memory usage to grow until the process crashes. In long-running services, even small leaks accumulate. Key signals: steadily rising heap usage, degrading GC performance, eventual OOM kills. Mitigation: profiling tools (Datadog Continuous Profiler shows heap allocation hotspots), memory limit caps, and scheduled restarts as a short-term workaround.",docsLink:"https://docs.datadoghq.com/profiler/"},the_pager_storm:{id:"the_pager_storm",kind:"enemy",name:"The Pager Storm",description:"Stability 75 · Burns hard, applies On-Call Fatigue, scales Pressure",realConcept:"Alert fatigue occurs when on-call engineers receive so many alerts that they stop treating each one with urgency. A pager storm — hundreds of alerts triggered by a single root cause — is one of the most dangerous failure modes. The correct response: triage, not reaction. Find the root cause; silence derivative alerts. The Pager Storm boss teaches this: brute-forcing through every alert in phase 1 leaves you depleted for phase 2.",docsLink:"https://docs.datadoghq.com/monitors/manage/"},zombie_process:{id:"zombie_process",kind:"enemy",name:"Zombie Process",description:"Stability 18 · Applies Toil debuff",realConcept:"A zombie process has finished execution but still has an entry in the process table because its parent hasn't read its exit status. In large numbers they waste PID space. More broadly, zombie processes are a metaphor for technical debt: the work is done, but the cleanup wasn't. They apply Toil in Slothespire because managing them costs energy without addressing any real problem."},cascading_failure:{id:"cascading_failure",kind:"enemy",name:"Cascading Failure",description:"Stability 55 (Elite) · Stacks Pressure each turn",realConcept:"A cascading failure starts small and amplifies: one service slows under load, its callers time out and retry, increasing load further, eventually bringing down the whole system. Prevention: circuit breakers, rate limiting, load shedding, bulkheads. In Slothespire, Cascading Failure stacks Pressure — representing how the pressure from each failure makes subsequent failures harder and harder to contain."},cron_storm:{id:"cron_storm",kind:"enemy",name:"Cron Storm",description:"Stability 24 · Triple burn pattern",realConcept:"A cron storm occurs when many cron jobs are scheduled to run at the same time (midnight, top of the hour), creating synchronized load spikes. The fix: stagger job start times, add jitter, and monitor for resource contention. Cron Storm in Slothespire attacks in rapid bursts — three hits in a pattern — reflecting how synchronized load creates sudden, overlapping pressure rather than steady predictable load."},deadlock:{id:"deadlock",kind:"enemy",name:"Deadlock",description:"Stability 30 · Applies Toil 2 then burns hard",realConcept:"A deadlock occurs when two or more processes each wait for a resource held by the other, creating a circular dependency that can never resolve. Classic symptoms: threads stuck at 100% CPU but making no progress, or hanging database queries. Prevention: consistent lock ordering, timeouts on all waits, deadlock detection algorithms. In Slothespire, Deadlock taxes your energy first (Toil), then hits hard — you're stuck and taking damage."},total_outage:{id:"total_outage",kind:"enemy",name:"Total Outage",description:"Stability 100 (Act II Boss) · Escalating burns + debuffs",realConcept:"A total outage is the worst-case scenario: all or most of a service's functionality is unavailable to users. Root causes vary — hardware failure, bad deploy, cascading dependency failures, DDoS — but the response is consistent: establish communication, triage severity, engage the right people, resolve, and write a postmortem. Total Outage in Slothespire teaches graceful degradation: you cannot prevent all the damage, but you can survive it with the right combination of headroom and targeted responses."},synthetic_tests:{id:"synthetic_tests",kind:"relic",name:"Synthetic Tests",description:"At start of each turn, gain 1 Headroom.",realConcept:"Datadog Synthetic Monitoring continuously runs scripted tests against your APIs and UIs from locations around the world — whether or not a real user is triggering them. It's the difference between reactive monitoring (someone reports it's broken) and proactive monitoring (you know it's broken first). The Headroom every turn in Slothespire reflects what synthetic tests give you: a baseline buffer before the real traffic hits.",docsLink:"https://docs.datadoghq.com/synthetics/"},error_tracking:{id:"error_tracking",kind:"relic",name:"Error Tracking",description:"At start of combat, apply Customer-Facing 1 to all enemies.",realConcept:"Datadog Error Tracking groups, deduplicates, and prioritizes errors across your services. Without it, every unique stack trace looks like a new incident — with it, you see that 500 occurrences are the same root cause. The relic applies Customer-Facing to all enemies because Error Tracking surfaces which problems are user-visible: those are the ones that hurt your SLO fastest and deserve your first attack.",docsLink:"https://docs.datadoghq.com/error_tracking/"},dashboards:{id:"dashboards",kind:"relic",name:"Dashboards",description:"At start of each turn, gain 1 Headroom.",realConcept:"Datadog Dashboards centralize metrics, logs, traces, and events into a single pane of glass. Well-built dashboards let an on-call engineer orient in seconds rather than minutes during an incident: budget burn rate, error rates, latency percentiles, and infrastructure health in one view. The steady Headroom every turn represents operational situational awareness — you're never caught completely off guard.",docsLink:"https://docs.datadoghq.com/dashboards/"},service_catalog:{id:"service_catalog",kind:"relic",name:"Service Catalog",description:"At start of combat, gain Observability 1.",realConcept:`Datadog Service Catalog tracks ownership, dependencies, documentation, and SLOs for every service in your organization. When an incident starts, the first question is often "who owns this?" — Service Catalog answers it immediately. Observability in Slothespire means seeing intent ahead; similarly, knowing your service graph means knowing what's likely to fail next and who to page.`,docsLink:"https://docs.datadoghq.com/service_catalog/"},incident_management:{id:"incident_management",kind:"relic",name:"Incident Management",description:"At start of combat, gain Confidence 1.",realConcept:"Datadog Incident Management provides structured workflows for declaring, triaging, communicating, and resolving incidents. Having a framework — even under pressure — improves outcomes: clear ownership, status updates, timeline tracking, and post-mortem linkage. Confidence in Slothespire doubles your next attack. Starting an incident with a proper management process gives you exactly that: the confidence to act decisively rather than reactively.",docsLink:"https://docs.datadoghq.com/service_management/incident_management/"},workflow_automation:{id:"workflow_automation",kind:"relic",name:"Workflow Automation",description:"At start of combat, gain 6 Headroom.",realConcept:"Datadog Workflow Automation lets you build automated runbooks triggered by monitors, incidents, or security signals. When a P1 fires, automation can already be silencing duplicate alerts, gathering diagnostic data, and paging the right team — before a human has clicked anything. The upfront Headroom in Slothespire represents the buffer automation creates: you start from a position of stability rather than immediately scrambling.",docsLink:"https://docs.datadoghq.com/service_management/workflows/"},notebooks:{id:"notebooks",kind:"relic",name:"Notebooks",description:"At start of combat, draw 1 extra card.",realConcept:"Datadog Notebooks are collaborative, living documents that mix graphs, logs, and narrative text. During incidents they serve as a shared investigation surface — anyone can see what's been tried, what the data shows, and what's still unknown. After incidents they become the foundation for postmortems. The extra card at combat start reflects what a good incident notebook gives you: more information and more options from the opening move.",docsLink:"https://docs.datadoghq.com/notebooks/"},cloud_cost_mgmt:{id:"cloud_cost_mgmt",kind:"relic",name:"Cloud Cost Mgmt",description:"At start of each turn, gain 5 Credits.",realConcept:"Datadog Cloud Cost Management provides visibility into cloud spending, allocates costs to teams and services, and surfaces optimization opportunities. Idle resources, over-provisioned instances, and wasted reserved capacity all show up here. In Slothespire, credits represent the operational budget you have to invest in improvements — Cloud Cost Management generates steady credits because reducing waste creates a compounding economic advantage over time.",docsLink:"https://docs.datadoghq.com/cloud_cost_management/"},rum:{id:"rum",kind:"relic",name:"RUM",description:"At start of each turn, if hand size < 3, draw 1 card.",realConcept:"Datadog Real User Monitoring captures what actual users experience: page load times, JavaScript errors, user journeys, and frustration signals. Backend metrics look healthy but users are rage-clicking? RUM shows you. It's the empathy layer of observability — reminding you that SLOs exist to protect real people. When your hand is small (options are limited), RUM draws you a card: sometimes insight about the user experience reveals a path you hadn't considered.",docsLink:"https://docs.datadoghq.com/real_user_monitoring/"},sensitive_data_scanner:{id:"sensitive_data_scanner",kind:"relic",name:"Sensitive Data Scanner",description:"At start of combat, remove the first curse from your deck (if any).",realConcept:"Datadog Sensitive Data Scanner scans logs and events in real time to detect and redact sensitive information — PII, credit card numbers, API keys — before they're stored or indexed. A secret in your logs is technical debt waiting to become a security incident. The relic removes a curse from your deck at combat start: it finds and eliminates the hidden liability before the fight escalates, exactly as SDS removes data risk before it compounds.",docsLink:"https://docs.datadoghq.com/sensitive_data_scanner/"},continuous_profiler:{id:"continuous_profiler",kind:"relic",name:"Continuous Profiler",description:"At start of combat, gain Pressure 1.",realConcept:"Datadog Continuous Profiler shows code-level performance at all times — which functions consume the most CPU, memory, or I/O — with near-zero overhead in production. Unlike ad-hoc profiling sessions, it's always running, so you capture the slow path even if it only happens under specific load patterns. Pressure in Slothespire adds flat damage to every attack; the Continuous Profiler gives you constant situational advantage — every action you take is informed by deep system knowledge.",docsLink:"https://docs.datadoghq.com/profiler/"},phantom_read:{id:"phantom_read",kind:"enemy",name:"Phantom Read",description:"Stability 16 · Burns and applies Throttled",realConcept:"A phantom read occurs in database transactions when a query returns different rows on successive reads within the same transaction, because another transaction inserted or deleted matching rows in between. It's one of the classic database isolation anomalies. The Throttled debuff in Slothespire reflects what phantom reads do in practice: they create inconsistent views that slow down your decision-making and force you to re-read, costing you efficiency when you can least afford it."},stale_cache:{id:"stale_cache",kind:"enemy",name:"Stale Cache",description:"Stability 22 · Buffs itself with Pressure then burns hard",realConcept:"A stale cache serves outdated data after the source has changed, often because TTL (time-to-live) was set too high or invalidation logic was missed. Worse, a stale cache can mask a broken backend — everything looks fine until the cache expires and the real problem surfaces suddenly. Stale Cache buffs itself before attacking: the problem has been quietly accumulating damage multipliers while you thought everything was fine, then hits hard when the cache finally breaks."},misconfigured_tls:{id:"misconfigured_tls",kind:"enemy",name:"Misconfigured TLS",description:"Stability 20 · Applies Toil then burns",realConcept:"A misconfigured TLS certificate — expired, self-signed, wrong domain, weak cipher — can silently fail clients, cause mysterious connection errors, or expose traffic to interception. The operational cost is high: debugging TLS issues is time-consuming (Toil), and the errors are often cryptic. In Slothespire, Misconfigured TLS first applies Toil (draining your energy), then attacks — representing how TLS problems exhaust on-call before the actual damage becomes apparent."}},Re="slothespire:codex";let G=null;function ge(){if(G!==null)return G;try{const e=localStorage.getItem(Re);G=new Set(e?JSON.parse(e):[])}catch{G=new Set}return G}function lt(e){try{localStorage.setItem(Re,JSON.stringify([...e]))}catch{}}function ee(e){return ge().has(e)}function K(e){const a=ge();a.has(e)||(a.add(e),lt(a))}function pt(){return[...ge()]}function ut(e,a){const t=document.createElement("div");t.className="scene-codex";const o=Object.keys(L).filter(h=>L[h].type!=="status"&&L[h].type!=="curse"||h==="tech_debt"),n=Object.keys(q),i=Object.keys(re);function l(h,_){var $,p,m;return _==="card"?(($=L[h])==null?void 0:$.name)??h:_==="relic"?((p=q[h])==null?void 0:p.name)??h:((m=re[h])==null?void 0:m.name)??h}function f(h,_){return h.map($=>{const p=ee($),m=Te[$],s=(m==null?void 0:m.name)??l($,_);return`
        <div class="codex-tile ${p?"unlocked":"locked"}" data-entry="${$}" data-kind="${_}">
          <div class="ct-icon">${p?_==="relic"?"✦":_==="enemy"?"▲":"⚔":"?"}</div>
          <div class="ct-name">${p?s:"???"}</div>
        </div>
      `}).join("")}function b(h){const _=Te[h];return _?`
      <h3 class="cd-name">${_.name}</h3>
      <p class="cd-desc">${_.description}</p>
      <div class="cd-divider"></div>
      <h4 class="cd-concept-label">THE REAL CONCEPT</h4>
      <p class="cd-concept">${_.realConcept}</p>
      ${_.docsLink?`<a class="cd-link" href="${_.docsLink}" target="_blank" rel="noopener">↗ Learn more</a>`:""}
    `:'<p style="opacity:0.4;font-size:11px;font-family:var(--font-display)">Entry not yet written.<br>Check back after a future update.</p>'}const d=pt().length,w=o.length+n.length+i.length;t.innerHTML=`
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
      <span class="count">${d} / ${w} discovered</span>
      <input class="codex-search" id="codex-search" placeholder="Search..." />
      <button class="codex-back" id="codex-back">← BACK</button>
    </div>
    <div class="codex-tabs">
      <div class="codex-tab active" data-tab="cards">CARDS (${o.filter(ee).length}/${o.length})</div>
      <div class="codex-tab" data-tab="relics">RELICS (${n.filter(ee).length}/${n.length})</div>
      <div class="codex-tab" data-tab="enemies">ENEMIES (${i.filter(ee).length}/${i.length})</div>
    </div>
    <div class="codex-grid" id="codex-grid">${f(o,"card")}</div>
    <div class="codex-detail" id="codex-detail"><p style="opacity:0.4;font-size:10px;font-family:var(--font-display)">Select an entry to read more.</p></div>
  `;let v=o,x="card";function R(){t.querySelectorAll(".codex-tile.unlocked").forEach(h=>{h.addEventListener("click",()=>{t.querySelector("#codex-detail").innerHTML=b(h.dataset.entry)})})}return R(),t.querySelectorAll(".codex-tab").forEach(h=>{h.addEventListener("click",()=>{t.querySelectorAll(".codex-tab").forEach($=>$.classList.remove("active")),h.classList.add("active");const _=h.dataset.tab;v=_==="cards"?o:_==="relics"?n:i,x=_==="cards"?"card":_==="relics"?"relic":"enemy",t.querySelector("#codex-grid").innerHTML=f(v,x),R()})}),t.querySelector("#codex-search").addEventListener("input",h=>{const _=h.target.value.toLowerCase();t.querySelectorAll(".codex-tile").forEach($=>{var m,s;const p=((s=(m=$.querySelector(".ct-name"))==null?void 0:m.textContent)==null?void 0:s.toLowerCase())??"";$.style.display=p.includes(_)||!_?"":"none"})}),t.querySelector("#codex-back").addEventListener("click",()=>a({type:"CLOSE_CODEX"})),t}function ft(e,a){const t=document.createElement("div");t.className="scene-upgrading";const n=e.deck.filter(i=>!i.upgraded&&i.type!=="curse").map(i=>{const l=L[i.defId],f=(l==null?void 0:l.upgradedEffects)??(l==null?void 0:l.upgradedPowerTrigger),b=(f==null?void 0:f.map(d=>d.kind==="burn"?`Burn ${d.amount}`:d.kind==="headroom"?`+${d.amount} Headroom`:d.kind==="draw"?`Draw ${d.amount}`:d.kind==="restoreBudget"?`Restore ${d.amount}`:d.kind==="applyStatus"?`${d.status.replace(/_/g," ")} ${d.stacks}`:d.kind==="removeStatus"?`Remove ${d.status.replace(/_/g," ")}`:"").filter(Boolean).join(", "))??"improved";return`
      <div class="upg-card" data-id="${i.instanceId}">
        <div class="uc-cost">${i.cost<0?"☠":i.cost}</div>
        <div class="uc-name">${i.name} → <span style="color:var(--color-energy)">${i.name}+</span></div>
        <div class="uc-type">${i.type}</div>
        <div class="uc-preview">Upgraded: ${b}</div>
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
  `,t.querySelectorAll(".upg-card").forEach(i=>{i.addEventListener("click",()=>a({type:"CHOOSE_CARD_TO_UPGRADE",cardInstanceId:i.dataset.id}))}),t.querySelector("#upg-cancel").addEventListener("click",()=>a({type:"GO_TO_MAP"})),t}function $e(e,a,t){const o=e.getBoundingClientRect(),n=document.createElement("div");n.className="anim-float-number",n.textContent=a,n.style.color=t,n.style.left=`${o.left+o.width/2}px`,n.style.top=`${o.top+o.height/4}px`,document.body.appendChild(n),setTimeout(()=>n.remove(),700)}function mt(e,a){const t=document.querySelector(`[data-enemy-id="${e}"]`);if(!t)return;const o=t.querySelector(".sc-sprite");o&&(o.classList.add("anim-hit"),o.addEventListener("animationend",()=>o.classList.remove("anim-hit"),{once:!0})),a>0&&$e(t,`-${a}`,"var(--color-danger)")}function gt(e){const a=document.querySelector(".sc-play");if(a){const t=document.createElement("div");t.className="anim-shield-barrier",t.textContent="🛡",a.appendChild(t),setTimeout(()=>t.remove(),600)}if(e>0){const t=document.querySelector(".sc-headroom");t&&$e(t,`+${e}`,"var(--color-accent)")}}const Oe=document.getElementById("app");if(!Oe)throw new Error("missing #app root");let O=pe()??le(`seed-${Date.now().toString(36)}`),X=null;function ht(e){if(X!==null&&(clearTimeout(X),X=null),e<=0){fe();return}X=setTimeout(()=>{X=null,fe()},e)}function B(e){const a=O;O=Ke(O,e),O.scene==="lost"||O.scene==="won"||O.scene==="title"?ue():Xe(O);for(const o of O.player.hand)K(o.defId);for(const o of O.rewardCards??[])K(o.defId);O.rewardRelic&&K(O.rewardRelic);for(const o of O.player.relics)K(o);if(O.combat)for(const o of O.combat.enemies)K(o.defId);const t=yt(e,a,O);ht(t)}function yt(e,a,t){var l,f,b,d,w;if(e.type!=="PLAY_CARD")return 0;const o=a.player.hand.find(v=>v.instanceId===e.cardInstanceId);if(!o||!a.combat)return 0;if(o.type==="attack"){const v=e.targetId??((l=a.combat.enemies[0])==null?void 0:l.instanceId);if(!v)return 0;const x=((f=a.combat.enemies.find(h=>h.instanceId===v))==null?void 0:f.stability)??0,R=((d=(b=t.combat)==null?void 0:b.enemies.find(h=>h.instanceId===v))==null?void 0:d.stability)??x;return mt(v,Math.max(0,x-R)),400}const n=L[o.defId],i=(n==null?void 0:n.effects.some(v=>v.kind==="headroom"))||((w=n==null?void 0:n.upgradedEffects)==null?void 0:w.some(v=>v.kind==="headroom"));if((o.type==="skill"||o.type==="power")&&i){const v=t.player.headroom-a.player.headroom;return gt(Math.max(0,v)),540}return 0}function fe(){Oe.replaceChildren(bt(O))}function bt(e){switch(e.scene){case"title":return Ze(e,B);case"map":return rt(e,B);case"combat":return tt(e,B);case"reward":return nt(e,B);case"rest":return it(e,B);case"event":return st(e,B);case"event_outcome":return ct(e,B);case"shop":return dt(e,B);case"codex":return ut(e,B);case"upgrading":return ft(e,B);case"lost":case"won":return at(e,B)}}fe();
//# sourceMappingURL=index-CfMFFSvC.js.map
