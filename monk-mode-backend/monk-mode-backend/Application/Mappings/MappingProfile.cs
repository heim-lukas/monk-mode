﻿using AutoMapper;
using monk_mode_backend.Domain;
using monk_mode_backend.Models;

namespace monk_mode_backend.Application.Mappings {
    public class MappingProfile : Profile {
        public MappingProfile() {
            CreateMap<TimeBlock, TimeBlockDTO>().ReverseMap();
        }
    }
}
