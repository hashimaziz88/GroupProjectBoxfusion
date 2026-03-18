using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    /// <summary>
    /// Captures why a specific batch item was rejected.
    /// </summary>
    public class ActivityEventIngestionErrorDto
    {
        /// <summary>
        /// Zero-based index of the rejected item in the original batch payload.
        /// </summary>
        public int ItemIndex { get; set; }

        /// <summary>
        /// One or more validation or mapping errors for the item.
        /// </summary>
        public List<string> Errors { get; set; } = new List<string>();
    }
}
