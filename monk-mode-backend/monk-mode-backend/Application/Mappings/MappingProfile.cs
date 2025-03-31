using AutoMapper;
using monk_mode_backend.Domain;
using monk_mode_backend.Models;

namespace monk_mode_backend.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Bereits vorhandenes Mapping für TimeBlock
            CreateMap<TimeBlock, TimeBlockDTO>().ReverseMap();
            CreateMap<Friendship, FriendshipDTO>();

            // Neue Mappings für UserTask und DTOs
            CreateMap<UserTask, TaskDTO>().ReverseMap();
            CreateMap<UserTask, CreateTaskDTO>().ReverseMap();
            CreateMap<UserTask, UpdateTaskDTO>().ReverseMap();
        }
    }
}
