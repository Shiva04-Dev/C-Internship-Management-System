namespace C__Internship_Management_Program.Extensions
{
    public static class DateTimeExtensions
    {
        // Client-supplied dates without an explicit UTC offset arrive with Kind=Unspecified,
        // which Npgsql rejects when writing to a `timestamp with time zone` column. The
        // frontend always sends UTC, so an unspecified Kind is treated as already-UTC
        // rather than converted from local time.
        public static DateTime EnsureUtc(this DateTime dateTime) =>
            dateTime.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
                : dateTime.ToUniversalTime();

        public static DateTime? EnsureUtc(this DateTime? dateTime) =>
            dateTime.HasValue ? dateTime.Value.EnsureUtc() : null;
    }
}
