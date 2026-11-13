 "use client";

import { useEffect, useMemo, useState } from "react";

type Profile = { name:string; school:string; year:string; curriculum:string; pathway:string; subjects:string[]; companion:string; personality:string };
type Message = { role:"user"|"assistant"; content:string };
const defaultSubjects = ["Mathematics","English","Science","History","Geography"];
const pathways = ["GCSE","IGCSE","A-level","International A-level","IB","AP","American High School","Other / Not sure"];
const years = ["Year 7","Year 8","Year 9","Year 10","Year 11","Year 12","Year 13","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","Other"];
const curricula = ["British","International","American","IB","Other"];
const blank:Profile = {name:"",school:"",year:"Year 8",curriculum:"British",pathway:"GCSE",subjects:defaultSubjects,companion:"Study Buddy",personality:"Friendly and encouraging"};

export default function Home() {
  const [profile,setProfile] = useState<Profile>(blank);
  const [ready,setReady] = useState(false);
  const [page,setPage] = useState("Home");
  const [subject,setSubject] = useState("Mathematics");
  const [chat,setChat] = useState<Message[]>([]);
  const [input,setInput] = useState("");
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState("");
  const [newSubject,setNewSubject] = useState("");
  const [tasks,setTasks] = useState<string[]>([]);
  const [taskInput,setTaskInput] = useState("");
  const [materials,setMaterials] = useState<string[]>([]);
  const [quizTopic,setQuizTopic] = useState("");
  const [quizOutput,setQuizOutput] = useState("");
  const [mobileMenu,setMobileMenu] = useState(false);

  useEffect(()=> {
    try {
      const p=localStorage.getItem("studysync-profile");
      if(p) setProfile(JSON.parse(p));
      setReady(true);
      const t=localStorage.getItem("studysync-tasks"); if(t) setTasks(JSON.parse(t));
      const m=localStorage.getItem("studysync-materials"); if(m) setMaterials(JSON.parse(m));
    } catch { setReady(true); }
  },[]);
  useEffect(()=>{ if(ready){localStorage.setItem("studysync-profile",JSON.stringify(profile));localStorage.setItem("studysync-tasks",JSON.stringify(tasks));localStorage.setItem("studysync-materials",JSON.stringify(materials));}},[profile,tasks,materials,ready]);

  const send = async (text?:string, mode="chat") => {
    const content=(text ?? input).trim(); if(!content || busy) return;
    const next=[...chat,{role:"user" as const,content}]; setChat(next);setInput("");setBusy(true);
    try {
      const res=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next,subject:page==="Subject"?subject:null,mode})});
      const data=await res.json(); setChat([...next,{role:"assistant",content:data.reply || data.error || "No response."}]);
    } catch { setChat([...next,{role:"assistant",content:"I couldn't connect. Please check your internet connection and try again."}]); }
    finally {setBusy(false);}
  };
  const addSubject=()=>{const s=newSubject.trim();if(s&&!profile.subjects.includes(s)){setProfile({...profile,subjects:[...profile.subjects,s]});setNewSubject("");}};
  const addTask=()=>{if(taskInput.trim()){setTasks([...tasks,taskInput.trim()]);setTaskInput("");}};
  const upload=(files:FileList|null)=>{if(!files)return;setMaterials([...materials,...Array.from(files).map(f=>f.name)]);setNotice("File names added to this browser's materials list. Full secure cloud file storage and document extraction are not connected yet.");};
  const startSubject=(s:string)=>{setSubject(s);setChat([]);setPage("Subject");};
  const nav=["Home","Subjects","AI Companion","Study Planner","Learning Library","Settings"];
  const title=page==="Subject"?subject:page;
  const greeting=profile.name?`Welcome back, ${profile.name}`:"Welcome to StudySync";
  const topicsBySubject:Record<string,string[]>={Mathematics:["Number","Algebra","Geometry","Ratio and proportion","Statistics"],English:["Reading","Writing","Grammar","Literature","分析 and evaluation"],Science:["Biology","Chemistry","Physics","Scientific skills"],History:["Historical knowledge","Sources","Cause and consequence","Change and continuity"],Geography:["Physical geography","Human geography","Fieldwork","Map skills"]};

  if(!ready) return <main className="loading">Loading StudySync…</main>;
  if(!profile.name) return <main className="onboard-wrap"><section className="onboard panel"><div className="brand"><span className="brand-mark">S</span> StudySync</div><div className="eyebrow">LET'S SET UP YOUR SPACE</div><h1>Your learning.<br/><span>All in sync.</span></h1><p className="muted">Tell us a little about your studies so StudySync can organise your learning.</p>
    <div className="form-grid">
      <label>Your name<input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} placeholder="Your name"/></label>
      <label>School (optional)<input value={profile.school} onChange={e=>setProfile({...profile,school:e.target.value})} placeholder="Your school"/></label>
      <label>Year / grade<select value={profile.year} onChange={e=>setProfile({...profile,year:e.target.value})}>{years.map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Curriculum<select value={profile.curriculum} onChange={e=>setProfile({...profile,curriculum:e.target.value})}>{curricula.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="wide">Qualification / pathway<select value={profile.pathway} onChange={e=>setProfile({...profile,pathway:e.target.value})}>{pathways.map(x=><option key={x}>{x}</option>)}</select></label>
    </div>
    <div className="field-title">Choose your subjects</div><p className="tiny muted">You can change these later.</p>
    <div className="subject-picks">{defaultSubjects.map(s=><button key={s} className={profile.subjects.includes(s)?"pick selected":"pick"} onClick={()=>setProfile({...profile,subjects:profile.subjects.includes(s)?profile.subjects.filter(x=>x!==s):[...profile.subjects,s]})}>{profile.subjects.includes(s)?"✓ ":"＋ "}{s}</button>)}</div>
    <label>AI companion name (optional)<input value={profile.companion} onChange={e=>setProfile({...profile,companion:e.target.value})}/></label>
    <label>AI personality<select value={profile.personality} onChange={e=>setProfile({...profile,personality:e.target.value})}>{["Friendly and encouraging","Calm and focused","Energetic and motivating","Straightforward and concise"].map(x=><option key={x}>{x}</option>)}</select></label>
    <button className="primary full" disabled={!profile.name.trim()||profile.subjects.length===0} onClick={()=>{localStorage.setItem("studysync-profile",JSON.stringify(profile));setNotice("");}}>Create my StudySync space <span>→</span></button>
    <p className="tiny muted">This starter saves your setup on this device only. It does not create a student account.</p>
  </section></main>;

  return <main className="app-shell">
    <aside className={mobileMenu?"sidebar show":"sidebar"}><div className="brand"><span className="brand-mark">S</span> StudySync</div><div className="workspace-label">YOUR WORKSPACE</div>
      {nav.map((n,i)=><button key={n} className={page===n?"nav-item active":"nav-item"} onClick={()=>{setPage(n);setMobileMenu(false);}}><span className="nav-icon">{["⌂","▦","✧","▤","▧","⚙"][i]}</span>{n}</button>)}
      <div className="side-bottom"><div className="avatar">{profile.name.slice(0,1).toUpperCase()}</div><div><b>{profile.name}</b><small>{profile.year} · {profile.pathway}</small></div></div>
    </aside>
    <section className="main-area"><header className="topbar"><button className="menu-button" onClick={()=>setMobileMenu(!mobileMenu)}>☰</button><span className="breadcrumb">Workspace / <b>{title}</b></span><button className="profile-chip" onClick={()=>setPage("Settings")}>{profile.name.slice(0,1).toUpperCase()}</button></header>
      <div className="content"><div className="page-heading"><div><div className="eyebrow">YOUR LEARNING SPACE</div><h1>{page==="Home"?greeting:title}</h1><p className="muted">{page==="Home"?"A calmer way to learn, practise and stay organised.":page==="Subject"?`Your ${subject} learning space.`:"Everything you need, in one place."}</p></div></div>
      {notice&&<div className="notice" onClick={()=>setNotice("")}>{notice} ×</div>}
      {page==="Home"&&<><div className="hero-card"><div><div className="eyebrow light">YOUR AI STUDY COMPANION</div><h2>What are we learning today?</h2><p>Ask a question, get an explanation or plan your next study session.</p><button className="light-button" onClick={()=>{setPage("AI Companion");setChat([]);}}>Chat with {profile.companion} →</button></div><div className="hero-orb">✧</div></div>
        <div className="section-head"><div><h2>Your subjects</h2><p className="muted">Pick up where you left off.</p></div><button className="text-button" onClick={()=>setPage("Subjects")}>View all →</button></div>
        <div className="subject-grid">{profile.subjects.slice(0,6).map((s,i)=><button className="subject-card" key={s} onClick={()=>startSubject(s)}><span className="subject-symbol">{["∑","Aa","⚛","◷","⌖","✦"][i%6]}</span><b>{s}</b><small>Open subject space →</small></button>)}</div>
        <div className="two-col"><div className="panel"><div className="section-head"><h2>Study planner</h2><button className="text-button" onClick={()=>setPage("Study Planner")}>Open →</button></div>{tasks.length?tasks.slice(0,3).map((t,i)=><div className="task-row" key={i}>◦ {t}</div>):<p className="muted">Your upcoming study tasks will appear here.</p>}</div><div className="panel"><h2>Your learning profile</h2><p className="muted">{profile.curriculum} curriculum · {profile.pathway}</p><p className="muted">{profile.school||"School not added"} · {profile.year}</p><button className="text-button" onClick={()=>setPage("Settings")}>Customise profile →</button></div></div></>}
      {page==="Subjects"&&<><div className="panel"><h2>All subjects</h2><p className="muted">Choose a subject to open its learning space.</p><div className="subject-grid">{profile.subjects.map((s,i)=><button className="subject-card" key={s} onClick={()=>startSubject(s)}><span className="subject-symbol">{["∑","Aa","⚛","◷","⌖","✦"][i%6]}</span><b>{s}</b><small>Open subject →</small></button>)}</div><div className="inline-add"><input value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="Add a subject"/><button className="primary" onClick={addSubject}>Add subject</button></div></div></>}
      {page==="Subject"&&<><div className="subject-tabs"><span className="tab-active">Overview</span><span>Generate Quiz</span><span>Overall Topics</span><span>Materials</span></div><div className="two-col"><div className="panel"><h2>Subject AI assistant</h2><p className="muted">Ask questions about {subject}.</p><button className="primary" onClick={()=>{setPage("AI Companion");setChat([]);}}>Open {subject} AI →</button></div><div className="panel"><h2>Generate a quiz</h2><input value={quizTopic} onChange={e=>setQuizTopic(e.target.value)} placeholder="Enter a topic"/><button className="primary" onClick={()=>{setPage("AI Companion");setChat([]);setTimeout(()=>send(`Create a 5-question quiz about ${quizTopic||subject}. Give me the questions first and wait for my answers.`, "quiz"),100);}}>Generate quiz →</button>{quizOutput&&<p>{quizOutput}</p>}</div></div><div className="panel"><h2>Overall topics</h2><p className="muted">Starter topic suggestions. Add your own curriculum to make this list accurate.</p><div className="topic-list">{(topicsBySubject[subject]||["Add your topics in Settings"]).map(t=><div key={t} className="topic-row"><span>{t}</span><small>Topic</small></div>)}</div></div><div className="panel"><h2>Materials</h2><p className="muted">Your uploaded school resources appear separately from external learning links.</p><h3>School uploads</h3><input type="file" multiple accept=".pdf,.ppt,.pptx,.doc,.docx,image/*" onChange={e=>upload(e.target.files)}/>{materials.map(m=><div className="task-row" key={m}>▧ {m}</div>)}<h3>External resources</h3><p className="muted">External videos and articles can be added here in a future version.</p></div></>}
      {(page==="AI Companion"||page==="Subject")&&page==="AI Companion"&&<div className="chat-panel panel"><div className="chat-head"><div className="avatar">✧</div><div><b>{profile.companion}</b><small>{profile.personality} · AI study companion</small></div></div><div className="chat-messages">{chat.length===0&&<div className="empty-chat"><div className="big-spark">✧</div><h2>What can I help you understand?</h2><p className="muted">Ask for an explanation, revision help or a practice quiz.</p><div className="suggestions">{["Explain a topic simply","Give me practice questions","Help me revise for a test"].map(x=><button key={x} onClick={()=>send(x)}>{x}</button>)}</div></div>}{chat.map((m,i)=><div className={m.role==="user"?"bubble user":"bubble assistant"} key={i}>{m.content}</div>)}{busy&&<div className="bubble assistant">Thinking…</div>}</div><form className="chat-input" onSubmit={e=>{e.preventDefault();send();}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Message your study companion…"/><button className="primary" disabled={busy||!input.trim()}>Send ↑</button></form><p className="tiny muted">AI can make mistakes. Check important information against your school materials.</p></div>}
      {page==="Study Planner"&&<div className="panel"><h2>Your study tasks</h2><p className="muted">Add tasks you want to remember on this device.</p><div className="inline-add"><input value={taskInput} onChange={e=>setTaskInput(e.target.value)} placeholder="e.g. Revise ionic bonding"/><button className="primary" onClick={addTask}>Add task</button></div>{tasks.map((t,i)=><div className="task-row" key={i}><span>◦ {t}</span><button className="text-button" onClick={()=>setTasks(tasks.filter((_,j)=>j!==i))}>Remove</button></div>)}</div>}
      {page==="Learning Library"&&<div className="panel"><h2>Your learning library</h2><p className="muted">Keep track of your study resources.</p><label className="upload-box">＋ Add files from your iPad<input type="file" multiple accept=".pdf,.ppt,.pptx,.doc,.docx,image/*" onChange={e=>upload(e.target.files)}/></label>{materials.length?materials.map(m=><div className="task-row" key={m}>▧ {m}</div>):<p className="muted">No materials added yet.</p>}<p className="tiny muted">This first version only remembers file names in this browser. It does not upload files to cloud storage or extract their contents yet.</p></div>}
      {page==="Settings"&&<div className="panel settings"><h2>Personalise StudySync</h2><label>Name<input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>School<input value={profile.school} onChange={e=>setProfile({...profile,school:e.target.value})}/></label><label>Year / grade<select value={profile.year} onChange={e=>setProfile({...profile,year:e.target.value})}>{years.map(x=><option key={x}>{x}</option>)}</select></label><label>Curriculum<select value={profile.curriculum} onChange={e=>setProfile({...profile,curriculum:e.target.value})}>{curricula.map(x=><option key={x}>{x}</option>)}</select></label><label>Qualification<select value={profile.pathway} onChange={e=>setProfile({...profile,pathway:e.target.value})}>{pathways.map(x=><option key={x}>{x}</option>)}</select></label><label>AI companion name<input value={profile.companion} onChange={e=>setProfile({...profile,companion:e.target.value})}/></label><label>AI personality<select value={profile.personality} onChange={e=>setProfile({...profile,personality:e.target.value})}>{["Friendly and encouraging","Calm and focused","Energetic and motivating","Straightforward and concise"].map(x=><option key={x}>{x}</option>)}</select></label><button className="primary" onClick={()=>setNotice("Your settings are saved on this device.")}>Save settings</button><button className="danger" onClick={()=>{if(confirm("Reset your local StudySync profile?")){localStorage.clear();location.reload();}}}>Reset this device's StudySync data</button></div>}
      </div><footer>StudySync · Your personal learning space</footer></section>
  </main>;
}
