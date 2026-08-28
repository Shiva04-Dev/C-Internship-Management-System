namespace C__Internship_Management_Program.Extensions
{
    public static class DateTimeExtensions
    {
        // Npgsql rejects Kind=Unspecified on a `timestamp with time zone` column, so treat
        // it as already-UTC (the frontend always sends UTC) rather than convert it.
        public static DateTime EnsureUtc(this DateTime dateTime) =>
            dateTime.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
                : dateTime.ToUniversalTime();

        public static DateTime? EnsureUtc(this DateTime? dateTime) =>
            dateTime.HasValue ? dateTime.Value.EnsureUtc() : null;
    }
}
