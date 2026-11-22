'use strict';
const DB_NAME='ovazio_site_v1',DB_VERSION=1;
const navTitles={jogar:['Campo de Duelo','Jogue contra o computador com cartas completas.'],editor:['Editor de Cartas','Edite as molduras originais e salve diretamente na coleção.'],colecao:['Coleção de Cartas','Cartas personalizadas e modelos demonstrativos.'],baralho:['Montar Deck','Monte as 30 cartas e escolha como jogar.'],regras:['Regras do Jogo','Mecânicas confirmadas e regras de teste do protótipo.']};
const els=id=>document.getElementById(id);let dbPromise=null,customCards=[],demoCards=[],arenaReady=false,editorReady=false,lastDeck=null,currentView='jogar';
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notice(msg){const n=els('notice');n.textContent=msg;n.style.display='block';clearTimeout(notice.timer);notice.timer=setTimeout(()=>{n.style.display='none'},3300)}
function openDatabase(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('cards'))db.createObjectStore('cards',{keyPath:'id'});if(!db.objectStoreNames.contains('settings'))db.createObjectStore('settings',{keyPath:'key'})};req.onerror=()=>reject(req.error);req.onsuccess=()=>resolve(req.result)});return dbPromise}
async function dbGetAll(store){const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly');const r=tx.objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function dbPut(store,obj){const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(obj);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function dbDel(store,id){const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function dbGet(store,id){const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly');const r=tx.objectStore(store).get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function sendArena(message){if(arenaReady)els('dueloFrame').contentWindow.postMessage(message,location.origin)}
function sendEditor(message){if(editorReady)els('editorFrame').contentWindow.postMessage(message,location.origin)}
function updateCount(){els('savedCount').textContent='Coleção: '+customCards.length+' própria'+(customCards.length===1?'':'s')}

function activate(section){
 if(!navTitles[section])return;
 currentView=section;
 document.querySelectorAll('.menu button').forEach(b=>b.classList.toggle('on',b.dataset.section===section));
 // Keep the same iframe attached in the DOM: moving an iframe resets its game state in browsers.
 const actualView=['jogar','baralho','regras'].includes(section)?'jogar':section;
 document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+actualView));
 els('sectionTitle').textContent=navTitles[section][0];
 els('sectionSubtitle').textContent=navTitles[section][1];
 if(['jogar','baralho','regras'].includes(section))sendArena({type:'OV_SHOW_ARENA_TAB',page:section==='jogar'?'partida':section});
 if(section==='colecao')renderCollection();
 window.location.hash=section;
}
const cardImage=(c)=>c.image||'';
function cardEl(c,ours){const category={monstro:'Monstro',magia:'Magia',armadilha:'Armadilha',campo:'Campo'}[c.categoria]||c.categoria;
 const title=escapeHtml(c.nome),id=escapeHtml(c.id),alt=escapeHtml('Carta '+c.nome);
 const el=document.createElement('div');el.className='tile';el.innerHTML=`<img src="${ours?cardImage(c):escapeHtml(cardImage(c))}" alt="${alt}" loading="lazy"><b>${title}</b><small>${escapeHtml(category)} · ${ours?'Sua carta':'Teste'}</small><div class="buttons">${ours?`<button data-cmd="edit" data-id="${id}">Editar</button><button data-cmd="config" data-id="${id}">Efeito no duelo</button><button data-cmd="delete" data-id="${id}">Excluir</button>`:'<button data-cmd="demo" data-id="'+id+'">Detalhes</button>'}</div>`;return el}
function renderCollection(){const filter=els('filterType').value;const ours=customCards.filter(c=>filter==='all'||c.categoria===filter),test=demoCards.filter(c=>filter==='all'||c.categoria===filter);
 els('myCards').replaceChildren(...ours.map(c=>cardEl(c,true)));
 if(!ours.length)els('myCards').innerHTML='<div class="empty">Nenhuma carta própria nesta categoria. Crie uma no Editor e salve diretamente na coleção.</div>';
 els('demoHeading').textContent='Cartas demonstrativas ('+test.length+')';els('demoCards').replaceChildren(...test.map(c=>cardEl(c,false)));
}
async function refreshCollection(){customCards=await dbGetAll('cards');updateCount();renderCollection()}
function cleanCard(p){if(!p||typeof p!=='object')throw Error('Dados de carta inválidos');if(!['monstro','magia','armadilha','campo'].includes(p.categoria))throw Error('Categoria inválida');
 if(typeof p.image!=='string'||!p.image.startsWith('data:image/webp;base64,')||p.image.length>7_000_000)throw Error('Imagem inválida ou muito grande');
 if(!p.id||String(p.id).length>130)throw Error('Identificação inválida');return p}
async function saveCard(p){const c=cleanCard(p);const prior=customCards.find(x=>x.id===c.id);if(prior){c.role=prior.role||'any';c.effectId=prior.effectId||'manual';c.amount=prior.amount||0}await dbPut('cards',c);await refreshCollection();sendArena({type:'OV_ADD_CARD',card:c});}
function editCard(id){const c=customCards.find(x=>x.id===id);if(!c){notice('Carta não encontrada.');return;}activate('editor');sendEditor({type:'OV_LOAD_EDITOR_CARD',source:c.source})}

let configuredCardId=null;
const EFFECT_TYPES=[['manual','Manual — somente texto'],['burn','Causar dano aos PV'],['heal','Restaurar PV'],['draw','Comprar cartas'],['boost','Fortalecer monstro aliado'],['aura','ATK permanente'],['negate','Anular ataque recebido'],['spikes','Reduzir DEF do atacante'],['trap_heal','Restaurar PV ao ser atacado']];
function configureCard(id){
 const c=customCards.find(v=>v.id===id);if(!c)return;
 configuredCardId=id;
 els('configName').textContent=c.nome;
 els('configEffect').innerHTML=EFFECT_TYPES.map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
 els('configEffect').value=c.effectId||'manual';
 els('configAmount').value=Number(c.amount)||0;
 els('configRole').value=['v','r','any'].includes(c.role)?c.role:'any';
 els('configRoleGroup').hidden=c.categoria!=='monstro';
 els('cardConfig').showModal();
}
async function commitConfiguration(){
 const c=customCards.find(v=>v.id===configuredCardId);if(!c)return;
 c.effectId=els('configEffect').value;
 c.amount=Math.min(20000,Math.max(0,Number(els('configAmount').value)||0));
 c.role=c.categoria==='monstro'?els('configRole').value:'any';
 await dbPut('cards',c);
 sendArena({type:'OV_UPDATE_IMPORTED',id:c.id,effectId:c.effectId,amount:c.amount,role:c.role});
 els('cardConfig').close();
 renderCollection();notice('Efeito de teste configurado.');
}
async function deleteCard(id){const c=customCards.find(x=>x.id===id);if(!c||!confirm('Excluir a carta “'+c.nome+'” da coleção?'))return;await dbDel('cards',id);await refreshCollection();sendArena({type:'OV_REM_CARD',id});notice('Carta excluída.')}
function selectedDemo(id){const c=demoCards.find(x=>x.id===id);if(!c)return;notice(c.nome+' · '+c.categoria+' · carta demonstrativa criada no editor.')}
async function exportBackup(){const payload={schema:'ovazio-site-backup-v1',date:new Date().toISOString(),cards:customCards,deck:lastDeck};const blob=new Blob([JSON.stringify(payload)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='O_Vazio_Backup_Colecao.json';a.click();URL.revokeObjectURL(url);notice('Backup gerado. Guarde esse JSON com segurança.')}
async function importBackup(f){const content=JSON.parse(await f.text());if(content.schema!=='ovazio-site-backup-v1'||!Array.isArray(content.cards))throw Error('Backup incompatível');if(content.cards.length>600)throw Error('Backup contém cartas demais');for(const c of content.cards){await dbPut('cards',cleanCard(c))}if(Array.isArray(content.deck)&&content.deck.length===30){lastDeck=content.deck;await dbPut('settings',{key:'deck',value:lastDeck})}await refreshCollection();sendArena({type:'OV_SYNC_CARDS',cards:customCards,deck:lastDeck});notice(content.cards.length+' carta(s) restaurada(s).')}
window.addEventListener('message',async event=>{if(event.origin!==location.origin)return;const data=event.data||{};try{
 if(data.type==='OV_EDITOR_READY'&&event.source===els('editorFrame').contentWindow){editorReady=true;return}
 if(data.type==='OV_ARENA_READY'&&event.source===els('dueloFrame').contentWindow){arenaReady=true;sendArena({type:'OV_SYNC_CARDS',cards:customCards,deck:lastDeck});if(currentView!=='jogar')sendArena({type:'OV_SHOW_ARENA_TAB',page:currentView});return}
 if(data.type==='OV_SAVE_CARD'&&event.source===els('editorFrame').contentWindow){await saveCard(data.payload);sendEditor({type:'OV_SAVE_RESULT',ok:true});notice('✓ Carta salva e disponível no duelo.');return}
 if(data.type==='OV_ARENA_DECK'&&event.source===els('dueloFrame').contentWindow){if(Array.isArray(data.deck)&&data.deck.length===30){lastDeck=data.deck;await dbPut('settings',{key:'deck',value:data.deck});notice('Deck de 30 cartas salvo neste navegador.')}return}
 }catch(e){console.error(e);if(data.type==='OV_SAVE_CARD')sendEditor({type:'OV_SAVE_RESULT',ok:false,error:String(e.message||e)});notice('Erro: '+(e.message||e))}});
async function load(){try{customCards=await dbGetAll('cards');const st=await dbGet('settings','deck');lastDeck=st?.value||null;updateCount();const r=await fetch('assets/demo_cards.json');demoCards=await r.json();renderCollection();sendArena({type:'OV_SYNC_CARDS',cards:customCards,deck:lastDeck});}
 catch(e){console.error(e);notice('Abra este projeto por um servidor/site HTTP; arquivos locais podem bloquear a coleção.')}const section=location.hash.replace('#','');activate(navTitles[section]?section:'jogar')}
document.querySelectorAll('.menu [data-section]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.section)));
els('filterType').addEventListener('change',renderCollection);els('newCard').addEventListener('click',()=>activate('editor'));
els('myCards').addEventListener('click',e=>{const b=e.target.closest('button[data-cmd]');if(!b)return;if(b.dataset.cmd==='edit')editCard(b.dataset.id);if(b.dataset.cmd==='config')configureCard(b.dataset.id);if(b.dataset.cmd==='delete')deleteCard(b.dataset.id)});
els('demoCards').addEventListener('click',e=>{const b=e.target.closest('button[data-cmd]');if(b)selectedDemo(b.dataset.id)});
els('exportBackup').addEventListener('click',()=>exportBackup());els('importBackup').addEventListener('click',()=>els('backupFile').click());els('backupFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{await importBackup(f)}catch(err){notice('Não foi possível restaurar: '+err.message)}e.target.value=''});
load();

els('configSave').addEventListener('click',()=>commitConfiguration().catch(e=>notice('Falha: '+e.message)));
