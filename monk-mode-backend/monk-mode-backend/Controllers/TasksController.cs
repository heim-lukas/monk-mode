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
        // Create a new task
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDTO createDto)
        {
            if (createDto == null || string.IsNullOrWhiteSpace(createDto.Title))
                return BadRequest("Title is required.");

            // Check if DueDate exists and is in the past
            if (createDto.DueDate.HasValue && createDto.DueDate.Value.Date < DateTime.Today)
            {
                return BadRequest("Due Date must be today or in the future.");
            }

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
        // Return all tasks for the logged-in user
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
        // Return a single task by id
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

        // GET: api/tasks/incomplete
        // Return all incomplete tasks for the logged-in user
        [HttpGet("incomplete")]
        public async Task<IActionResult> GetIncompleteTasks() {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var incompleteTasks = await _dbContext.Set<UserTask>()
                .Where(t => t.UserId == user.Id && !t.IsCompleted)  // Filter by user and incomplete tasks
                .ToListAsync();

            var tasksDto = _mapper.Map<List<TaskDTO>>(incompleteTasks);
            return Ok(tasksDto);
        }

        // PUT: api/tasks/{id}
        // Update a task (mark complete or reopen)
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

            // Save previous completed status
            bool wasCompleted = task.IsCompleted;

            // Update fields
            task.Title = updateDto.Title;
            task.Description = updateDto.Description;
            task.DueDate = updateDto.DueDate;

            // Update complete status logic
            if (!wasCompleted && updateDto.IsCompleted)
            {
                task.IsCompleted = true;
                task.CompletedAt = DateTime.Now;
            }
            else if (wasCompleted && !updateDto.IsCompleted)
            {
                task.IsCompleted = false;
                task.CompletedAt = null;
            }
            else
            {
                task.IsCompleted = updateDto.IsCompleted;
            }

            _dbContext.Update(task);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/tasks/{id}
        // Delete a task
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
        // Link a task to a time block
        [HttpPost("{id}/link/{timeblockId}")]
        public async Task<IActionResult> LinkTask(int id, int timeblockId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            // Check if the time block exists and belongs to the user
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
        // Unlink a task from a time block
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
