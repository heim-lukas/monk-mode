using AutoMapper;
using monk_mode_backend.Domain;
using monk_mode_backend.Models;

namespace monk_mode_backend.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<TimeBlock, TimeBlockDTO>().ReverseMap();
            CreateMap<Friendship, FriendshipDTO>();
            CreateMap<UserTask, TaskDTO>().ReverseMap();
            CreateMap<UserTask, CreateTaskDTO>().ReverseMap();
            CreateMap<UserTask, UpdateTaskDTO>().ReverseMap();
        }
    }
}
