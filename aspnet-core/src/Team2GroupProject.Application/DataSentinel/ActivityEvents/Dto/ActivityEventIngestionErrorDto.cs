using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class ActivityEventIngestionErrorDto
    {
        public int ItemIndex { get; set; }

        public List<string> Errors { get; set; } = new List<string>();
    }
}
