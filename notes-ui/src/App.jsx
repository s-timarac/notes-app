import { useState, useRef, useEffect } from "react";

const COLORS = [
  { name: "lemon", bg: "#FFF9C4", border: "#F9E94E", tag: "#F0D800", dark: "#7A6E00" },
  { name: "mint", bg: "#C8F5E0", border: "#5DDBA4", tag: "#2ECC87", dark: "#0E6644" },
  { name: "blush", bg: "#FFD6E0", border: "#FF8FAB", tag: "#FF4D7B", dark: "#8B0033" },
  { name: "sky", bg: "#C9EEFF", border: "#5BC4F5", tag: "#0EA5E9", dark: "#0A4A6E" },
  { name: "lilac", bg: "#EDD9FF", border: "#C084FC", tag: "#A855F7", dark: "#4A1072" },
  { name: "peach", bg: "#FFE4CC", border: "#FFA05E", tag: "#F97316", dark: "#7A3200" },
  { name: "forest", bg: "#F1F3E0", border: "#D2DCB6", tag: "#A1BC98", dark: "#778873" },
];

const ROTATIONS = [-2.1, 1.4, -0.8, 2.3, -1.6, 0.9, -2.8, 1.1];



export default function NotesApp() {
  const [notes, setNotes] = useState([]);;
  const [activeNote, setActiveNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", colorIdx: 0 });
  const [hovered, setHovered] = useState(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (showNew && titleRef.current) titleRef.current.focus();
  }, [showNew]);

  useEffect(() => {
  fetch("/api/notes")
    .then(r => r.json())
    .then(data => setNotes(data));
  }, []);


  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  function addNote() {
  if (!newNote.title.trim() && !newNote.content.trim()) return;
  fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newNote)
  })
    .then(r => r.json())
    .then(saved => setNotes(prev => [...prev, saved]));
    setNewNote({ title: "", content: "", colorIdx: Math.floor(Math.random() * COLORS.length) });
    setShowNew(false);
  }

  function deleteNote(id) {
  fetch(`/api/notes/${id}`, { method: "DELETE" })
    .then(() => {
      setNotes(prev => prev.filter(n => n.id !== id));
      if (activeNote?.id === id) setActiveNote(null);
    });
  }

  function togglePin(id) {
    const note = notes.find(n => n.id === id);
    const updated = { ...note, pinned: !note.pinned };
    fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })
    .then(r => r.json())
    .then(saved => setNotes(prev => prev.map(n => n.id === saved.id ? saved : n)));
  }

  function saveEdit() {
  if (!editingNote) return;
  fetch(`/api/notes/${editingNote.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editingNote)
  })
    .then(r => r.json())
    .then(updated => {
      setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      setActiveNote(updated);
      setEditingNote(null);
    });
  }

  const NoteCard = ({ note, idx }) => {
    const color = COLORS[note.colorIdx];
    const rot = ROTATIONS[note.id % ROTATIONS.length];
    const isHovered = hovered === note.id;

    return (
      <div
        onClick={() => { setActiveNote(note); setEditingNote(null); }}
        onMouseEnter={() => setHovered(note.id)}
        onMouseLeave={() => setHovered(null)}
        style={{
          background: color.bg,
          border: `2px solid ${color.border}`,
          borderRadius: "4px",
          padding: "18px 16px 14px",
          cursor: "pointer",
          transform: isHovered ? `rotate(0deg) scale(1.04)` : `rotate(${rot}deg)`,
          transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease",
          boxShadow: isHovered
            ? `4px 8px 24px rgba(0,0,0,0.18)`
            : `2px 4px 10px rgba(0,0,0,0.1)`,
          position: "relative",
          userSelect: "none",
          zIndex: isHovered ? 10 : 1,
        }}
      >
        {/* pin tacka */}
        {note.pinned && (
          <div style={{
            position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
            width: 14, height: 14, borderRadius: "50%",
            background: color.tag, border: `2px solid ${color.dark}`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
          }} />
        )}
        {/* selotejp*/}
        <div style={{
          position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
          width: 40, height: 14, borderRadius: 3,
          background: `${color.border}99`, border: `1px solid ${color.border}`,
          display: note.pinned ? "none" : "block"
        }} />

        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 15,
          color: color.dark,
          marginBottom: 8,
          marginTop: 6,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{note.title || "Untitled"}</div>

        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 13,
          color: color.dark + "CC",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{note.content}</div>

        {/* color chip */}
        <div style={{
          position: "absolute", bottom: 10, right: 12,
          width: 10, height: 10, borderRadius: "50%",
          background: color.tag,
        }} />
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#FEF6EC",
      backgroundImage: `
        radial-gradient(circle at 10% 20%, #FFE4CC55 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, #EDD9FF55 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, #C8F5E033 0%, transparent 60%)
      `,
      fontFamily: "'Nunito', sans-serif",
      padding: "0 0 60px",
    }}>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Pacifico&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #FFD6E0; }
        textarea, input { font-family: 'Nunito', sans-serif !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #F9E94E; border-radius: 99px; }
      `}</style>

      {/* header */}
      <div style={{
        padding: "28px 32px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "2.5px dashed #FFD6A0",
        marginBottom: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #FFF9C4, #FFD6E0)",
            border: "2.5px solid #F9E94E",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "2px 3px 8px rgba(0,0,0,0.1)"
          }}>📝</div>
          <div>
            <div style={{ fontFamily: "'Pacifico', cursive", fontSize: 24, color: "#4A3728", lineHeight: 1 }}>
              my notes
            </div>
            
            <div id="note-count" style={{ fontSize: 11, color: "#BBA090", fontWeight: 600, letterSpacing: 1, paddingTop: 8}}>
              {notes.length} {notes.length === 1 ? "note" : "notes"} in total
              </div>
          </div>
        </div>

        {/* search */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="search notes..."
              style={{
                padding: "8px 14px 8px 32px",
                border: "2px solid #F9E94E",
                borderRadius: 99,
                background: "#FFFDF5",
                fontSize: 13,
                fontWeight: 600,
                color: "#4A3728",
                outline: "none",
                width: 180,
              }}
            />
          </div>
          <button onClick={() => fetch('/Auth/Logout', { method: 'POST' }).then(() => window.location.href = '/Auth/Login')}
          style={{
            padding: "9px 18px",
            background: "linear-gradient(135deg, #FFD6E0, #FF8FAB)",
            border: "2.5px solid #f76b90",
            borderRadius: 99,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 13,
            color: "#964261",
            cursor: "pointer",
            boxShadow: "2px 3px 0px #ce2c62",
            }}
            >👋 logout
          </button>

          <button
            onClick={() => setShowNew(true)}
            style={{
              padding: "9px 18px",
              background: "linear-gradient(135deg, #FFF9C4, #F9E94E)",
              border: "2.5px solid #F0D800",
              borderRadius: 99,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              color: "#5A4800",
              cursor: "pointer",
              boxShadow: "2px 3px 0px #D4B800",
              transition: "transform 0.1s, box-shadow 0.1s",
              display: "flex", alignItems: "center", gap: 5,
            }}
            onMouseDown={e => { e.currentTarget.style.transform = "translateY(2px)"; e.currentTarget.style.boxShadow = "0px 1px 0px #D4B800"; }}
            onMouseUp={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "2px 3px 0px #D4B800"; }}
          >
            ✏️ new note
          </button>
          
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 120px)" }}>
        
        {/* notes Grid */}
        <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>
          {pinned.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: 2,
                color: "#BBA090", marginBottom: 20, textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                📌 pinned
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 28,
              }}>
                {pinned.map((note, i) => <NoteCard key={note.id} note={note} idx={i} />)}
              </div>
            </div>
          )}

          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <div style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: 2,
                  color: "#BBA090", marginBottom: 20, textTransform: "uppercase",
                }}>
                  ✏️ all notes
                </div>
              )}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 28,
              }}>
                {unpinned.map((note, i) => <NoteCard key={note.id} note={note} idx={i} />)}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 80, color: "#BBA090" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🕊️</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>nothing here yet</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>add a new note to get started!</div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {(activeNote || editingNote) && (
          <div style={{
            width: 340,
            borderLeft: "2.5px dashed #FFD6A0",
            padding: "28px 24px",
            background: "#FFFDF8",
            animation: "slideIn 0.2s ease",
          }}>
            <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>

            {(() => {
              const note = editingNote || activeNote;
              const color = COLORS[note.colorIdx];
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {COLORS.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (editingNote) setEditingNote({ ...editingNote, colorIdx: i });
                            else {
                              const updated = { ...note, colorIdx: i };
                              setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
                              setActiveNote(updated);
                            }
                          }}
                          style={{
                            width: 18, height: 18, borderRadius: "50%",
                            background: c.tag, cursor: "pointer",
                            border: note.colorIdx === i ? `2px solid ${c.dark}` : "2px solid transparent",
                            transition: "transform 0.15s",
                            transform: note.colorIdx === i ? "scale(1.2)" : "scale(1)",
                          }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => { setActiveNote(null); setEditingNote(null); }}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 18, color: "#BBA090", padding: "2px 4px",
                      }}
                    >✕</button>
                  </div>

                  {/* Title */}
                  {editingNote ? (
                    <input
                      value={editingNote.title}
                      onChange={e => setEditingNote({ ...editingNote, title: e.target.value })}
                      style={{
                        width: "100%", border: "none", borderBottom: `2px solid ${color.border}`,
                        background: "transparent", fontSize: 20, fontWeight: 800,
                        color: color.dark, outline: "none", marginBottom: 16, padding: "4px 0",
                      }}
                    />
                  ) : (
                    <div style={{
                      fontSize: 20, fontWeight: 800, color: color.dark,
                      marginBottom: 12, lineHeight: 1.3,
                      borderBottom: `2px solid ${color.border}`, paddingBottom: 12,
                    }}>{note.title || "Untitled"}</div>
                  )}

                  {/* Content */}
                  {editingNote ? (
                    <textarea
                      value={editingNote.content}
                      onChange={e => setEditingNote({ ...editingNote, content: e.target.value })}
                      style={{
                        width: "100%", minHeight: 180, border: "none",
                        background: `${color.bg}88`, borderRadius: 8,
                        padding: 12, fontSize: 14, lineHeight: 1.7,
                        color: color.dark, outline: "none", resize: "vertical",
                      }}
                    />
                  ) : (
                    <div style={{
                      fontSize: 14, lineHeight: 1.7, color: "#6B5040",
                      whiteSpace: "pre-wrap", background: `${color.bg}88`,
                      borderRadius: 8, padding: 12, minHeight: 100,
                    }}>{note.content}</div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
                    {editingNote ? (
                      <>
                        <button onClick={saveEdit} style={btnStyle(color.tag, color.dark)}>💾 save</button>
                        <button onClick={() => setEditingNote(null)} style={btnStyle("#EEE", "#666")}>cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingNote({ ...note })} style={btnStyle(color.tag, color.dark)}>✏️ edit</button>
                        <button onClick={() => togglePin(note.id)} style={btnStyle(note.pinned ? "#FFD6E0" : "#EEE", "#555")}>
                          {note.pinned ? "📌 unpin" : "📌 pin"}
                        </button>
                        <button onClick={() => deleteNote(note.id)} style={btnStyle("#FFE0E0", "#900")}>🗑 delete</button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* New Note */}
      {showNew && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, backdropFilter: "blur(4px)",
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}
        >
          <div style={{
            background: COLORS[newNote.colorIdx].bg,
            border: `3px solid ${COLORS[newNote.colorIdx].border}`,
            borderRadius: 16, padding: 28, width: 380,
            boxShadow: "8px 12px 32px rgba(0,0,0,0.18)",
            animation: "popIn 0.2s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <style>{`@keyframes popIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }`}</style>

            <div style={{ fontFamily: "'Pacifico', cursive", fontSize: 18, color: COLORS[newNote.colorIdx].dark, marginBottom: 16 }}>
              new note ✨
            </div>

            <input
              ref={titleRef}
              value={newNote.title}
              onChange={e => setNewNote({ ...newNote, title: e.target.value })}
              placeholder="give it a title..."
              style={{
                width: "100%", border: "none",
                borderBottom: `2px solid ${COLORS[newNote.colorIdx].border}`,
                background: "transparent", fontSize: 16, fontWeight: 800,
                color: COLORS[newNote.colorIdx].dark, outline: "none",
                marginBottom: 14, padding: "4px 0",
              }}
            />

            <textarea
              value={newNote.content}
              onChange={e => setNewNote({ ...newNote, content: e.target.value })}
              placeholder="what's on your mind?"
              rows={5}
              style={{
                width: "100%", border: "none", background: `${COLORS[newNote.colorIdx].bg}CC`,
                borderRadius: 8, padding: 10, fontSize: 14, lineHeight: 1.7,
                color: COLORS[newNote.colorIdx].dark, outline: "none", resize: "none",
              }}
            />

            {/* Color picker */}
            <div style={{ display: "flex", gap: 8, margin: "14px 0 18px" }}>
              {COLORS.map((c, i) => (
                <div
                  key={i}
                  onClick={() => setNewNote({ ...newNote, colorIdx: i })}
                  style={{
                    width: 22, height: 22, borderRadius: "50%", background: c.tag,
                    cursor: "pointer",
                    border: newNote.colorIdx === i ? `2.5px solid ${c.dark}` : "2.5px solid transparent",
                    transform: newNote.colorIdx === i ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.15s",
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={addNote} style={btnStyle(COLORS[newNote.colorIdx].tag, COLORS[newNote.colorIdx].dark)}>
                ✏️ add note
              </button>
              <button onClick={() => setShowNew(false)} style={btnStyle("#EEE", "#666")}>
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* footer */}
      <div style={{
        padding: "28px 32px 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderTop: "2.5px dashed #FFD6A0",
        marginBottom: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
             <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #FFF9C4, #FFD6E0)",
              border: "2.5px solid #F9E94E",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, boxShadow: "2px 3px 8px rgba(0,0,0,0.1)"
              }}>🪴</div> 
              <div style={{ display: "flex", alignItems: "center", gap: 16, paddingLeft: 4}}>
                <div style={{ fontFamily: "'Pacifico', cursive", fontSize: 24, color: "#4A3728", lineHeight: 1 }}>
                  credits
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
                  <div style={{ fontSize: 11, color: "#BBA090", fontWeight: 600, letterSpacing: 1 }}>
                    font: Google Font (Nunito, Pacifico)
                  </div>
                  <div style={{ fontSize: 11, color: "#a17053", fontWeight: 600, letterSpacing: 1 }}>
                    favicon: <a href="https://www.flaticon.com/free-icons/post-it" >Flaticon</a>
                  </div>
                  <div style={{ fontSize: 11, color: "#a17053", fontWeight: 600, letterSpacing: 1 }}>
                    <a href="mailto:sofdev.c@gmail.com" >Feedback</a>
                  </div>
                  <div style={{ fontSize: 11, color: "#BBA090", fontWeight: 600, letterSpacing: 1 }}>
                    brought to life by S.T.
                  </div>
                </div>
              </div>
          </div>
      </div>
    </div>
  );
}


function btnStyle(bg, color) {
  return {
    padding: "8px 14px",
    background: bg,
    border: "none",
    borderRadius: 99,
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    color,
    cursor: "pointer",
    transition: "opacity 0.15s",
  };
}