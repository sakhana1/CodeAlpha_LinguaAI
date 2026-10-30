import React, {useEffect, useMemo, useRef, useState} from 'react';
import { Languages, ArrowLeftRight, Copy, Volume2, Mic, ImagePlus, BookOpen, Trash2, Sparkles, Search, UserRound, Plus, Send, Bot, MessageCircle, Zap, ChevronDown, Check, Globe2, Clock3, PanelLeftClose, MoreHorizontal } from 'lucide-react';

const API = 'http://127.0.0.1:5000/api';
const LANGS = [{code:'auto',name:'Auto-detect'},{code:'en',name:'English'},{code:'es',name:'Spanish'},{code:'fr',name:'French'},{code:'de',name:'German'},{code:'it',name:'Italian'},{code:'pt',name:'Portuguese'},{code:'hi',name:'Hindi'},{code:'ta',name:'Tamil'},{code:'ja',name:'Japanese'},{code:'ko',name:'Korean'},{code:'zh-CN',name:'Chinese (Simplified)'},{code:'ar',name:'Arabic'},{code:'ru',name:'Russian'}];
const suggestions=['How do I create an account?','Is there a free plan?','How can I reset my password?','How do I contact support?'];
function App(){
 return <div className="app-shell">
  <header className="topbar"><div className="brand"><span className="brand-mark"><Sparkles size={17}/></span><span>LinguaAI <b>Smart Translator</b></span></div><div className="top-actions"><span className="status-dot"/> <span className="online-label">Translation workspace</span><span className="avatar">L</span></div></header>
  <Translator/>
  <footer>Made for <b>CodeAlpha AI Internship · Task 1</b><span>•</span> React + Flask</footer>
 </div>
}
function Translator(){
 const [source,setSource]=useState('en'),[target,setTarget]=useState('es'),[input,setInput]=useState(''),[output,setOutput]=useState(''),[tone,setTone]=useState('Natural · Standard translation'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[history,setHistory]=useState(()=>JSON.parse(localStorage.getItem('lingua-history')||'[]'));
 const [vocab,setVocab]=useState(()=>JSON.parse(localStorage.getItem('lingua-vocab')||'[]'));
 const [tab,setTab]=useState('text'); const [autoDetect,setAutoDetect]=useState(true); const [autoVoice,setAutoVoice]=useState(true);
 const inputRef=useRef(null);
 useEffect(()=>localStorage.setItem('lingua-history',JSON.stringify(history)),[history]);
 useEffect(()=>localStorage.setItem('lingua-vocab',JSON.stringify(vocab)),[vocab]);
 const translate=async()=>{if(!input.trim())return setError('Please enter some text to translate.');setBusy(true);setError('');setOutput('');
 try{const r=await fetch(`${API}/translate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:input,source:autoDetect?'auto':source,target})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Translation failed');setOutput(d.translatedText);setHistory(h=>[{id:Date.now(),from:input,to:d.translatedText,source:autoDetect?'auto':source,target},...h].slice(0,30));}
 catch(e){setError(e.message||'Could not reach the backend.');}finally{setBusy(false)}};
 const copy=async(text)=>{if(!text)return;await navigator.clipboard.writeText(text);};
 const speak=(text,lang)=>{if(!text||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang==='auto'?'en':lang;window.speechSynthesis.speak(u)};
 const swap=()=>{if(source==='auto')return;setSource(target);setTarget(source);setInput(output);setOutput(input)};
 const saveWord=()=>{if(!output)return;const word=output.trim().split(/\s+/)[0];setVocab(v=>[{word,translation:output,from:source,to:target},...v].slice(0,50))};
 return <main className="translator-page">
  <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-icon"><Languages size={14}/></span> LANGUAGE WORKSPACE</div><h1>Smart Translator</h1><p>Break language barriers. Express every idea.</p></div><div className="heading-chip"><Globe2 size={15}/> 14 languages available</div></div>
  <section className="translator-grid">
   <aside className="panel side-panel"><div className="panel-title"><span>Recent Translations ({history.length})</span><button className="icon-btn" title="Clear history" onClick={()=>setHistory([])}><Trash2 size={15}/></button></div>
    {history.length===0?<div className="empty-state"><div className="empty-icon"><Clock3 size={19}/></div><b>No translations yet</b><span>Your translation history will appear here</span></div>:<div className="history-list">{history.map(h=><button className="history-item" key={h.id} onClick={()=>{setInput(h.from);setOutput(h.to);setSource(h.source==='auto'?'en':h.source);setTarget(h.target)}}><span>{h.from}</span><small>{h.to}</small></button>)}</div>}
   </aside>
   <section className="panel translate-panel"><div className="panel-title"><span>Translation</span><span className="live-label"><i/> READY</span></div>
    <div className="language-row"><select value={source} onChange={e=>{setSource(e.target.value);setAutoDetect(e.target.value==='auto')}}>{LANGS.map(l=><option key={l.code} value={l.code}>{l.name}</option>)}</select><button className="swap-btn" onClick={swap} title="Swap languages"><ArrowLeftRight size={16}/></button><select value={target} onChange={e=>setTarget(e.target.value)}>{LANGS.filter(l=>l.code!=='auto').map(l=><option key={l.code} value={l.code}>{l.name}</option>)}</select></div>
    <div className="check-row"><label><input type="checkbox" checked={autoDetect} onChange={e=>{setAutoDetect(e.target.checked);if(e.target.checked)setSource('auto')}}/> Auto-detect text</label><label><input type="checkbox" checked={autoVoice} onChange={e=>setAutoVoice(e.target.checked)}/> Auto-update voice</label><button className="tiny-info" title="Translation is processed by MyMemory API">i</button></div>
    <label className="field-label">Translation Tone</label><select className="tone-select" value={tone} onChange={e=>setTone(e.target.value)}><option>Natural · Standard translation</option><option>Formal · Professional</option><option>Casual · Conversational</option></select>
    <div className="mode-tabs"><button className={tab==='text'?'selected':''} onClick={()=>setTab('text')}><span>⌨</span> Text Input</button><button className={tab==='image'?'selected':''} onClick={()=>setTab('image')}><ImagePlus size={14}/> Image Upload</button><button className={tab==='article'?'selected':''} onClick={()=>setTab('article')}><BookOpen size={14}/> Article Learning</button></div>
    {tab==='text'?<div className="text-area-wrap"><textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} placeholder="Enter text to translate or click the microphone to speak..." maxLength={4500}/><div className="textarea-tools"><span>{input.length}/4500</span><button onClick={()=>speak(input,source)} title="Listen to input"><Mic size={15}/></button></div></div>:<div className="coming-panel"><ImagePlus size={22}/><b>{tab==='image'?'Image translation':'Article learning'}</b><span>This optional enhancement is not enabled in this internship demo. Use Text Input for translation.</span><button onClick={()=>setTab('text')}>Back to text input</button></div>}
    {error&&<div className="error-message">{error}</div>}
    <button className="translate-button" onClick={translate} disabled={busy||tab!=='text'}>{busy?<><span className="spinner"/> Translating...</>:<>Translate <Sparkles size={15}/></>}</button>
    {output&&<div className="result-box"><div className="result-heading"><span>TRANSLATED TEXT</span><span className="result-actions"><button onClick={()=>copy(output)} title="Copy"><Copy size={15}/></button><button onClick={()=>speak(output,target)} title="Listen"><Volume2 size={15}/></button><button onClick={saveWord} title="Save to vocabulary"><Plus size={15}/></button></span></div><p>{output}</p></div>}
   </section>
   <aside className="panel side-panel vocab-panel"><div className="panel-title"><span>My Vocabulary ({vocab.length})</span><select className="mini-select"><option>All Words</option></select></div>
    {vocab.length===0?<div className="empty-state"><div className="empty-icon"><BookOpen size={19}/></div><b>No vocabulary items found</b><span>Save words from translations to see them here</span></div>:<div className="history-list">{vocab.map((v,i)=><div className="vocab-item" key={i}><b>{v.word}</b><span>{v.translation}</span></div>)}</div>}
   </aside>
  </section>
  <div className="below-note"><span><Check size={14}/> Translation powered by MyMemory</span><span>Tip: Save useful translations to your vocabulary list.</span></div>
 </main>
}
function Chatbot(){
 const [messages,setMessages]=useState([{id:1,role:'assistant',text:"Hi, I'm Omago AI 👋\nYour friendly AI support assistant. Ask me anything about the product, and I'll help you find the right answer.",time:'Just now'}]);
 const [question,setQuestion]=useState(''),[busy,setBusy]=useState(false),[category,setCategory]=useState('All'),[faqs,setFaqs]=useState([]),[search,setSearch]=useState('');
 const bottom=useRef(null);
 useEffect(()=>{fetch(`${API}/faqs`).then(r=>r.json()).then(setFaqs).catch(()=>{});},[]);
 useEffect(()=>bottom.current?.scrollIntoView({behavior:'smooth'}),[messages,busy]);
 const categories=['All',...new Set(faqs.map(f=>f.category))];
 const ask=async(q)=>{q=(q||question).trim();if(!q||busy)return;setMessages(m=>[...m,{id:Date.now(),role:'user',text:q,time:'Now'}]);setQuestion('');setBusy(true);
 try{const r=await fetch(`${API}/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,category})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not get a response');setMessages(m=>[...m,{id:Date.now()+1,role:'assistant',text:d.answer,confidence:d.confidence,matched:d.matched_question,time:'Just now'}]);}
 catch(e){setMessages(m=>[...m,{id:Date.now()+1,role:'assistant',text:'I could not connect to the FAQ service. Please check that the Flask backend is running.',time:'Just now'}]);}finally{setBusy(false)}};
 const filtered=faqs.filter(f=>(category==='All'||f.category===category)&&f.question.toLowerCase().includes(search.toLowerCase()));
 return <main className="chat-page">
  <div className="chat-topline"><div className="eyebrow"><span className="eyebrow-icon"><Bot size={14}/></span> YOUR AI SUPPORT COMPANION</div><div className="chat-top-right"><span className="secure-pill"><i/> AI ONLINE</span><button className="icon-btn"><MoreHorizontal size={19}/></button></div></div>
  <div className="chat-workspace">
   <section className="chat-hero"><div className="hero-glow one"/><div className="hero-glow two"/><div className="hero-content"><div className="omago-mark"><Sparkles size={21}/></div><div className="hero-kicker">OMAGO AI · INSTANT ASSISTANT</div><h1>Hi, I'm Omago AI</h1><p>How can I help you today?</p><div className="hero-orbit"><span/><span/><span/></div></div>
    <div className="composer-card"><div className="composer-label">Ask anything...</div><textarea value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}}} placeholder="Type your question here..." rows="2"/><div className="composer-bottom"><span><Sparkles size={13}/> Powered by intelligent FAQ matching</span><button className="send-btn" onClick={()=>ask()} disabled={!question.trim()||busy}><Send size={16}/></button></div></div>
    <div className="suggestion-row">{suggestions.slice(0,3).map(s=><button key={s} onClick={()=>ask(s)}>{s}</button>)}</div>
   </section>
   <aside className="conversation-card"><div className="conversation-head"><div className="bot-avatar"><Sparkles size={15}/></div><div><b>Omago Digital Assistant</b><span><i/> Always here to help</span></div><button className="icon-btn" onClick={()=>setMessages([{id:Date.now(),role:'assistant',text:"Hello again! What can I help you with?",time:'Just now'}])}><Plus size={17}/></button></div>
    <div className="messages">{messages.map(m=><div className={`message ${m.role}`} key={m.id}><div className="message-avatar">{m.role==='assistant'?<Sparkles size={13}/>:<UserRound size={13}/>}</div><div className="message-body"><div className="message-name">{m.role==='assistant'?'Omago AI':'You'} <time>{m.time}</time></div><div className="bubble">{m.text}</div>{m.matched&&<div className="match-note">Matched FAQ · {m.matched}</div>}</div></div>)}{busy&&<div className="message assistant"><div className="message-avatar"><Sparkles size={13}/></div><div className="bubble typing"><i/><i/><i/></div></div>}<div ref={bottom}/></div>
    <div className="conversation-input"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')ask()}} placeholder="Type a message..."/><button onClick={()=>ask()} disabled={!question.trim()||busy}><Send size={15}/></button></div>
   </aside>
  </div>
  <section className="faq-library"><div className="faq-library-head"><div><div className="eyebrow">KNOWLEDGE BASE</div><h2>Explore common questions</h2></div><div className="faq-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search FAQs..."/></div></div><div className="category-pills">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="faq-grid">{filtered.slice(0,6).map((f,i)=><button className="faq-card" key={i} onClick={()=>ask(f.question)}><span>{f.category}</span><b>{f.question}</b><small>Ask Omago AI <span>↗</span></small></button>)}</div></section>
 </main>
}
export default App;
