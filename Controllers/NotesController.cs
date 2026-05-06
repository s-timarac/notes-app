using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesApp.Models;
using Microsoft.AspNetCore.Authorization;

namespace NotesApp.Controllers
{
    [Authorize]
    public class NotesController : Controller
    {
        private readonly NotesDbContext _context;

        public NotesController(NotesDbContext context)
        {
            _context = context;
        }

        
        public IActionResult NotesApp()
        {
            return PhysicalFile(
                Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "notes-app", "index.html"),
                "text/html"
            );
        }

        [HttpGet("/api/notes")]
        public async Task<IActionResult> GetNotes()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var notes = await _context.Notes.Where(n => n.UserId == userId).ToListAsync();
            return Json(notes);
        }

        [HttpPost("/api/notes")]
        public async Task<IActionResult> CreateNote([FromBody] Note note)
        {
            note.UserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
            note.CreatedAt = DateTime.UtcNow;
            _context.Notes.Add(note);
            await _context.SaveChangesAsync();
            return Json(note);
        }

        [HttpPut("/api/notes/{id}")]
        public async Task<IActionResult> UpdateNote(int id, [FromBody] Note updated)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
            if (note == null) return NotFound();
            note.Title = updated.Title;
            note.Content = updated.Content;
            note.ColorIdx = updated.ColorIdx;
            note.Pinned = updated.Pinned;
            await _context.SaveChangesAsync();
            return Json(note);
        }

        [HttpDelete("/api/notes/{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
            if (note == null) return NotFound();
            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}