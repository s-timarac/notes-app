# 📝 my notes

A personal sticky notes app with a cutesy pastel design. I built as a learning project from scratch.

## what it does
- You can create, edit, pin and delete notes
- Each note has a color, tape/pin decoration, and a slight rotation animation
- Private accounts! Every user only sees their own notes
- A login & register screen with a frosted glass overlay screen
- Notes are saved to a real database

## tech stack
- **Frontend:** React (Vite), plain CSS
- **Backend:** ASP.NET Core MVC (.NET 8)
- **Database:** SQL Server LocalDB via Entity Framework Core
- **Auth:** Cookie-based authentication with SHA-256 password hashing

## how it was built
1. Designed the UI as a React app using Vite
2. Integrated the React build into an ASP.NET MVC project
3. Set up Entity Framework with LocalDB
4. Built REST API endpoints for notes (GET, POST, PUT, DELETE)
5. Added user accounts and login/register system
6. Filtered notes per user for privacy
