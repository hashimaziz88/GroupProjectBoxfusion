using System.Security.Cryptography;
using System.Text;

namespace Team2GroupProject.DataSentinel
{
    public static class DataSentinelHashingHelper
    {
        public static string ComputeSha256(string value)
        {
            var normalized = value ?? string.Empty;
            var bytes = Encoding.UTF8.GetBytes(normalized);
            var hash = SHA256.HashData(bytes);

            var builder = new StringBuilder(hash.Length * 2);
            foreach (var b in hash)
            {
                builder.AppendFormat("{0:x2}", b);
            }

            return builder.ToString();
        }
    }
}
