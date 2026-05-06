namespace NotesApp.Models
{
    public class Note
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Content { get; set; } = "";
        public int ColorIdx { get; set; }
        public bool Pinned { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string UserId { get; set; } = "";
    }
}