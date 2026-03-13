using System.ComponentModel.DataAnnotations;

namespace Team2GroupProject.Users.Dto
{
    public class ChangeUserLanguageDto
    {
        [Required]
        public string LanguageName { get; set; }
    }
}