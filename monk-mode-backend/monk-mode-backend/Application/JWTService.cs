using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using monk_mode_backend.Domain;
using monk_mode_backend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace monk_mode_backend.Application {
    public class JWTService : ITokenService {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly IConfiguration configuration;

        public JWTService(UserManager<ApplicationUser> userManager, IConfiguration configuration) {
            this.userManager = userManager;
            this.configuration = configuration;
        }

        public async Task<TokenDTO> CreateTokenAsync(ApplicationUser user) {

            var userRoles = await userManager.GetRolesAsync(user);
            var authClaims = new List<Claim>
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };


            foreach (string userRole in userRoles) {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }


            var authSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(this.configuration.GetSection("JwtSettings")["Secret"]!));
            var token = new JwtSecurityToken(
                expires: DateTime.Now.AddDays(15),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );
            return new TokenDTO() {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo,
                roles = userRoles,
                id = user.Id
            };
        }

    }
}
