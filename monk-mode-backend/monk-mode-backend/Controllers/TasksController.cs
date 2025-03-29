using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using monk_mode_backend.Domain;
using monk_mode_backend.Infrastructure;
using monk_mode_backend.Models;

namespace monk_mode_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly MonkModeDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;

        public TasksController(MonkModeDbContext dbContext, UserManager<ApplicationUser> userManager, IMapper mapper)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _mapper = mapper;
        }

        // POST: api/tasks
        // Erstellt eine neue Task
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDTO createDto)
        {
            if (createDto == null || string.IsNullOrWhiteSpace(createDto.Title))
                return BadRequest("Title is required.");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var task = _mapper.Map<UserTask>(createDto);
            task.UserId = user.Id;
            task.IsCompleted = false;
            task.CreatedAt = DateTime.Now;
            task.CompletedAt = null;

            _dbContext.Add(task);
            await _dbContext.SaveChangesAsync();

            var resultDto = _mapper.Map<TaskDTO>(task);
            return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, resultDto);
        }

        // GET: api/tasks
        // Gibt alle Tasks des eingeloggten Users zurück
        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var tasks = await _dbContext.Set<UserTask>()
                .Where(t => t.UserId == user.Id)
                .ToListAsync();

            var tasksDto = _mapper.Map<List<TaskDTO>>(tasks);
            return Ok(tasksDto);
        }

        // GET: api/tasks/{id}
        // Gibt eine einzelne Task zurück
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaskById(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var task = await _dbContext.Set<UserTask>()
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == user.Id);
            if (task == null)
                return NotFound();

            var taskDto = _mapper.Map<TaskDTO>(task);
            return Ok(taskDto);
        }

        // PUT: api/tasks/{id}
        // Aktualisiert eine Task, inklusive dem Abschluss oder Wiederöffnen
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDTO updateDto)
        {
            if (updateDto == null || string.IsNullOrWhiteSpace(updateDto.Title))
                return BadRequest("Title is required.");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var task = await _dbContext.Set<UserTask>()
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == user.Id);
            if (task == null)
                return NotFound();

            // Vorherigen Status merken
            bool wasCompleted = task.IsCompleted;

            // Felder aktualisieren
            task.Title = updateDto.Title;
            task.Description = updateDto.Description;
            task.DueDate = updateDto.DueDate;

            // Logik zum Aktualisieren des Abschlussstatus:
            if (!wasCompleted && updateDto.IsCompleted)
            {
                // Task wird abgeschlossen
                task.IsCompleted = true;
                task.CompletedAt = DateTime.Now;
            }
            else if (wasCompleted && !updateDto.IsCompleted)
            {
                // Task wird wieder geöffnet
                task.IsCompleted = false;
                task.CompletedAt = null;
            }
            else
            {
                // Keine Statusänderung, aber wir setzen den Wert dennoch
                task.IsCompleted = updateDto.IsCompleted;
            }

            _dbContext.Update(task);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/tasks/{id}
        // Löscht eine Task
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var task = await _dbContext.Set<UserTask>()
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == user.Id);
            if (task == null)
                return NotFound();

            _dbContext.Remove(task);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/tasks/{id}/link/{timeblockId}
        // Verknüpft eine Task mit einem TimeBlock
        [HttpPost("{id}/link/{timeblockId}")]
        public async Task<IActionResult> LinkTask(int id, int timeblockId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            // Prüfe, ob der TimeBlock existiert und dem User gehört
            var timeBlock = await _dbContext.TimeBlocks
                .FirstOrDefaultAsync(tb => tb.Id == timeblockId && tb.UserId == user.Id);
            if (timeBlock == null)
                return NotFound("TimeBlock not found or not owned by user.");

            var task = await _dbContext.Set<UserTask>()
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == user.Id);
            if (task == null)
                return NotFound("Task not found.");

            task.TimeBlockId = timeblockId;
            _dbContext.Update(task);
            await _dbContext.SaveChangesAsync();

            return Ok();
        }

        // POST: api/tasks/{id}/unlink
        // Entfernt die Verknüpfung zu einem TimeBlock
        [HttpPost("{id}/unlink")]
        public async Task<IActionResult> UnlinkTask(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var task = await _dbContext.Set<UserTask>()
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == user.Id);
            if (task == null)
                return NotFound("Task not found.");

            task.TimeBlockId = null;
            _dbContext.Update(task);
            await _dbContext.SaveChangesAsync();

            return Ok();
        }
    }
}
