using monk_mode_backend.Domain;
using monk_mode_backend.Models;

namespace monk_mode_backend.Application {
    public interface ITokenService {
        public Task<TokenDTO> CreateTokenAsync(ApplicationUser user);
    }
}
