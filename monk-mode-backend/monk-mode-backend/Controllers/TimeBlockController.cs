﻿using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using monk_mode_backend.Domain;
using monk_mode_backend.Infrastructure;
using monk_mode_backend.Models;

namespace monk_mode_backend.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TimeBlockController : ControllerBase {
        private readonly MonkModeDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;

        public TimeBlockController(MonkModeDbContext context, UserManager<ApplicationUser> userManager, IMapper mapper) {
            _dbContext = context;
            _userManager = userManager;
            _mapper = mapper;
        }

        // POST /time-blocks
        [HttpPost]
        public async Task<IActionResult> CreateTimeBlock([FromBody] TimeBlockDTO timeBlockData) {
            if (timeBlockData == null)
                return BadRequest("Invalid time block data.");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var timeBlock = _mapper.Map<TimeBlock>(timeBlockData); // AutoMapper maps DTO to Entity

            timeBlock.UserId = user.Id; // Set the user ID manually

            _dbContext.TimeBlocks.Add(timeBlock);
            await _dbContext.SaveChangesAsync();

            var timeBlockDTO = _mapper.Map<TimeBlockDTO>(timeBlock); // Map the entity back to DTO

            return CreatedAtAction(nameof(GetTimeBlockById), new { id = timeBlock.Id }, timeBlockDTO);
        }

        // GET /time-blocks
        [HttpGet]
        public async Task<IActionResult> GetAllTimeBlocks() {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var timeBlocks = await _dbContext.TimeBlocks
                .Where(tb => tb.UserId == user.Id)
                .ToListAsync();

            var timeBlockDTOs = _mapper.Map<List<TimeBlockDTO>>(timeBlocks); // Map list of entities to DTOs

            return Ok(timeBlockDTOs);
        }

        // GET /time-blocks/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTimeBlockById(int id) {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var timeBlock = await _dbContext.TimeBlocks
                .FirstOrDefaultAsync(tb => tb.UserId == user.Id && tb.Id == id);

            if (timeBlock == null)
                return NotFound();

            var timeBlockDTO = _mapper.Map<TimeBlockDTO>(timeBlock); // Map entity to DTO

            return Ok(timeBlockDTO);
        }

        // PUT /time-blocks/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTimeBlock(int id, [FromBody] TimeBlockDTO timeBlockData) {
            if (timeBlockData == null)
                return BadRequest("Invalid time block data.");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var timeBlock = await _dbContext.TimeBlocks
                .FirstOrDefaultAsync(tb => tb.UserId == user.Id && tb.Id == id);

            if (timeBlock == null)
                return NotFound();

            _mapper.Map(timeBlockData, timeBlock); // Map DTO to entity

            _dbContext.TimeBlocks.Update(timeBlock);
            await _dbContext.SaveChangesAsync();

            return NoContent();  // 204 No Content
        }

        // DELETE /time-blocks/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTimeBlock(int id) {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var timeBlock = await _dbContext.TimeBlocks
                .FirstOrDefaultAsync(tb => tb.UserId == user.Id && tb.Id == id);

            if (timeBlock == null)
                return NotFound();

            _dbContext.TimeBlocks.Remove(timeBlock);
            await _dbContext.SaveChangesAsync();

            return NoContent();  // 204 No Content
        }
    }
}
