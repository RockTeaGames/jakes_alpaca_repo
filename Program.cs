using System;
using Alpaca.Markets;
using System.Threading.Tasks;

namespace AlpacaExample
{
    internal static class Program
    {
        private const String KEY_ID = "PKRWGNPNNCEZ4SQCBO3Y";

        private const String SECRET_KEY = "8FZTsX1r2aH8c1kewUvIqb0bwPBtpfoqTUgkUvG0";

        public static async Task Main()
        {
            var client = Environments.Paper
                .GetAlpacaTradingClient(new SecretKey(KEY_ID, SECRET_KEY));

            var clock = await client.GetClockAsync();

            if (clock != null)
            {
                Console.WriteLine(
                    "Timestamp: {0}, NextOpen: {1}, NextClose: {2}",
                    clock.TimestampUtc, clock.NextOpenUtc, clock.NextCloseUtc);
            }
        }
    }
}